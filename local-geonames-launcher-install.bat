call npm install
node local-geonames-manager-cli -download ES
node local-geonames-manager-cli -add ES
start "" http://localhost:9200/geonames/geoname/_search?q=Madrid