angular.module('app',['ngMaterial','ngMessages'])
    .value('serverEndpointUrl','http://localhost:8080')
    .value('gameSettings',{
        boardWidth : 800,
        boardHeight : 500,
        cellWidth : 30,
        cellHeight : 30,
        moveIntervalTime:200,
        singleGameScoreIncrease:10,
        appleImgUrl:'img/apple.png',
        snakeHeadNormalImgUrl:'img/snake-head-normal.png',
        snakeHeadHungryImgUrl:'img/snake-head-hungry.png'
    }).controller('AppController',['serverProxy','userData',AppController]);


var self = null;
function AppController(serverProxy,userData){
    self = this;
    this._serverProxy = serverProxy;
    this._userData = userData;
    this.scoreBoardControl = {};
}


AppController.prototype.onUsernameSelected = function(username){
    self._serverProxy.login(username).then(function(userData){
        self._userData.setUserData(userData);
        self._userData.resolveUserLogin();
    });
};

AppController.prototype.showScoreBoard = function($event){
    this.scoreBoardControl.showScoreBoard($event);
};