var express = require('express');
var app = express();
var https = require("https")
var mongodb = require("mongodb")
var ObjectId = require('mongodb').ObjectID;
var passport = require('passport')
var TwitterStrategy = require('passport-twitter').Strategy;
var session = require('express-session')
var bodyParser = require('body-parser')
var MongoStore = require('connect-mongo')(session);
app.use((session)(
  {
    secret: 'keyboard cat', 
    resave: true, saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      activeDuration: 30 * 24 * 60 * 60 * 1000,
    },
    store : new MongoStore({
      url : process.env.MONGODB
    })
   }
));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({
    extended: true
}));
var consumerKey = process.env.CLIENTID,
    consumerSecret = process.env.SECRETID,
    callback = process.env.CALLBACKURL

app.use(express.static('public'));

passport.use(new TwitterStrategy({
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    callbackURL: callback
  },
  function(token, tokenSecret, profile, done) {
    return done(null, profile);
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
app.get("/login", passport.authenticate('twitter'));
app.get('/api/authorization', passport.authenticate('twitter', { successRedirect: '/home',
                                     failureRedirect: '/login' }
));
app.get("/", function (req, res) {
  res.redirect("/home")
});
app.get("/home", function (req, res) {
  if (req.session.hasOwnProperty("passport")){
    res.sendFile(__dirname + '/views/profile.html')
  } else {
    res.sendFile(__dirname + '/views/home.html')
  }
});
app.post("/submit", function (req, res) {
  var pollData = {
    pollName : req.body.pollName,
    pollOptions : JSON.parse(req.body.pollOptions).options,
    pollMaster: req.user.username,
    voted: [],
    votes: JSON.parse(req.body.pollOptions).votes
  }
  mongodb.connect(process.env.MONGODB2, function (err, client){
    if (err) {console.log(err)}
    var db = client.db("polls")
    var collection = db.collection("pollList")
    collection.insert(pollData, function(err, data){
       res.redirect("/polls/"+data.insertedIds[0])
    })
    client.close()
  })
});
app.post("/vote", function (req, res) {
  var pollUpdate = JSON.parse(req.body.jsonFormatted)
  mongodb.connect(process.env.MONGODB2, function (err, client){
    if (err) {console.log(err)}
    var db = client.db("polls")
    var user = false
    var ip = false
    var collection = db.collection("pollList")
    if(pollUpdate.addUserName){
      collection.find({_id: ObjectId(pollUpdate.id), voted : {$elemMatch : {$in: [pollUpdate.addUserName, pollUpdate.addIp]}}}).toArray(function(err, data) {
        if (data.length === 0) {
          collection.update({_id: ObjectId(pollUpdate.id)}, {$addToSet: {voted : { $each: [pollUpdate.addUserName, pollUpdate.addIp ]}}}, function(err, res) {
            if (err) throw err;
          })
          vote();
        }
      })
    } else {
      collection.find({_id: ObjectId(pollUpdate.id), voted : {$elemMatch : {$eq: pollUpdate.addIp}}}).toArray(function(data) {
        if(data.length === 0){
          collection.update({_id: ObjectId(pollUpdate.id)}, {$push: {voted : pollUpdate.addIp}}, function(err, res) {
            if (err) throw err;
          })
          vote();
        }
      })
    }
    function vote(){
      if (pollUpdate.update){
        var update = {["votes."+pollUpdate.update] : 1}
        if (ip === false && user === false) {
          collection.update({_id: ObjectId(pollUpdate.id)}, {$inc: update}, function(err, res) {
            if (err) throw err;
            client.close()
          })
        }
      } else {
        collection.find({_id: ObjectId(pollUpdate.id)}).toArray(function(err, data){
          if (err) throw err
          if (data[0].votes.hasOwnProperty(pollUpdate.addPollOption)) {
          } else {
            collection.update({_id: ObjectId(pollUpdate.id)}, {$set:{["votes."+pollUpdate.addPollOption] : 1}}, function(err, res) {
              if (err) throw err;
            })
            collection.update({_id: ObjectId(pollUpdate.id)}, {$push:{pollOptions: {$each: [pollUpdate.addPollOption], $position : data[0].pollOptions.length-1}}}, function(err, res) {
              if (err) throw err;
              client.close()
            })
          }
        })
      }
    }
  })
  res.redirect("/polls/"+pollUpdate.id)
});
app.get("/api/getProfile", function(req, res){
  var data = {username : req.user.displayName, pic : req.user._json.profile_image_url_https, twtuser : req.user.username, ip : req.headers['x-forwarded-for'].split(",")[0]}
  res.json(data)
})
app.get("/api/getPollList", function(req, res){
  var profile;
  if (req.session.passport){
    profile = {username : req.user.displayName, pic : req.user._json.profile_image_url_https, twtuser : req.user.username, ip : req.headers['x-forwarded-for'].split(",")[0]}
  } else {profile = {ip: req.headers['x-forwarded-for'].split(",")[0]}}
  mongodb.connect(process.env.MONGODB2, function (err, client){
    if (err) {console.log(err)}
    var db = client.db("polls")
    var collection = db.collection("pollList").find({}).toArray(
      function(err, data) {
        if (err) throw err;
        res.json([profile, data])
        client.close();
      })
  })
})
app.get("/api/getPoll/:id", function(req, res){
  var profile;
  if (req.session.passport){
    profile = {username : req.user.displayName, pic : req.user._json.profile_image_url_https, twtuser : req.user.username, ip : req.headers['x-forwarded-for'].split(",")[0]}
  } else {profile = {ip: req.headers['x-forwarded-for'].split(",")[0]}}
  mongodb.connect(process.env.MONGODB2, function (err, client){
    if (err) {console.log(err)}
    var db = client.db("polls")
    var collection = db.collection("pollList").find(ObjectId(req.params.id)).toArray(
      function(err, data) {
        if (err) throw err;
        res.json([profile, data])
        client.close();
      })
  })
})
app.get("/logout", function (req, res) {
  req.session.destroy(function(err){
    if (err)
      throw err;
    res.redirect("/")
  })
});
app.get("/allpolls", function(req, res){
  if (req.session.hasOwnProperty("passport")){
    res.sendFile(__dirname + '/views/allPollsLogged.html')
  } else {
    res.sendFile(__dirname + '/views/allPolls.html')
  }
})
app.get("/mypolls", function(req, res){
  if (req.session.hasOwnProperty("passport")){
    res.sendFile(__dirname + '/views/myPolls.html')
  } else {
    res.sendFile(__dirname + '/views/allPolls.html')
  }
})
app.get("/polls/:id", function(req, res){
  if (req.session.hasOwnProperty("passport")){
    res.sendFile(__dirname + '/views/pollPageLogged.html')
  } else {
    res.sendFile(__dirname + '/views/pollPage.html')
  }
})
app.get("/delete/:id", function(req, res){
  if (req.session.hasOwnProperty("passport")){
    mongodb.connect(process.env.MONGODB2, function (err, client){
    if (err) {console.log(err)}
    var db = client.db("polls")
    var collection = db.collection("pollList").find(ObjectId(req.params.id)).toArray(
      function(err, data) {
        if (err) throw err;
        if (data[0].pollMaster === req.user.username){
          db.collection("pollList").remove({_id: ObjectId(req.params.id)})
          res.redirect("/allPolls")
        } else{
        res.redirect("/polls/"+req.url.params)}
        client.close();
      })
  })
  } else {
    res.redirect("/polls/"+req.url.params)
  }
})
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
