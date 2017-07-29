module.exports = function(app) {
	var storageManager = require('./managers/storage-manager')
	var lang		   = require('./lang/en')

	app.get('/signup', function(req, res, next){
		res.render('signup', {title: lang.title_signup})
	})

	app.post('/signup', function(req, res, next){
		var model = { title: lang.title_signup, errors: [] }
		validateSignupInput(req.body, function(errArray){
			if(errArray){
				model.errors = errArray
				res.render('signup', model)
			}else{
				storageManager.addUser(req.body, function(err, callback){
					if (err) {
						console.log('Error Inserting New Data');
		    			if (err.name == 'ValidationError')
							for (field in err.errors){
				    			model.errors.push(err.errors[field].message)
							}
						res.render('signup', model)
					}else{
						console.log("new user registered")
						res.redirect('/login')
					}
				})
			}
		})
	})

	app.get('/login', function(req, res, next){
		res.render('login', {title: lang.title_login})
	})

	app.get('/logout', function(req, res, next){
		req.session.destroy()
		res.redirect('/login')
	})

	app.post('/login', function(req, res, next){
		console.log('post request for login')
		storageManager.login(req.body.email, req.body.password, function(err, user){
			if(user){
                req.session.user = {
                    id: user._id,
                    displayName: user.displayName
                }
                console.log("session user "+ req.session.user.displayName);

				res.redirect('/home')
			}
			else{
				var model = {
					title: lang.title_login,
					errors: [lang.err_login_invalid]
				}
				res.render('login', model)
			}
		})
	})

	app.get('/*', function(req, res, next){
		if(req.session.user){
			console.log('userOnline!')
			next()
		}
		else
			res.redirect('/login')
	})

	app.get('/home', function(req, res, next){
		var model = {
			user: {
				id: req.session.user.id,
				displayName: req.session.user.displayName
			},
			title: 'FaceAfeka',
			message: 'hello'
		}
		//console.log(model)
		res.render('index', model)

	})



	app.get('/addPost', function(req, res, next){
		storageManager.addPost(null, function(err, post){
			if(err)
				throw err
			res.render('index', { title: 'Hey', message: 'addPost!' })
		})
		
	})

	app.get('/posts/:id', function(req, res, next){
		storageManager.getPost(req.params.id, function(post){
			res.render('index', { title: 'Hey', message: 'getPost!' })
			console.log(JSON.stringify(post, null, "\t"))
		})
	})

	app.get('/profile/:id/posts', function(req, res, next){
		storageManager.getUser(req.params.id, function(err, user){
			if(err || user === null){
				res.redirect('/')
			}else{
				storageManager.getPostsByUser(user, function(posts){
					var model = {
						title: user.displayName + ' profile',
						user: {
							id: req.session.userId
						},
						message: posts
					}
					res.render('index', model)
				})
			}
		})
	})

	app.get('/addComment/:id', function(req, res, next){
		storageManager.addComment(req.params.id, null)
		res.render('index', { title: 'Hey', message: 'addComment!' })
	})

	var validateSignupInput = function(userData, callback){
		var errArray = []
		if(userData.password.length < 5 || userData.password.length > 15)
			errArray.push(lang.err_user_password_invalid)
		if(userData.displayName.length < 5)
			errArray.push(lang.err_user_display_name_short)
		if(userData.displayName.length > 15)
			errArray.push(lang.err_user_display_name_long)

		var regexEmail = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
		if(!regexEmail.test(userData.email))
			errArray.push(lang.err_user_email_invalid)

		if(errArray.length > 0)
			callback(errArray)
		else
			callback(null)
	}
}
