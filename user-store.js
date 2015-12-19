/**
 * Created by yuval_000 on 12/18/2015.
 */
//var Q = require('q');
var shortid = require('shortid');

console.log();

function UserStore(moveIntervalTime,singleGameScoreIncrease){
    this.users = {};
    this.moveIntervalTime = moveIntervalTime;
    this.singleGameScoreIncrease = singleGameScoreIncrease;
}

UserStore.prototype.addNewUser = function(username){
    console.log("New user added to user-store - " + username);
    var userToken  = shortid.generate();
    var userId = shortid.generate();
    var appleToken = shortid.generate();


    this.users[userToken] = {
        userId:userId,
        username:username,
        currentScore:0,
        appleToken:appleToken,
        lastAppleEatTime:new Date(),
        status:'paused'
    };

    return {
        userId:userId,
        userToken:userToken,
        appleToken:appleToken
    };
};


UserStore.prototype.updateUserStatus = function(userToken , newUserStatus){
    console.log('User - ' +this.users[userToken].username + ' New status is - '+ newUserStatus);
    var user = this.users[userToken];
    if(!user){
        return false;
    }
    user.status = newUserStatus;

    return true;
};


UserStore.prototype.getUser = function(userToken){
    var user = this.users[userToken];
    if(!user){
        return null;
    }
    return {
        userId:user.userId,
        username:user.username,
        currentScore:user.currentScore,
        status:user.status
    };
};

UserStore.prototype.removeUser = function(userToken){
    console.log('User - ' +this.users[userToken].username + ' Is removed.');
    var user = this.users[userToken];
    if(!user){
        return false;
    }
    delete this.users[userToken];
    return true;
};


UserStore.prototype.isAppleEatValid = function(userToken, appleToken){
  var user  = this.users[userToken];
    if(!user){
        return false;
    }
    var appleEatTime = new Date();
    var isEatTimeValid = appleEatTime - user.lastAppleEatTime.getTime() >=this.moveIntervalTime;
    var isEatTokenValid = user.appleToken === appleToken;

  return isEatTimeValid && isEatTokenValid;

};

UserStore.prototype.increaseUserScore = function(userToken) {
    var user  = this.users[userToken];
    if(!user){
        return false;
    }
    user.currentScore+=this.singleGameScoreIncrease;
    return true;
};
UserStore.prototype.resetScore = function(userToken){
    var user  = this.users[userToken];
    if(!user){
        return false;
    }
    user.currentScore = 0;
    return true;
};


UserStore.prototype.resetAppleToken = function(userToken){
    var user  = this.users[userToken];
    if(!user){
        return null;
    }

    user.lastAppleEatTime = new Date();
    var newAppleToken =   shortid.generate();
    user.appleToken = newAppleToken;

    return newAppleToken;
};

UserStore.prototype.getAllUsers = function() {
    var outUsers = [];
    for(var key in this.users){
        var currUser = this.users[key];
        outUsers.push({
            userId:currUser.userId,
            username:currUser.username,
            currentScore:currUser.currentScore,
            status:'paused'
        });
    }
    return outUsers;
}


module.exports = UserStore;