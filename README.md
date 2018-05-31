<div style="background-color:#ddd"><img src="icons/iconCircle.png?raw=true" width="100"/></div>

# Local Geonames Manager

Import Geoname data to Elastic and enjoy millions of searchable locations in your app.

[Geonames](http://www.geonames.org/) is the most comprehensive open source geo location data source with
more than 11 million location points. Each location comes with a wealth of
information and can be searched in both English and local languages.

[Elasticsearch](https://www.elastic.co/) is the leading open source search engine.

Local Geonames Manager connects these powers together and geo-enables your app 
without api restrictions. Local Geonames Manager allows you to import easily geo data into elasticsearch.
This process can be done by using a console aplication called local-geonames-manager-cli.js (included in this repository)

## Features
* Blazing fast buffered import with batch indexing in elastic
* Filter unwanted data based on their type (city / country etc)
* Elastic schema included

## Pre-requisites
To make it work you must install the following open-source software:
* Node.js. You can download from  [https://nodejs.org/es/download/](https://nodejs.org/es/download/)
* Elasticsearch. You can download from [https://www.elastic.co/downloads/elasticsearch](https://www.elastic.co/downloads/elasticsearch)

Don´t be afraid! Default installation works!

## Local Geonames Manager Installation

```
$ npm install
```

### Add schema to elasticsearch (default installation does not required this step)

```
$ curl -XPUT http://127.0.0.1:9200/geonames -d @data/schema.json
```

## Usage

### Using the command line tool
Use the included command line tool to download all data files

```
$ node local-geonames-manager-cli -downloadall
```

then add all files to elastic

```
$ node local-geonames-manager-cli -addall
```

You can also download and add individual countries, e.g. for Spain

```
$ node local-geonames-manager-cli -download ES
```

and add it

```
$ node local-geonames-manager-cli -add ES
```

#### Searching

After adding data, you can try searching as you do with elasticsearch API:

```
http://localhost:9200/geonames/geoname/_search?q=Madrid
```

## Removing all data

If you need to reset all geonames data you can set the following request:
```
$ curl -XDELETE localhost:9200/geonames
```

## Configuration

No configuration is necessary if elastic runs on localhost port 9200 and
you're fine with using geonames/geoname as index/type in elastic.

Otherwise you can edit data/cli-config.json or use environment variables:
```
$ export ELASTIC_URL="localhost:9200"
$ export ELASTIC_PATH="geonames/geoname"
$ export DATAPATH="/tmp/"
$ node local-geonames-manager-cli -download ES
```

* ELASTIC_URL: Address to connect to your elastic instance
* ELASTIC_PATH: Where to store data in elastic INDEX/TYPE, e.g. geonames/geoname
* DATAPATH: Path were to download and extract data files, defaults to temp directory

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2018 Miguel A. Rozalén
