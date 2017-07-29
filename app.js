var http 		= require('http')
var express 	= require('express')
var session 	= require('express-session')
var bodyParser 	= require('body-parser')
require('./app/server/model/Post')
require('./app/server/model/Comment')
require('./app/server/model/User')

// Set express application
var app = express()
app.set('port', 3000)
app.set('views', __dirname + '/app/server/views')
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/app/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({secret:'sdaggrdeger645645ydfh5dgfs4'}));

// Set application routes
require('./app/server/routes')(app)

// Start server
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'))
})