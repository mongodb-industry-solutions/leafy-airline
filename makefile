# ====================================================
# Project Configuration
# ====================================================

# General
PROJECT_ID = your-gcp-project-id
REGION = your-gcp-project-region

# Backend (FastAPI)
BACKEND_IMAGE = your-backend-image-name
BACKEND_URI = gcr.io/$(PROJECT_ID)/$(BACKEND_IMAGE)
ENV_VARS_BACKEND = MONGO_URI="your-connection-string",MONGODB_DB="your-db-name"

# Frontend (Next.js)
FRONTEND_IMAGE = your-frontend-image-name
FRONTEND_URI = gcr.io/$(PROJECT_ID)/$(FRONTEND_IMAGE)
ENV_VARS_FRONTEND = GOOGLE_MAPS_API_KEY="your-google-maps-api-key",MONGODB_DB="your-db-name",SIMULATED_MODE="true",MONGO_URI="your-connection-string"

# ====================================================
# Local Development Commands
# ====================================================

build:
	docker-compose up --build -d

start:
	docker-compose start

stop:
	docker-compose stop

clean:
	docker-compose down --rmi all -v

seed-local:
	docker exec -it frontend_dashboard npm run mongo-seed

local-all: clean build start seed-local

# ====================================================
# Google Cloud Build + Deploy
# ====================================================

# --- Build backend and frontend images locally
build-cloud:
	docker build -f Dockerfile.backend -t $(BACKEND_IMAGE) .
	docker build -f Dockerfile.frontend -t $(FRONTEND_IMAGE) .

# --- Tag images for Google Container Registry
tag-cloud:
	docker tag $(BACKEND_IMAGE) $(BACKEND_URI):latest
	docker tag $(FRONTEND_IMAGE) $(FRONTEND_URI):latest

# --- Push images to Google Container Registry
push-cloud:
	gcloud builds submit --config=cloudbuild.backend.yaml .
	gcloud builds submit --config=cloudbuild.frontend.yaml .


# --- Deploy backend and capture its URL
BACKEND_DEPLOY:
	@echo "Deploying backend..."
	gcloud run deploy $(BACKEND_IMAGE) \
		--image=$(BACKEND_URI):latest \
		--region=$(REGION) \
		--platform=managed \
		--project=$(PROJECT_ID) \
		--allow-unauthenticated \
		--set-env-vars $(ENV_VARS_BACKEND)
	@echo "Fetching backend regional URL..."
	$(eval PROJECT_NUMBER := $(shell gcloud projects describe $(PROJECT_ID) --format='value(projectNumber)'))
	@echo "https://$(BACKEND_IMAGE)-$(PROJECT_NUMBER).$(REGION).run.app" > backend_url.txt
	@echo "Backend URL: $$(cat backend_url.txt)"

# --- Deploy frontend using the backend URL
FRONTEND_DEPLOY:
	$(eval BACKEND_URL := $(shell cat backend_url.txt))
	@echo "Deploying frontend with BACKEND_URL=$(BACKEND_URL)"
	gcloud run deploy $(FRONTEND_IMAGE) \
		--image=$(FRONTEND_URI):latest \
		--region=$(REGION) \
		--platform=managed \
		--project=$(PROJECT_ID) \
		--allow-unauthenticated \
		--set-env-vars $(ENV_VARS_FRONTEND),SIMULATION_APP_URL=$(BACKEND_URL)

# --- Full deployment
deploy-cloud: BACKEND_DEPLOY FRONTEND_DEPLOY

# --- Full GCP pipeline (build, tag, push, deploy)
cloud-all: build-cloud tag-cloud push-cloud deploy-cloud

# --- Clean local Docker images
clean-cloud:
	docker rmi $(BACKEND_IMAGE) || true
	docker rmi $(FRONTEND_IMAGE) || true
	docker rmi $(BACKEND_URI) || true
	docker rmi $(FRONTEND_URI) || true
