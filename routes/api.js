/**
 * Created by MuhammadRizky on 7/18/2015.
 */

// modules
var http = require('http');
var express = require('express');
var amazon = require('amazon-product-api');
var ebay = require('ebay-api');
var yql = require('yql');

// instances
var router = express.Router();

// create amazon client
var client = amazon.createClient({
    awsId: 'AKIAJOPIJEKIXPYYGMVA',
    awsSecret: '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',
    awsTag: 'MyHackathon'
});

// call amazon api
var searchAmazon = function (key, callback) {
    client.itemSearch({
        keywords: key
    }).then(function (results) {
        //console.log(results);
        //return results;
        callback(null, results);
    }).catch(function (error) {
        console.error('ERROR! - PROCESSING SEARCH AMAZON');
        console.error(error);
        console.log(results);
        //return 'ERROR - AMAZON';
    })
};

// call ebay api
var searchEbay = function (key, callback) {

    // Construct the request
    //var ebayReqURL = "http://svcs.ebay.com/services/search/FindingService/v1"
    //    + "?OPERATION-NAME=findItemsByKeywords"
    //    + "&SERVICE-VERSION=1.0.0"
    //    + "&SECURITY-APPNAME=RedWolfa9-aac2-4fa3-a4d6-8b1731957f1"
    //    + "&GLOBAL-ID=EBAY-US"
    //    + "&RESPONSE-DATA-FORMAT=JSON"
    //    + "&callback=_cb_findItemsByKeywords"
    //    + "&REST-PAYLOAD"
    //    + "&keywords=" + (key || "")
    //    + "&paginationInput.entriesPerPage=10";

    ebay.ebayApiGetRequest({
        serviceName: 'FindingService',
        opType: 'findItemsByKeywords',
        appId: 'RedWolfa9-aac2-4fa3-a4d6-8b1731957f1',
        params: {
            'keywords': key,
            'paginationInput.entriesPerPage': 10
        }
    }, function (error, data) {
        if (error) {
            console.error('ERROR - PROCESSING SEARCH EBAY')
            console.error(error);
            console.log(data);
            //return 'ERROR - EBAY';
        }

        //console.log(data);
        //return data;
        callback(null, data);
    });
};

// The main Machine Learning Algorithm here
var calculate = function (amazonArray, ebayArray, callback) {
    var itemDataArray = [];

    //console.log(amazonArray);
    //console.log(ebayArray);

    var itemsLeftAmazonArray = amazonArray.length;
    var itemsLeftEbayArray = ebayArray.length;

    amazonArray.forEach(function (item) {
        scrapeAmazon(item, function (error, item) {
            itemsLeftAmazonArray--;

            if (error) {
                console.error('ERROR - CALCULATING AMAZON ITEM');
                console.error(error);
                console.log(item)
                //return 'ERROR - CALCULATING AMAZON ITEM';
            }

            console.log(item);
            itemDataArray.push(item);
        });
    });

    ebayArray.forEach(function (item) {
        scrapeEbay(item, function (error, item) {
            itemsLeftEbayArray--;

            if (error) {
                console.error('ERROR - CALCULATING EBAY ITEM');
                console.error(error);
                console.log(item);
                //return 'ERROR - CALCULATING EBAY ITEM';
            }

            console.log(item);
            itemDataArray.push(item);
        });
    });

    // regression algorithm! YO PHOENIX!! HELP ME!! -RIZKY
    if (itemsLeftAmazonArray === 0 && itemsLeftEbayArray === 0) {
        // TBD
    }
};

// scrape and parse HTML from Amazon's webpage using yql
var scrapeAmazon = function (data, callback) {
    this.price;
    this.numReview
    this.rating;
    //this.data = data;

    console.log(data.DetailPageURL[0]);

    var that = this;

    new yql('select * from html where url=\'' + data.DetailPageURL[0] + '\' and xpath=\'//span[contains(@id,"priceblock_ourprice")]\'')
        .exec(function (error, data) {
            if (error) {
                console.error('ERROR - SCRAPING AMAZON WEBSITE');
                console.error(error);
                console.log(data);
                return;
            }

            console.log(data);
            //console.log(that.data.DetailPageUrl);
            that.price = Number(data.query.results.span.content.replace('$', ''));
            returnCall();
        });

    new yql('select * from html where url=\'' + data.DetailPageURL[0] + '\' and xpath=\'//span[contains(@id,"acrCustomerReviewText")]\'')
        .exec(function (error, data) {
            if (error) {
                console.error('ERROR - SCRAPING AMAZON WEBSITE');
                console.error(error);
                console.log(data);
                return;
            }

            console.log(data);
            //console.log(that.data.DetailPageUrl);
            that.numReview = Number(data.query.results.span[0].content.split(' ')[0]);
            returnCall();
        });

    new yql('select * from html where url=\'' + data.DetailPageURL[0] + '\' and xpath=\'//a[contains(@class,"a-popover-trigger a-declarative")]\'')
        .exec(function (error, data) {
            if (error) {
                console.error('ERROR - SCRAPING AMAZON WEBSITE');
                console.error(error);
                console.log(data);
                return;
            }

            console.log(data);
            //console.log(that.data.DetailPageUrl);
            that.rating = Number(data.query.results.a[2].span.replace('\n', '').split(' ')[0]);
            returnCall();
        });

    var returnCall = function () {
        if (that.price && that.numReview && that.rating) {
            console.log('returnCall calling Callback');
            callback(null, new ItemData(data.ASIN, that.price, that.numReview, that.rating));
        }
    }
};

