build:
	docker build -t simulation-app .

start: 
	docker run --name flight-data-api -p 8000:8000 -d simulation-app

stop:
	docker stop flight-data-api

clean:
	docker rm flight-data-api || true
	docker rmi simulation-app || true