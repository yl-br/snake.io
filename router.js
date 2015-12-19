/**
 * Created by yuval_000 on 12/17/2015.
 */
function Router(userStore,scoreStore,scoresCountLimit){
    this.userStore = userStore;
    this.scoreStore = scoreStore;
    this.scoresCountLimit = scoresCountLimit;
}


Router.prototype.setRoutes = function(app,io){
    var self = this;
    app.post('/login', function(req, res) {
        var username = req.body.username;

        var isUserNameValid = username && username.length <= 15 && username.length >= 3;
        if(!isUserNameValid) {
            res.status(404).send('BAD_USERNAME');
        }else{

            var newUserDataForClient = self.userStore.addNewUser(username);

            var userDataToEmit = self.userStore.getUser(newUserDataForClient.userToken);

            io.emit('user-state-change',{userId:userDataToEmit.userId,state:'new-user',userData:userDataToEmit});
            io.emit('user-state-change',{userId:userDataToEmit.userId,state:'score-change',userData:userDataToEmit});
            res.status(201).json(newUserDataForClient);
        }
    });


    app.post('/user-status',function(req,res){
        var userToken = req.body.userToken;
        var newUserStatus= req.body.status;
        self.userStore.updateUserStatus(userToken,newUserStatus);
        var user = self.userStore.getUser(userToken);
        io.emit('user-state-change',{userId:user.userId,state:'status-change',userData:user});
        res.sendStatus(200);
    });

    app.post('/apple-eaten',function(req,res){
        var userToken = req.body.userToken;
        var appleToken = req.body.appleToken;
        var isAppleEatValid = self.userStore.isAppleEatValid(userToken, appleToken);
        if(isAppleEatValid){
            self.userStore.increaseUserScore(userToken);
            var newAppleToken = self.userStore.resetAppleToken(userToken);
            var user = self.userStore.getUser(userToken);
            io.emit('user-state-change',{userId:user.userId,state:'score-change',userData:user});
            res.status(200).json({appleToken:newAppleToken});
        }else{
            res.sendStatus(404);
        }

    });



    app.get('/users',function(req,res){
        var allUsers = self.userStore.getAllUsers();
        res.status(200).json(allUsers);
    });

    app.get('/scores',function(req,res){
        var start = req.query.start || 0;
        var count = req.query.count || self.scoresCountLimit;
        self.scoreStore.getScores(start,count).then(function(scores){
            res.status(200).json(scores);
        });
    });
    app.get('/scores/count',function(req,res) {
        var count = self.scoreStore.getScoresCount();
        res.status(200).json({count:count});
    });

    app.post('/relative-scores',function(req,res){
        var topLimit = parseInt(req.query.topLimit);
        var btmLimit = parseInt(req.query.btmLimit);
        var userToken = req.body.userToken;
        var user = self.userStore.getUser(userToken);
        if(!user){
            res.sendStatus(404);
        }else{
            var userScore = user.currentScore;
            self.scoreStore.getRelativeScores(userScore,btmLimit,topLimit).then(function(relativeScores){
                res.status(200).json(relativeScores);
            });

        }
    });



    app.post('/game-over',function(req,res) {
        var userToken = req.body.userToken;

        var user = self.userStore.getUser(userToken);

        self.scoreStore.addScore(user.username,user.currentScore);

        self.userStore.resetScore(userToken);

        io.emit('user-state-change',{userId:user.userId,state:'score-change',userData:user});
        io.emit('final-scores-change');

        res.sendStatus(200);
    });


    io.on('connection', function (socket) {
        socket.on('identify', function (data,callbackFn) {
            socket.userToken = data.userToken;
            callbackFn();
        });
        socket.on('disconnect',function(){
            var user = self.userStore.getUser(socket.userToken);
            if(user){
                io.emit('user-state-change',{userId:user.userId,state:'user-left',userData:user});
                self.userStore.removeUser(socket.userToken);
            }
        });
    });


};


module.exports = Router;