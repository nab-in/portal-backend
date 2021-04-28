cp -r docker-compose-ex.yml docker-compose.yml
docker-compose down
docker-compose up -d
sh init-database.sh