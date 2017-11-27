PlayersCollection = new Mongo.Collection('players');

buttonCount = 0;
if (Meteor.isClient){
    //Execute this code only on client
    Meteor.subscribe('thePlayers');
    Template.leaderboard.helpers({
    'player': function() {
        var currentUserId = Meteor.userId();
        return PlayersCollection.find({ createdBy: currentUserId}, { sort: { score: -1, name: 1 }});
    },
    'playerCount': function() {
        var currentUserId = Meteor.userId();
        return PlayersCollection.find({createdBy: currentUserId}).count();
    },
    'selectedClass': function() {
        var playerID = null;
        playerID = this._id;
        var selectedPlayer = Session.get('selectedPlayer');
        if(playerID == selectedPlayer){
            return 'selected';
        }

    },
    'selectedPlayer': function() {
        var selectedPlayer = Session.get('selectedPlayer');
        var selected = PlayersCollection.findOne({ _id: selectedPlayer });
        return selected;

    }

   });

   Template.leaderboard.events({
       'click .player': function() {
         var playerID = this._id;
         Session.set('selectedPlayer', playerID);
       },
       'click .increment': function() {
        //code to execute when
           var selectedPlayer = Session.get('selectedPlayer');
           Meteor.call('updateScore', selectedPlayer, 5);
       },
       'click .decrement': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('updateScore', selectedPlayer, -5 );
       },
       'click .clear_selection': function() {
           Session.set('selectedPlayer', null);
       },
       'click .remove': function() {
            var selectedPlayer = Session.get('selectedPlayer');

            Meteor.call('removePlayer', selectedPlayer);
       },
   });

   Template.addPlayerForm.events({
      'submit form': function(event) {
        event.preventDefault();
        var playerNameVar = event.target.playerName.value;
        var playerScoreVar = Number(event.target.playerScore.value);


        Meteor.call('createPlayer', playerNameVar, playerScoreVar);

        event.target.playerName.value = "";
        event.target.playerScore.value="";
      },
   });


}

if (Meteor.isServer) {
    //Execute this code only on server
    Meteor.publish('thePlayers', function() {
        var currentUserId = this.userId;
        return PlayersCollection.find({ createdBy: currentUserId });
    });
}

Meteor.methods({
    //Methods go here
    'createPlayer': function(playerNameVar, playerScoreVar) {

        var currentUserId = Meteor.userId();

        if(playerScoreVar == null || playerScoreVar == undefined){
            playerScoreVar = 0;
        }

        check(playerNameVar, String);
        check(playerScoreVar, Number);


        if(currentUserId) {
            PlayersCollection.insert({
                name: playerNameVar,
                score: playerScoreVar,
                createdBy: currentUserId,
            });
        }
   },
    'removePlayer': function(selectedPlayer) {

        var currentUserId = Meteor.userId();

        check(selectedPlayer, String);

        if(currentUserId) {

            PlayersCollection.remove({ _id: selectedPlayer, createdBy: currentUserId });

        }
    },
    'updateScore': function(selectedPlayer, scoreValue) {

        var currentUserId = Meteor.userId();

        check(selectedPlayer, String);
        check(scoreValue, Number);

        if(currentUserId) {
            if (scoreValue == 5) {

                PlayersCollection.update({ _id: selectedPlayer, createdBy: currentUserId },
                    {$inc: {score: 5}});

            } else if (scoreValue == -5) {

                PlayersCollection.update({ _id: selectedPlayer, createdBy: currentUserId },
                    {$inc: {score: -5}});

            }
        }
    }
});