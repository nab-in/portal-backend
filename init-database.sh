echo 'Stopping the API Container'
docker container stop portal-backend_api_1
echo 'Creating database'
docker exec portal-backend_postgres-database_1 psql -h localhost -U postgres -c "CREATE DATABASE portal;"
echo 'Starting the API Container'
docker container start portal-backend_api_1
