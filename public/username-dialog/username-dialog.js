/**
 * Created by yuval_000 on 12/18/2015.
 */
angular.module('app').component('usernameDialog',
    {
        bindings: {
            onUsernameSelected:'&'
        },
        controller: ['$mdDialog',UsernameDialogController],
        template: '<div id="dialog-popup-container"></div>' //'username-dialog/username-dialog.html'
    });

function UsernameDialogController($mdDialog){
    this._raiseDialog($mdDialog);

}

UsernameDialogController.prototype._raiseDialog = function($mdDialog){
    var self = this;
    $mdDialog.show({
        parent:angular.element(document.querySelector('#dialog-popup-container')),
        templateUrl:'username-dialog/username-dialog.html',
        controller: function DialogController($scope, $mdDialog) {
        $scope.closeDialog = function(username) {
            var isValid = username && username.length >= 3 && username.length <= 15;

            if(isValid){
                if(self.onUsernameSelected){
                    self.onUsernameSelected()(username);
                }
                $mdDialog.hide();
            }
        }
        }});

};
