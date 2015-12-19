/**
 * Created by yuval_000 on 12/16/2015.
 */

angular.module('app').controller('GameController',['userData','serverProxy','gameSettings', GameController]);

function GameController(userData, serverProxy, gameSettings){
    this.gameSettings = gameSettings;
    this._userData = userData;
    this._serverProxy = serverProxy;


    this.gameControl = {
        onAppleEaten:this._onAppleEaten.bind(this),
        onGameOver:this._onGameOver.bind(this)
    };


    this.isPlaying = false;
    this.isGameOver = false;


    var self = this;

    this._userData.getUserLoginPromise().then(function(){
        self.gameControl.resetGame();
    });


}


GameController.prototype._onAppleEaten = function(){
    var user = this._userData.getUserData();
    var self = this;
    this._serverProxy.appleEaten(user.userToken,user.appleToken).then(function(newAppleToken){
        self._userData.setUserData({appleToken:newAppleToken});
    });

};


GameController.prototype._onGameOver = function(){
    console.log('GameOver');
    this.isGameOver = true;
    var user = this._userData.getUserData();
    this.gameControl.stopGame();
    this._serverProxy.gameOver(user.userToken);
    this._serverProxy.changeUserStatus(user.userToken,'paused');
};

GameController.prototype.stopGame = function(){
    this.gameControl.stopGame();
    this.isPlaying = false;
    var user = this._userData.getUserData();
    this._serverProxy.changeUserStatus(user.userToken,'paused');
};

GameController.prototype.onGameButtonClick = function(){
    var user = this._userData.getUserData();

    if(this.isPlaying){
        this.isPlaying = false;
        this.gameControl.stopGame();
        this._serverProxy.changeUserStatus(user.userToken,'paused');
    }else{
        if(this.isGameOver){
            this.isGameOver = false;
            this.gameControl.resetGame();
        }
        this.isPlaying  = true;
        this.gameControl.startGame();
        this._serverProxy.changeUserStatus(user.userToken,'playing');

    };



};