/**
 * Created by yuval_000 on 12/16/2015.
 */


function CanvasAdapter(canvasContext,config){
    this.context = canvasContext;
    this.config = config;


    this.xCellCount = config.boardWidth / config.cellWidth;
    this.yCellCount = config.boardHeight / config.cellHeight;

    this.appleImgElement = new Image();
    this.appleImgElement.src = config.appleImgUrl;

    this.snakeHeadNormalImgElement = new Image();
    this.snakeHeadNormalImgElement.src = config.snakeHeadNormalImgUrl;

    this.snakeHeadHungryImgElement= new Image();
    this.snakeHeadHungryImgElement.src = config.snakeHeadHungryImgUrl;


    this.cellColor = 'black';
    this.boardBgColor = 'white';

    this.snake = null;
    this.direction = null;

    this.lastDirection = null;
};



CanvasAdapter.prototype.initNewGame = function(){
    this.snake = [
        {x:2,y:0},
        {x:1,y:0},
        {x:0,y:0},
    ];

    this.apple = this._grillApple();

    this.direction = 'right';

    this.context.fillStyle = this.boardBgColor;
    this.context.fillRect(0,0,this.config.boardWidth,this.config.boardHeight);//TODO verify...
    this._paintSnake();
    this._paintApple();
};

CanvasAdapter.prototype._paintSnake = function(){
    if(!this.snake){
        return;
    }
    this._paintSnakeHead();
    for(var i=1;i<this.snake.length;i++){
        this._fillCell(this.snake[i].x,this.snake[i].y,this.cellColor);
    }
};

CanvasAdapter.prototype._paintSnakeHead = function(){
    var headCell = this.snake[0];
    var headImageElement = this._isSnakeHeadNearApple()? this.snakeHeadHungryImgElement:this.snakeHeadNormalImgElement;

    this._paintImageOnCell(headCell.x , headCell.y , headImageElement);
};

CanvasAdapter.prototype._fillCell = function (x,y , color){
    this.context.fillStyle = color;
    this.context.fillRect(x * this.config.cellWidth,y * this.config.cellHeight ,this.config.cellHeight , this.config.cellHeight);
};

CanvasAdapter.prototype._paintImageOnCell = function(x,y,imgElement){
    var drawImageFn =  (function (){
        this.context.drawImage(imgElement, x * this.config.cellWidth, y * this.config.cellHeight,this.config.cellHeight , this.config.cellHeight);//
    }).bind(this);

    if(imgElement.complete){
        drawImageFn();
    }
    else {
        imgElement.onload = drawImageFn;
    }
};

CanvasAdapter.prototype._isSnakeHeadNearApple = function(){
    var snakeHead = this.snake[0];
    if(Math.abs(this.apple.x - snakeHead.x )<=1 && Math.abs(this.apple.y - snakeHead.y ) <=1){
        return true;
    }
    return false;

};

CanvasAdapter.prototype.moveSnake = function(){
    this.lastDirection = this.direction;
    var headCell = this.snake[0];
    this._fillCell(headCell.x,headCell.y , this.cellColor);

    var newHeadCell = this._calculateNewHeadCell(headCell);


    this.snake.unshift(newHeadCell);

    this._paintSnakeHead();

    if(this._isGameOver())
    {
        if(this.onGameOver){
            this.onGameOver();
        }
    }

    var isAppleEaten = newHeadCell.x == this.apple.x && newHeadCell.y == this.apple.y ;

    if(isAppleEaten) {

        if(this.onAppleEaten) {
            this.onAppleEaten();
        }
        var newApple = this._grillApple();

        this.apple = newApple;

        this._paintApple();
    }else{
        var tailCell = this.snake[this.snake.length - 1 ];
        this._fillCell(tailCell.x, tailCell.y, this.boardBgColor);
        this.snake.pop();
    }

};

CanvasAdapter.prototype._paintApple = function(){
    if(!this.apple){
        return;
    }
    this._paintImageOnCell(this.apple.x,this.apple.y,this.appleImgElement)
};


CanvasAdapter.prototype._calculateNewHeadCell = function(oldHeadCell){

    var newHeadCell  = {
        x:oldHeadCell.x,
        y:oldHeadCell.y
    };

    switch (this.direction){
        case 'left':
            --newHeadCell.x;
            break;
        case 'right':
            ++newHeadCell.x;
            break;
        case 'up':
            --newHeadCell.y;
            break;
        case 'down':
            ++newHeadCell.y;
            break;
    }
    if(newHeadCell.x >= this.xCellCount){
        newHeadCell.x = 0;
    }else  if(newHeadCell.x < 0){
        newHeadCell.x = this.xCellCount-1;
    }else   if(newHeadCell.y >= this.yCellCount){
        newHeadCell.y = 0;
    }
    else  if(newHeadCell.y < 0){
        newHeadCell.y = this.yCellCount-1;
    }

    return newHeadCell;
};

CanvasAdapter.prototype._isGameOver = function(){
    var snakeHead = this.snake[0];


    for(var i=1;i<this.snake.length;i++){
        var currCell = this.snake[i];
        if(snakeHead.x == currCell.x && snakeHead.y == currCell.y ){
            return true;
        }
    }
    return false;
};

CanvasAdapter.prototype._grillApple = function (){
    var appleOptions = [];

    for(var x = 0 ; x< this.xCellCount ; x++){
        for(var y = 0 ; y < this.yCellCount ; y++){

            if(!isOnSnake.call(this,x,y)){
                appleOptions.push({x:x,y:y});
            }
        }
    }


    function isOnSnake(x,y){


        for(var i=0 ; i<this.snake.length; i++){
            if(this.snake[i].x == x && this.snake[i].y == y){
                return true;
            }
        }
        return false;
    };


    var grilledIndex = Math.floor((Math.random() * appleOptions.length-1));
    var grilledApple = appleOptions[grilledIndex];

    if(this.onNewApple){
        this.onNewApple(grilledApple);
    }

    return grilledApple;
};


CanvasAdapter.prototype.setDirection = function(direction){

    var isSwitchedToOppositeDirection =
        this.lastDirection == 'left' && direction == 'right' ||
        this.lastDirection == 'right' && direction == 'left' ||
        this.lastDirection == 'up' && direction == 'down' ||
        this.lastDirection == 'down' && direction == 'up';

    if(isSwitchedToOppositeDirection){
        return;
    }


    this.direction = direction;

}

CanvasAdapter.onAppleEaten = null;

CanvasAdapter.onGameOver = null;

CanvasAdapter.onNewApple = null;