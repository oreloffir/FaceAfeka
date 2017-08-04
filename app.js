var http 		    = require('http')
var express 	    = require('express')
var session 	    = require('express-session')
var bodyParser 	    = require('body-parser')
var multer 	        = require('multer')

// Mongo schemas
require('./app/server/model/Post')
require('./app/server/model/Comment')
require('./app/server/model/User')
require('./app/server/model/ExtContent')

// Routes
var postsRoute 	    = require('./app/server/routers/posts')
var authRoute       = require('./app/server/routers/auth')
var profileRoute    = require('./app/server/routers/profile')
var searchRoute    = require('./app/server/routers/search')

// Set express application
var app = express()
app.set('port', 3000)
app.set('views', __dirname + '/app/server/views')
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/app/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret:'sdaggrdeger645645ydfh5dgfs4',
    saveUninitialized: true,
    resave: true
}));
// Set application routes
app.use('/', authRoute);
app.use('/posts', postsRoute);
app.use('/profile', profileRoute);
app.use('/search', searchRoute);

// Start server
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'))
})