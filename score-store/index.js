/**
 * Created by yuval_000 on 12/18/2015.
 */
var Q = require('q');
var MongodbAdapter = require('./mongodb-adapter');

function ScoreStore(mongodbEndpoint){
    this.scoresCache = [];
    this.dbService = null;
    this.mongodbEndpoint = mongodbEndpoint;
    this.addingScorePromise = null;
};


ScoreStore.prototype.init = function(){
    var self = this;
    return this._initDbService().then(function(){
        return self.dbService.getAllScores().then(function(allScores){
            self.scoresCache = allScores;
            self.scoresCache.sort(function(a, b) {
                return b.score- a.score;
            });
        });
    })
};

ScoreStore.prototype._initDbService = function(){
    var deferred = Q.defer();

    var mongodbAdapter = new MongodbAdapter(this.mongodbEndpoint);
    var self = this;
    var mongodbConnectPromise =  mongodbAdapter.connect();
    mongodbConnectPromise.then(function(){
        self.dbService = mongodbAdapter;
        deferred.resolve();
    });
    mongodbConnectPromise.fail(function(err){
        deferred.reject(err);
    });
    return deferred.promise;
};

ScoreStore.prototype.addScore = function(username,score){
    var self = this;
    var deferred = Q.defer();
    if(!username || !score){
        deferred.reject();
    }
    self.addingScorePromise = this.dbService.addScore(username,score).then(function(){
        self.scoresCache.push({
            username:username,
            score:score,
            timestamp:new Date()
        });
        self.scoresCache.sort(function(a, b) {
            return b.score- a.score;
        });
        deferred.resolve();
    });
    return deferred.promise;
};

ScoreStore.prototype.getScores = function(start,count){
    var deferred = Q.defer();
    var self = this;
    if(this.addingScorePromise){
        this.addingScorePromise.then(function(){
            var outScores = self.scoresCache.slice(start,start+count);
            outScores.forEach(function(scoreObj){
                scoreObj.position= self.scoresCache.indexOf(scoreObj)+1;
            });

            deferred.resolve(outScores);
        })
    }else{
        var outScores = self.scoresCache.slice(start,start + count);
        outScores.forEach(function(scoreObj){
            scoreObj.position= self.scoresCache.indexOf(scoreObj)+1;
        });
        deferred.resolve(outScores);
    }

    return deferred.promise;
};

ScoreStore.prototype.getRelativeScores = function(score,btmLimit,topLimit){
    var deferred = Q.defer();
    var self = this;
    if(this.addingScorePromise){
        this.addingScorePromise.then(function(){
            var outScores = self._findRelativeScores(score,btmLimit,topLimit);
            deferred.resolve(outScores);
        })
    }else{
        var outScores = self._findRelativeScores(score,btmLimit,topLimit);
        deferred.resolve(outScores);
    }

    return deferred.promise;
};


ScoreStore.prototype._findRelativeScores = function(score,btmLimit,topLimit){
    var outResult = [];

    if(this.scoresCache.length==0){
        return outResult;
    }

    var index = this.scoresCache.length;
    var foundPosition = false;


    while(index>0 && !foundPosition){
        index--;
        var currOfflineScore = this.scoresCache[index].score;
        foundPosition = score <= currOfflineScore;
    }

    var sliceStart =0;

    var isLastScore= index ==  this.scoresCache.length -1;
    if(isLastScore){
        sliceStart = this.scoresCache.length -topLimit-btmLimit;
    }else{
        sliceStart = index- topLimit +1 >=0 ? index- topLimit+1  : index ;
    }
    outResult = this.scoresCache.slice(sliceStart,sliceStart+topLimit + btmLimit);

    var self = this;
    outResult.forEach(function(scoreObj){
        scoreObj.position = self.scoresCache.indexOf(scoreObj)+1;
    });


    return outResult;
};

ScoreStore.prototype.getScoresCount = function(){
    return this.scoresCache.length;
}

module.exports = ScoreStore;