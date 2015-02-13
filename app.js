var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//Setup the server by listening to port 3000
var server = require('http').createServer(app);
server.listen(3000); //Listening 
console.log("Socket.io server listening at http://127.0.0.1:3000");

//import the required node module for accessing twitter API 
var Twitter = require('ntwitter');

//setup the keys for authentication
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET,
    });

var loveCount = 0;
var tweetCount = 0;
var hateCount = 0;
var hate_cent,love_cent;

//to differentiate whether it is a love tweet or hate tweet
var is_love;

//setup socket.io and listen to the previously setup server
var sio = require('socket.io').listen(server);

//On connection event callback
sio.sockets.on('connection', function(socket){
    console.log('Web client connected');

    client.stream('statuses/filter', {track:'love,hate'}, function(stream) { //track the tweets containing love or hate
    stream.on('data', function(tweet) {
        tweetCount++; //increase tweet count
        //get tweets containing the word love or Love or LOVE, increase love_count and make is_love true
       if (tweet.text.indexOf('love') != -1 || tweet.text.indexOf('Love')!= -1 || tweet.text.indexOf('LOVE')!= -1) 
        {   
            loveCount+= 1;
            is_love = 1;
        }

        //get tweets containing the word hate or Hate or HATE, increase hate_count and make is_love false
       if (tweet.text.indexOf('hate')!= -1 || tweet.text.indexOf('Hate')!= -1 || tweet.text.indexOf('HATE')!= -1){
                hateCount+=1;
                is_love = 0;
       }
       //Total count is number of love tweets plus number of hate tweets
        tweetCount = hateCount + loveCount;
        console.log(tweet.text);   
        //calculate love and hate percentage 
        love_cent = ((loveCount/tweetCount)*100).toFixed(2) + "%";
        hate_cent = ((hateCount/tweetCount)*100).toFixed(2) + "%";                                                                                                                                                                                                                                                                                                                                                         
        console.log(" ::: count ::: "+tweetCount+ "\n loveCount ::: " + loveCount + "\n hateCount ::: " + hateCount);

        //Emit all the required keys from tweet json to the client using voaltile emit through the socket
        socket.volatile.emit('tweet_info',{ 
            tweet:tweet.text,
            image:tweet.user.profile_image_url,
            name:tweet.user.screen_name,  
            hate_percent:hate_cent,
            love_percent:love_cent,
            hate_count:hateCount,
            love_count:loveCount,
            is_love:is_love
        });
    });
});


    //handle disconnection event
    socket.on('disconnect', function() {
        console.log('Web client disconnected');
    });
});




module.exports = app;
