/**
 * Created by MuhammadRizky on 7/18/2015.
 */

// modules
var http = require('http');
var express = require('express');
var amazon = require('amazon-product-api');

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
    // TBD
}

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

// api endpointa
router.get('/input/:key', function (request, response) {
    console.log('input/key endpoint called');

    var key = request.params.key;

    console.log(key);

    // getting inputs from various api
    var amazonResultsArray = searchAmazon(key);
    var ebayResultsArray = searchEbay(key);

    // calculate the result using the special algorithm

    // return the result

    //response.json();
});

router.get('/hello', function(request, response){
    console.log('Hello World');
    response.send('Hello World');
});

// export this module
module.exports = router;