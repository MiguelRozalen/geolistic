#!/usr/bin/env node

/**
 * Geonames Local Manager command line tool
 *
 * Copyright (c) 2018 Miguel A. Rozalén
 */
'use strict';

var config,
    testMode = (process.env.TEST ? true : false);

try {config = require('./data/cli-config.json')} catch (ex) {config = {}};

var elasticUrl = process.env.ELASTIC_URL || config["elasticUrl"] || "127.0.0.1:9200",
    elasticPath = process.env.ELASTIC_PATH || config["elasticPath"] || "geonames/geoname",
    dataPath = process.env.DATAPATH || config["dataPath"];  // no default for dataPath, as the library handles it with os.tmpdir()

elasticUrl = elasticUrl.replace(/^(https\:\/\/|http\:\/\/)/, "");
elasticUrl = elasticUrl.replace("/", "");

// We only init with dataPath
// elastic is only set later if needed and after we've connected to it
var options = {};
if (dataPath) {
    options.dataPath = dataPath;
}

const elasticsearch = require('elasticsearch'),
    parse = require('csv-parse'),
    fs = require('fs'),
    transform = require('stream-transform'),
    geolocalmanager = require('./lib').init(options);

const NS_PER_SEC = 1e9;

var processTime,
    db = null,
    countryCode = null,
    searchString = null,
    doHelp = false,
    doAdd = false,
    doDownload = false,
    doSearch = false,
    bufferRecords = null,
    fclasses = null;

function _dbConnect(cb) {

    db = testMode ?
    {close: function () {}, ping: function (args, fn) {fn(null);}} :
        new elasticsearch.Client({
            host: elasticUrl,
            log: []
        });

    db.ping({}, function (err) {

        if (err) {
            console.error("Error connecting to elastic, check your config");
            console.error(err);
            db.close();
            return;
        }

        (cb ? cb() : null);

    });

}

function _add(countries) {

    _dbConnect(function () {

        try {

            geolocalmanager.config({
                elasticClient: db,
                elasticPath: elasticPath
            });

        } catch (err) {

            console.error(err);
            db.close();
            return;
        }

        var options = {
            "bufferAdded": function(records) {

                var mem = process.memoryUsage().heapUsed;

                if (mem > 1000000) {
                    mem = parseInt(mem/1000000) + 'm';
                } else if (mem > 1000) {
                    mem = parseInt(mem/1000) + 'k';
                } else {
                    mem = mem + 'b';
                }

                var diffTime = process.hrtime(processTime);

                var recordsPerSec = parseInt(records / (diffTime[0] + (diffTime[1]/NS_PER_SEC)));

                process.stdout.write("\rProcessed " + records + " records (" + mem + " mem, " +
                    diffTime[0] + ":" + parseInt(diffTime[1]/1000000) +" elapsed " +
                    recordsPerSec + " records/sec) ");

            }};

        if (fclasses) {
            options.classFilters = fclasses;
        }
        if (bufferRecords) {
            options.bufferRecords = bufferRecords;
        }

        var allProcessed = 0,
            allAdded = 0;

        (function addCountry(index) {
            index = index || 0;

            if (!countries[index]) {

                console.log("All done with %d processed and %d added records",
                    allProcessed,
                    allAdded);

                if (db) {
                    db.close();
                }
                return;

            }

            processTime = process.hrtime();

            geolocalmanager.addFileToElastic(countries[index], options, function (err, result) {

                if (err) {

                    console.error(err);

                } else {

                    console.log("\n%s finished with %d processed and %d added records",
                        countries[index],
                        result.processed,
                        result.added);

                    allProcessed += result.processed;
                    allAdded += result.added;

                    addCountry(index + 1);
                }

            });

        })();

    });

}

var args = process.argv.slice(2);

for (var i = 0; i < args.length; i += 1) {

    if (args[i] === '-help' || args[i] === '--help') {

        doHelp = true;

    } else if (args[i] === '-addall') {

        doAdd = true;
        fclasses = [];

    } else if (args[i] === '-add') {

        doAdd = true;
        fclasses = [];

        if (args.length < (i + 1)) {
            console.error("Missing argument: countryCode");
            process.exit(0);
        }

        i += 1;

        countryCode = args[i];
        if (countryCode === '00') {
            testMode = true;
        }

    } else if (args[i] === '-downloadall') {

        doDownload = true;

    } else if (args[i] === '-buffer') {

        if (args.length < (i + 1)) {
            console.error("Missing argument: buffer size");
            process.exit(0);
        }

        i += 1;

        bufferRecords = +args[i];

    } else if (args[i] === '-download') {

        doDownload = true;

        if (args.length < (i + 1)) {
            console.error("Missing argument: countryCode");
            process.exit(0);
        }

        i += 1;

        countryCode = args[i];

    } else if (args[i] === '-search') {

        doSearch = true;

        if (args.length < (i + 1)) {
            console.error("Missing argument: search string");
            process.exit(0);
        }

        i += 1;

        searchString = args[i];

    } else {

        if (fclasses) {
            fclasses[fclasses.length] = args[i];
            continue;
        } else {

            console.warn("Unknown argument '" + args[i] + "'");

        }

    }

}

if (doHelp || (!doAdd && !doDownload && !doSearch)) {

    console.log("Usage: node geonames-local-manager-cli [OPTION]\n" +
        "Download or index geoname files in elastic\n" +
        "\n" +
        "Valid arguments:\n" +
        "  -download <country code>       Download specified country geoname file\n" +
        "  -downloadall                   Download all country geoname files\n" +
        "  -add <country code> [fclasses] Index specified country geoname file\n" +
        "  -addall [fclasses]             Index all country geoname files\n" +
        "  -buffer <records>              Buffer size in records (only for add operations), defaults to 1000\n" +
        "\n" +
        "For valid fclasses see http://www.geonames.org/export/codes.html\n" +
        "  A - country, state, region\n" +
        "  P - city, village\n" +
        "  etc...\n" +
        "\n" +
        "Example: node local-geonames-manager-cli -add NO P A"
    );

    return;

}

if (doDownload || doAdd) {

    var getCountries;

    if (countryCode) {
        getCountries = function (fn) {
            fn(null, [countryCode]);
        };
    } else {
        getCountries = function (fn) {
            geolocalmanager.getGeoNameCountries(fn);
        };
    }

    getCountries(function (err, countries) {

        if (err) {
            console.error("Error getting countries: " + err);
        } else {

            if (doDownload) {

                if (testMode) {
                    countries = ['NU'];
                }
                geolocalmanager.downloadGeoNameCountryFiles(countries, {
                    "parallelDownloads": 5,
                    "postDownload": function (files) {

                        for (var i = 0; i < files.length; i += 1) {
                            console.log("Downloaded " + files[i]);
                        }

                    },
                    "extract": true
                }, function (err, filesProcessed) {

                    if (err) {
                        console.error(err);
                    } else {
                        console.log(filesProcessed + " files downloaded and extracted");

                        if (doAdd) {
                            _add(countries);
                        }
                    }

                });

            }

            if (doAdd && !doDownload) {

                if (testMode) {
                    countries = ['00'];
                }
                _add(countries);

            }
        }
    });
} 
