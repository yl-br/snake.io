/**
 * Created by yuval_000 12/17/2015.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 5000;

app.use( bodyParser.json() );       // to support JSON-encoded
app.use(bodyParser.urlencoded({     // to support URL-encoded
    extended: true
}));

app.use(express.static(__dirname + '/public'));

var server = require('http').Server(app);
var io = require('socket.io')(server);



var UserStore = require('./user-store');
var userStore = new UserStore(200,10);

var mongodbEndpoint = process.env.MONGOLAB_URI || 'mongodb://localhost:27017';

var ScoreStore = require('./score-store');
var scoreStore = new ScoreStore(mongodbEndpoint);
var scoreStoreInitPromise = scoreStore.init();

var scoresCountLimit = 50;
var Router = require('./router');
var router = new Router(userStore,scoreStore,scoresCountLimit);

router.setRoutes(app,io);

scoreStoreInitPromise.then(function(){
    server.listen(port);
}).fail(function(err){

});
