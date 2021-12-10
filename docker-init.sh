cp -r docker-compose-ex.yml docker-compose.yml
docker-compose down --volumes --remove-orphans
docker-compose up -d --build
sh init-database.sh