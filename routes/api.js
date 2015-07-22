/**
 * Created by MuhammadRizky on 7/18/2015.
 */

// modules
var http = require('http');
var express = require('express');
var amazon = require('amazon-product-api');

// instances
var router = express.router();

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
        console.log(results)
        return results;
    }).catch(function (error) {
        console.log(error)
        return 'ERROR - AMAZON';
    })
}

// call ebay api
function searchEbay(key){
    // TBD
}

// api endpoint
router.get('input/:key', function (request, response) {
    var key = request.params.key;

    // getting inputs from various api
    var amazonResult = searchAmazon(key);
    var ebayResult = searchEbay(key);

    // calculate the result using the special algorithm

    // return the result

    response.json();
});

// export this module
module.exports = router;