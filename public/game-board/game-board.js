/**
 * Created by yuval_000 on 12/14/2015.
 */
angular.module('app').component('gameBoard',
    {
        bindings: {
            gameSettings:'=*',
            gameBoardControl:'='
        },
        controller: ['$interval','$element','$document','$rootScope',GameBoardController],
        template: '<canvas style=" border: 3px solid #000000;"></canvas>'
    });


function GameBoardController($interval , $element , $document) {
    var bodyEle = $document[0].body;
    var canvasElement = $element.find('canvas')[0];
    canvasElement.width = this._fixCanvasSize(this.gameSettings.boardWidth, this.gameSettings.cellWidth)
    canvasElement.height = this._fixCanvasSize(this.gameSettings.boardHeight, this.gameSettings.cellHeight);
    var canvasContext = canvasElement.getContext("2d");
    this.gameSettings.boardWidth = canvasElement.width;
    this.gameSettings.boardHeight = canvasElement.height;
    var canvasAdapterConfig = this.gameSettings;
    this._$interval = $interval;
    //API
    this.gameBoardControl = {
        resetGame: this._resetGame.bind(this),
        startGame: this._startGame.bind(this),
        stopGame: this._stopGame.bind(this),
        onAppleEaten: this.gameBoardControl.onAppleEaten || null,
        onGameOver: this.gameBoardControl.onGameOver || null
    };
    //-----
    var self = this;

    this.canvasAdapter = new CanvasAdapter(canvasContext, canvasAdapterConfig);


    this.pauseGameIntervalToken = null;


    this.canvasAdapter.onGameOver = function () {
        if(self.gameBoardControl.onGameOver){
            self.gameBoardControl.onGameOver();
        }
    };

    this.canvasAdapter.onAppleEaten = function(){
      if(self.gameBoardControl.onAppleEaten){
          self.gameBoardControl.onAppleEaten();
      }
    };



    bodyEle.onkeydown = function (event) {
        switch (event.keyCode) {
            case 37:
                self.canvasAdapter.setDirection('left');
                break;
            case 38:
                self.canvasAdapter.setDirection('up');
                break;
            case 39:
                self.canvasAdapter.setDirection('right');
                break;
            case 40:
                self.canvasAdapter.setDirection('down');
                break;
        }
    };


}


GameBoardController.prototype._fixCanvasSize = function(boardLength,cellLength){

    var cellCount =  Math.floor(boardLength/cellLength);
    var delta = boardLength- cellLength *cellCount;
    var fixedSize = boardLength +  Math.round(cellLength - delta);

    return fixedSize;
};

GameBoardController.prototype._startGame = function(){
    this.pauseGameIntervalToken = this._$interval(this.canvasAdapter.moveSnake.bind(this.canvasAdapter), this.gameSettings.moveIntervalTime);
};

GameBoardController.prototype._stopGame = function(){
    this._$interval.cancel(this.pauseGameIntervalToken);
};

GameBoardController.prototype._resetGame = function(){
    this.canvasAdapter.initNewGame();
};
