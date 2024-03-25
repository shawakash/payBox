global:
  scrape_interval: 4s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ["${API_ADDRESS}", "${WS_ADDRESS}"]