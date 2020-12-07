
build:
	docker-compose build

run-dev:
	docker-compose up --build

cli:
	docker-compose exec app npm run cli-dev

bash:
	docker-compose exec app bash

import:
	docker-compose exec app npm run cli -- import  -g id /code/fixtures/demo/records.csv /code/fixtures/demo/records-mapping.yaml
	docker-compose exec app npm run cli -- import  -g id /code/fixtures/demo/datasets.csv /code/fixtures/demo/datasets-mapping.yaml

build-prod:
	docker build -t ondrejdoktor/fairportal:latest -t ondrejdoktor/fairportal:v1.5.1 -f ./.docker/prod/Dockerfile .

run-prod:
	docker run -p 8081:8081 ondrejdoktor/fairportal:latest

bash-prod:
	docker run -it ondrejdoktor/fairportal:latest bash
