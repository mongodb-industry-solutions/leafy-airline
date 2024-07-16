build:
	docker build -t simulation-app .

start: 
	docker run -p 8000:8000 -d simulation-app

stop:
	docker-compose stop

clean:
	docker-compose down --rmi all -v