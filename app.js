var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sass = require('node-sass-middleware');
var routes = require('./routes');
var exec = require('child_process').exec;

var app = express();
var server = http.createServer(app);

var sockets = new require('./modules/sockets');
sockets.listen(server);

var can = new require('./modules/can');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(sass({
	src: path.join(__dirname, 'public'),
	dest: path.join(__dirname, 'public'),
	debug: true,
	sourceMap: true,
	outputStyle: 'expanded'
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));

app.get('/', routes.index);
app.get('/pages/:page', routes.pages);
app.get('/pages/:page/:subpage', routes.subpages);
app.get('/partials/:name', routes.partials);
app.get('*', routes.index);

app.set('port', process.env.PORT || 8080);

server.listen(app.get('port'), function() {
	console.log('Listening on port ' + app.get('port'));
});

module.exports = app;