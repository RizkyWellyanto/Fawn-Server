/**
 * Created by MuhammadRizky on 7/18/2015.
 */

// modules
var express = require('express');
var path = require('path');

// set server config
var app = express();
var port = process.env.PORT || 8080;
app.set('port', port);
app.set('case sensitive routing', false);
app.set('views', path.join(__dirname, 'views'));
app.set('models', path.join(__dirname, 'models'));

// route to api.js
app.use('/api', require('./routes/api.js'));

// run the server
app.listen(port, function () {
    console.log('Server is running at http://localhost:' + port);
});
