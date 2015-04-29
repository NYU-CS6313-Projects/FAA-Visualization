var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var map = require('./routes/map');
// var route_1975 = require('./routes/1975')
var route_1980 = require('./routes/1980');
// var route_1985 = require('./routes/1985')
// var route_1990 = require('./routes/1990')
// var route_1995 = require('./routes/1995')
// var route_2000 = require('./routes/2000')
// var route_2005 = require('./routes/2005')
// var route_2010 = require('./routes/2010')

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

app.use('/', index);
app.use('/map', map);
app.use('/users', users);
app.use('/1980-visualization', route_1980)

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
        res.render('jade/error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('jade/error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
