/**
 * Created by yuval_000 on 12/18/2015.
 */
var Q = require('q');
var sqlite3 = require('sqlite3').verbose();

function sqliteAdapter(mongodbEndpoint){
    this.dbFilePath = __dirname + '/../appData/sqlite-scores-db';
    this.db = null;
};

sqliteAdapter.prototype.init = function(){
    var deferred = Q.defer();
    var self = this;
    this.db = new sqlite3.Database(this.dbFilePath,function(err){
        if(err){
            deferred.reject(err);
        }else{
            self.db.serialize(function() {
                self.db.run("CREATE TABLE scores (username TEXT,score INTEGER)",function(err){
                    if(err){
                        deferred.reject();
                    }else{
                        deferred.resolve();
                    }
                });
            });

        }
    });
    return deferred.promise;
};

sqliteAdapter.prototype.addScore =  function(username,score){
    var deferred = Q.defer();



    return deferred.promise;
};

module.exports= sqliteAdapter;