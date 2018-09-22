var Twitter = require('twitter');
var fs = require('fs');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

client.get('friends/ids', function(error, data, response) {
  if (error) throw error;
  var followesIds = data.ids
  //console.log(`count of followesIds ${followesIds.length}`);
  //loop for all users
  runForUsers(followesIds);
});
var unFollowerUsersIds = []

function runForUsers(followesIds) {

  if (followesIds.length == 0) {
    var ids = unFollowerUsersIds.join();
    saveUnfollowUsersId(ids)
    return
  }
  console.log(`count of followesIds ${followesIds.length}`);

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
        unfollow(userId, function() {
          unFollowerUsersIds.push(userId)
          //get next
          runForUsers(followesIds);

        });
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