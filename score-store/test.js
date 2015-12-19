/**
 * Created by yuval_000 on 12/18/2015.
 */
var mongodbEndpoint = "mongodb://localhost:27017/test";

    var MongodbAdapter = require('./mongodb-adapter');


var mongodbAdapter = new MongodbAdapter(mongodbEndpoint);

mongodbAdapter.connect().then(function(){
    mongodbAdapter.addScore('yuval',66).then(function(){
        console.log('insetred.');

    },function (err){
        console.log(err);
    })
},function(err){
    console.log(err);
});


var SqliteAdapter = require('./sqlite-adapter');
var sqliteAdapter = new SqliteAdapter();
sqliteAdapter.init().then(function(){
    console.log('sqlite inited');
},function (err){
    console.log(err);
})