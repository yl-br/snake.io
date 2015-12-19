/**
 * Created by yuval_000 on 12/19/2015.
 */
angular.module('app').controller('OnlineUsersController',['userData','serverProxy', OnlineUsersController]);

function OnlineUsersController(userData, serverProxy) {
    this.users= {};

    serverProxy.onUserStateChange(this.updateNewUserStatus.bind(this));

    var self = this;

    userData.getUserLoginPromise().then(function(){
        self.userId= userData.getUserData().userId;
    });


    serverProxy.getOnlineUsers().then(function(data){
        angular.forEach(data,function(user){
           self.users[user.userId] = user;
        });
    });
}

OnlineUsersController.prototype.updateNewUserStatus = function(userId,state,userData){
    switch (state) {
        case 'new-user':{
            this.users[userId] = userData;
            break;
        }
        case 'score-change':{
            this.users[userId] = userData;
            break;
        }
        case 'status-change':{
            this.users[userId] = userData;
            break;
        }
        case 'user-left':{
            delete this.users[userId];
            break;
        }
    }
};