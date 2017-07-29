module.exports = function(app) {
	var storageManager = require('./managers/storage-manager')
	var lang		   = require('./lang/en')

	app.get('/home', function(req, res, next){
		var model = {
			user: req.session.user,
			title: 'FaceAfeka',
			message: 'hello'
		}
		//console.log(model)
		res.render('index', model)

	})

}
