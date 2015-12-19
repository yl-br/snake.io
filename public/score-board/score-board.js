/**
 * Created by yuval_000 on 12/19/2015.
 */
angular.module('app').component('scoreBoard',
    {
        bindings: {
            scoreBoardControl:'='
        },
        controller: ['$mdDialog','serverProxy',ScoreBoardController],
        template: '<div id="score-board-popup-container"></div>'
    });

function ScoreBoardController($mdDialog,serverProxy){

    this.scoreBoardControl={showScoreBoard :this.showScoreBoard.bind(this)};
    this._$mdDialog = $mdDialog;
    this._serverProxy = serverProxy;
}

ScoreBoardController.prototype.showScoreBoard = function($event){
    var self = this;
    this._$mdDialog.show({
        controller: DialogController,
        templateUrl: 'score-board/score-board.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true,
        fullscreen: false
    });

    function DialogController($scope, $mdDialog) {
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };

        $scope.getHumanDate = function(date){
          return  moment(new Date(date)).fromNow();
        }

        var DynamicItems = function() {
            this.loadedPages = {};
            this.numItems = 0;
            this.PAGE_SIZE = 50;
            this.fetchNumItems_();
        };

        DynamicItems.prototype.getItemAtIndex = function(index) {
            var pageNumber = Math.floor(index / this.PAGE_SIZE);
            var page = this.loadedPages[pageNumber];
            if (page) {
                return page[index % this.PAGE_SIZE];
            } else if (page !== null) {
                this.fetchPage_(pageNumber);
            }
        };
        DynamicItems.prototype.getLength = function() {
            return this.numItems;
        };
        DynamicItems.prototype.fetchPage_ = function(pageNumber) {
            this.loadedPages[pageNumber] = null;
            var start = pageNumber*this.PAGE_SIZE;
            var count = this.PAGE_SIZE;
            var dynamicItemsSelf = this;
            self._serverProxy.getScores(start,count).then(function(scores){
                dynamicItemsSelf.loadedPages[pageNumber] = scores;
            })

        };
        DynamicItems.prototype.fetchNumItems_ = function() {
            var dynamicItemsSelf = this;
            self._serverProxy.getScoresCount().then(function(count){
                dynamicItemsSelf.numItems = count;
            })
        };
        $scope.dynamicItems = new DynamicItems();

    }


};



