/**
 * Created by yuval_000 on 12/18/2015.
 */
angular.module('app').factory('userData',['$q',function($q) {

    var userData = {};
    var userLoginDeferred =  $q.defer();

    function get(){
        return userData;
    }
    function set(newUserData){
        for(var key in newUserData){
            userData[key] = newUserData[key];
        }
    }


    function getUserLoginPromise(){
        return userLoginDeferred.promise;
    }

    function resolveUserLogin(){
        userLoginDeferred.resolve();
    }

    return {
        setUserData:set,
        getUserData:get,
        getUserLoginPromise:getUserLoginPromise,
        resolveUserLogin:resolveUserLogin
    }
}]);