var Twitter = require('twitter');
var fs = require('fs');


var client;
exports.checkUnActiveUsers = function checkUnActiveUsers(consumerKey, consumerSecret, token, tokenSecret) {

  client = new Twitter({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token_key: token,
    access_token_secret: tokenSecret
  });

  client.get('friends/ids', function(error, data, response) {
    if (error) throw error;
    var followesIds = data.ids
    console.log(followesIds);
    //loop for all users
    runForUsers(followesIds);
  });
}

var unFollowerUsersIds = []

function runForUsers(followesIds) {

  console.log(`count of followesIds ${followesIds.length}`);

  if (followesIds.length == 0) {
    var ids = unFollowerUsersIds.join();
    saveUnfollowUsersId(ids)
    process.exit()
    return
  }

  var userId = followesIds.pop();

  getLastTweet(userId, function(lastTweet) {
    if (lastTweet == null) {
      // your code here.
      runForUsers(followesIds);
    } else {

      var tweetDate = new Date(lastTweet.created_at);
      var today = new Date();
      var lastTweetFromNumberOfDay = Math.ceil((today - tweetDate) / (1000 * 60 * 60 * 24));
      if (lastTweetFromNumberOfDay > 60) {
        // unfollow this user
        console.log(`unfollow ${lastTweet.user.screen_name} last tweet from ${lastTweetFromNumberOfDay} day`);
        //unfollow(userId, function() {
        unFollowerUsersIds.push(userId)
        //get next
        runForUsers(followesIds);

        // });
      } else {
        runForUsers(followesIds);
      }

    }

  })

}

function unfollowUser(id, callBack) {

  var params = {
    user_id: `${id}`
  };
  client.get('friendships/destroy', params, function(error, data, response) {
    if (!error) {
      callBack()
    }

  });

}

function getLastTweet(id, callBack) {

  var params = {
    id: `${id}`,
    count: 1
  };

  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      if (tweets.length == 1) {
        var lastTweet = tweets[0]
        callBack(lastTweet)
      } else {
        callBack()
      }

    } else {
      console.log(error);
      //console.log(response);
      callBack()

    }
  });

}


function saveUnfollowUsersId(usersIds) {
  fs.writeFile('unFollowsIds.csv', usersIds, function(err) {
    if (err)
      return console.log(err);
    console.log('save ids into unFollowsIds.txt, just check it');
  });

}