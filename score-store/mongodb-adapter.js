/**
 * Created by yuval_000 on 12/18/2015.
 */
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');

function MongodbAdapter(mongodbEndpoint){
    this.mongodbEndpoint = mongodbEndpoint;
    this.db = null;
};

MongodbAdapter.prototype.connect = function(){
    var deferred = Q.defer();
    var self = this;
    MongoClient.connect(this.mongodbEndpoint, function(err, db) {
        if(err){
            deferred.reject(err);
        }else{
            self.db = db;
            deferred.resolve();
        }
    });
    return deferred.promise;
};

MongodbAdapter.prototype.addScore =  function(username,score){
    var deferred = Q.defer();
    this.db.collection('scores').insertOne(
        {
            username:username,
            score:score,
            timestamp:new Date()
        }, function(err, result) {
            if(err){
                deferred.reject();
            }else{
                deferred.resolve();
            }
        });
    return deferred.promise;
};
MongodbAdapter.prototype.getAllScores =  function(){
    var deferred = Q.defer();
    var outScores = [];
    var cursor =this.db.collection('scores').find();
    cursor.each(function(err, doc) {
        if(err){
            deferred.reject(err);
        }else if (doc != null) {
           outScores.push(doc);
        } else {
            deferred.resolve(outScores);
        }
    });


    return deferred.promise;
};



module.exports= MongodbAdapter;