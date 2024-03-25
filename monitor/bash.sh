set -a; source .env; set +a; envsubst < prometheus.yml.tpl > prometheus.yml
docker-compose up -d