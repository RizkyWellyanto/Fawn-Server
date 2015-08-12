/**
 * Created by MuhammadRizky on 7/18/2015.
 */

// modules
var http = require('http');
var express = require('express');
var amazon = require('amazon-product-api');
var ebay = require('ebay-api');

// instances
var router = express.Router();

// create amazon client
var client = amazon.createClient({
    awsId: 'AKIAJOPIJEKIXPYYGMVA',
    awsSecret: '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',
    awsTag: 'MyHackathon'
});

// call amazon api
function searchAmazon(key) {
    client.itemSearch({
        keywords: key
    }).then(function (results) {
        console.log(results);
        return results;
    }).catch(function (error) {
        console.log(error);
        return 'ERROR - AMAZON';
    })
}

// call ebay api
function searchEbay(key) {
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
        serviceName:'FindingService',
        opType:'findItemsByKeywords',
        appId:'RedWolfa9-aac2-4fa3-a4d6-8b1731957f1',
        params:{
            'keywords':key,
            'paginationInput.entriesPerPage':10
        }
    },function(error, data){
        if(error){
            console.log(error);
            return 'ERROR - EBAY';
        }

        console.log(data);
        return data;
    });


}

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

// api endpointa
router.get('/input/:key', function (request, response) {
    console.log('input/:key endpoint is called');

    var key = request.params.key;

    if(!key){
        console.log(key);
        console.log('Error! Keyword is invalid');
        return;
    }

    console.log(key);

    // getting inputs from various api
    var amazonResultsArray = searchAmazon(key);
    var ebayResultsArray = searchEbay(key);

    // calculate the result using the special algorithm

    // return the result

    //response.json();
});

router.get('/hello', function (request, response) {
    console.log('Hello World');
    response.send('Hello World');
});

// export this module
module.exports = router;