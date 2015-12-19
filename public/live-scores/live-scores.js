/**
 * Created by yuval_000 on 12/19/2015.
 */
angular.module('app').controller('LiveScoresController',['$q','userData','serverProxy', LiveScoresController]);

function LiveScoresController($q , userData, serverProxy) {
    this.topScores = [];
    this.relativeScores = [];
    this.isTopScoresOverlapRelativeScores = false;

    this._serverProxy = serverProxy;
    this._userData=  userData;
    this._$q  = $q;
    var self = this;
    this._userData.getUserLoginPromise().then(function() {
        self._updateScores();
    });

    this._serverProxy.onUserStateChange(function(userId, state, userData){
        if(state == 'score-change'){
            self._updateScores();
        }

    });
}


LiveScoresController.prototype._updateScores = function(){
    var user = this._userData.getUserData();
    var userToken = user.userToken;
    var userId = user.userId;
    var topScoresPromise = this._serverProxy.getScores(0,3);
    var relativeScoresPromise =  this._serverProxy.getRelativeScores(userToken,2,2);
    var onlineUsersPromise = this._serverProxy.getOnlineUsers();

    var self = this;
    this._$q.all([topScoresPromise,relativeScoresPromise,onlineUsersPromise]).then(function(resArray) {
        var topScores = resArray[0];
        var relativeScores = resArray[1];
        var onlineUsers = resArray[2];

        self.topScores = [];
        self.relativeScores = [];
        self.isTopScoresOverlapRelativeScores = false;

        if (topScores && topScores.length >= 1 && relativeScores && relativeScores.length>=1){
            self.isTopScoresOverlapRelativeScores = topScores[topScores.length - 1].position >= relativeScores[0].position;
        }
        if(self.isTopScoresOverlapRelativeScores) {
            var instancesToDelete = [];
            angular.forEach(topScores, function (topScore) {
                angular.forEach(relativeScores, function (relativeScore) {
                    var isSameScore = relativeScore.position == topScore.position;
                    if (isSameScore) {
                        instancesToDelete.push(topScore);
                    }
                });
            });
            angular.forEach(instancesToDelete,function(currInstance){
                topScores.splice(topScores.indexOf(currInstance), 1);
            });

        }

        angular.forEach(topScores,function(topScore){
            self.topScores.push({
                username:topScore.username,
                score:topScore.score,
                scoreType:'final-score',
                position:topScore.position
            });
        });

        angular.forEach(relativeScores,function(relativeScore) {
            self.relativeScores.push({
                username: relativeScore.username,
                score: relativeScore.score,
                scoreType: 'final-score',
                position: relativeScore.position
            });
        });

        var maxRelativeScore = relativeScores.length >= 4 ? relativeScores[0].score : Number.MAX_VALUE;
        var minRelativeScore = relativeScores.length >= 4 ? relativeScores[relativeScores.length-1].score : Number.MIN_VALUE;

        angular.forEach(onlineUsers,function(onlineUser){
            var isUserScoreRelevant = onlineUser.currentScore >= minRelativeScore && onlineUser.currentScore <= maxRelativeScore;

            var isSelfScore = onlineUser.userId == userId;
            if(isUserScoreRelevant || isSelfScore){

                self.relativeScores.push({
                        username:onlineUser.username,
                        score:onlineUser.currentScore,
                        scoreType: isSelfScore ? 'self-score' : 'live-score',
                        position:null
                    }
                );
            }
        })

        self.relativeScores.sort(function(a,b){
            if(a.position && b.position){
                return a.position - b.position;
            }else{
                return b.score - a.score;
            }

        });

    });
};