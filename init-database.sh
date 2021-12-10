echo 'Stopping the API Container'
docker container stop portal-api
echo 'Creating database'
docker exec portal-db psql -h localhost -U postgres -c "CREATE DATABASE portal;"
echo 'Starting the API Container'
docker container start portal-api