// scrape and parse HTML from Amazon's webpage using yql
var scrapeEbay = function (data, callback) {
    this.price;
    this.itemSold
    this.positiveFeedback;
    //this.data = data;

    console.log(data.viewItemURL);

    var that = this;

    new yql('select * from html where url=\'' + data.viewItemURL + '\' and xpath=\'//span[contains(@id,"a-popover-trigger a-declarative")]\'')
        .exec(function (error, data) {
            if (error) {
                console.error('ERROR - SCRAPING EBAY WEBSITE');
                console.error(error);
                console.log(data);
                return;
            }

            console.log(data);
            //console.log(that.data.viewItemURL);
            that.price = Number(data.query.results.span.content.replace('$', '').split(' ')[1]);
            returnCall();
        });

    new yql('select * from html where url=\'' + data.viewItemURL + '\' and xpath=\'//span[contains(@class,"vi-qtyS-hot-red  vi-bboxrev-dsplblk vi-qty-vert-algn vi-qty-pur-lnk")]\'')
        .exec(function (error, data) {
            if (error) {
                console.error('ERROR - SCRAPING EBAY WEBSITE');
                console.error(error);
                console.log(data);
                return;
            }

            console.log(data);
            //console.log(that.data.viewItemURL);
            that.itemSold = Number(data.query.results.span.a.content.split(' ')[0]);
            returnCall();
        });

    new yql('select * from html where url=\'' + data.viewItemURL + '\' and xpath=\'//div[contains(@id,"si-fb")]\'')
        .exec(function (error, data) {
            if (error) {
                console.error('ERROR - SCRAPING EBAY WEBSITE');
                console.error(error);
                console.log(data);
                return;
            }

            console.log(data);
            //console.log(that.data.viewItemURL);
            that.positiveFeedback = Number(data.query.results.div.content.replace('%', ' ').split(' ')[0]);
            returnCall();
        });

    var returnCall = function () {
        if (that.price && that.itemSold && that.positiveFeedback) {
            console.log('returnCall calling Callback');
            callback(null, new ItemData(data.itemId, that.price, that.itemSold, that.positiveFeedback));
        }
    }
};

// ItemData object prototype
function ItemData(_itemId, price, numReview, rating, name, picture) {
    this._itemId = _itemId;
    this.price = price;
    this.numReview = numReview;
    this.rating = rating;
    this.name = name;
    this.picture = picture;
}

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    //console.log('Time: ', Date.now());
    next();
});

// main endpoint
router.get('/input/:key', function (request, response, next) {
    console.log('input/:key endpoint is called');

    var key = request.params.key;

    if (!key) {
        console.log(key);
        console.log('Error! Keyword is invalid');
        return;
    }

    console.log(key);

    var amazonResultsArray;
    var ebayResultsArray;

    // getting inputs from various api
    searchAmazon(key, function (error, response) {
        if (error) {
            console.error(error);
            console.error('ERROR - SEARCHING AMAZON ITEM');
            return 'ERROR - SEARCHING AMAZON ITEM';
        }

        amazonResultsArray = response;
        doneCallingAmazonEbay();
    });
    searchEbay(key, function (error, response) {
        if (error) {
            console.error(error);
            console.error('ERROR - SEARCHING AMAZON ITEM');
            return 'ERROR - SEARCHING AMAZON ITEM';
        }

        ebayResultsArray = response;
        doneCallingAmazonEbay();
    });

    // calculate the result using the special algorithm
    var doneCallingAmazonEbay = function () {
        if (amazonResultsArray && ebayResultsArray) {
            calculate(amazonResultsArray, ebayResultsArray, function (error, data) {
                //if (error) {
                //    console.error("ERROR - RETURN RESULT");
                //    response.status(500).send("ERROR - RETURN RESULT");
                //    return;
                //}

                console.log('reached calculate calling stage');

                //console.log(data);
                //response.status(200).send(data);
            });
        }
    };

    next();
});

// test endpoint
router.get('/hello', function (request, response) {
    console.log('Hello World');
    response.send('Hello World');
});

// export this module
module.exports = router;