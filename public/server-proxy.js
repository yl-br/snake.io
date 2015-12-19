/**
 * Created by yuval_000 on 12/18/2015.
 */
angular.module('app').factory('serverProxy', ['$http','$q','$rootScope','serverEndpointUrl',function($http,$q,$rootScope,serverEndpointUrl){
    var socket = null;
    var userStateChangeCallbacks = [];


    function login(username){
        var deferred =  $q.defer();
        var loginUrl = serverEndpointUrl + '/login';

        socket = io(serverEndpointUrl);
        setSocketListenEvents(socket);

        $http.post(loginUrl,{username:username}).then(function(res){
            var userData = res.data;
            socket.emit('identify',{userToken:userData.userToken},function(){
                deferred.resolve(userData)
            });
        });

        return deferred.promise;
    }

    function setSocketListenEvents(socket){
        socket.on('user-state-change', function (data) {
            angular.forEach(userStateChangeCallbacks,function(callbackFn){
                $rootScope.$apply(function () {
                    callbackFn(data.userId, data.state, data.userData);
                });
            });
        });
    }
    function appleEaten(userToken,appleToken){
        var appleEatenUrl = serverEndpointUrl + '/apple-eaten';
        return $http.post(appleEatenUrl ,{userToken:userToken,appleToken:appleToken}).then(function(res){
            return res.data.appleToken;
        });
    };

    function gameOver(userToken){
        var gameOverUrl = serverEndpointUrl + '/game-over';
        return $http.post(gameOverUrl ,{userToken:userToken});
    }


    function changeUserStatus(userToken,newStatus){
        var changeStatusUrl = serverEndpointUrl + '/user-status';
        return $http.post(changeStatusUrl ,{userToken:userToken,status:newStatus});
    };

    function onUserStateChange(callbackFn){
        userStateChangeCallbacks.push(callbackFn);
    };

    function getOnlineUsers(){
        var getOnlineUsersUrl = serverEndpointUrl + '/users';
        return $http.get(getOnlineUsersUrl).then(function(res){
            return res.data;
        });
    };

    function getScores(start,count){
        var getScoresUrl = serverEndpointUrl + '/scores?start='+start+'&count='+count;
        return $http.get(getScoresUrl).then(function(res){
            return res.data;
        });
    }

    function getRelativeScores(userToken,btmLimit,topLimit){
        var getRelativeScoresUrl = serverEndpointUrl + '/relative-scores?btmLimit='+btmLimit+'&topLimit='+topLimit;
        return $http.post(getRelativeScoresUrl ,{userToken:userToken}).then(function(res){
            return res.data;
        });
    }

    function getScoresCount(){
        var getScoresCountUrl = serverEndpointUrl + '/scores/count';
        return $http.get(getScoresCountUrl ).then(function(res){
            return res.data.count;
        });
    };
    return {
        login:login,
        appleEaten:appleEaten,
        gameOver:gameOver,
        changeUserStatus:changeUserStatus,
        onUserStateChange:onUserStateChange,
        getOnlineUsers:getOnlineUsers,
        getScores:getScores,
        getScoresCount:getScoresCount,
        getRelativeScores:getRelativeScores
    }
}]);