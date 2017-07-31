var express = require('express')
var router  = express.Router()
var lang    = require('../lang/en')
require('../model/Post')
require('../model/Comment')
require('../model/User')
var storageManager  = require('../managers/storage-manager')
var uploadManager   = require('../managers/upload-manager')

//router.use(uploadManager.uploadProfileImage)

var isAuth = function(req, res, next){
    if(req.session.user){
        console.log('userOnline!')
        next()
    }
    else
        res.redirect('/login')
}

router.get('/signup', function(req, res, next){
    res.render('signup', {title: lang.title_signup})
})

router.post('/signup', uploadManager.uploadProfileImage, function(req, res, next){
	uploadManager.createProfileImgs(req.file)
	var model = { title: lang.title_signup, errors: [] }
	validateSignupInput(req, function(errArray , req){
		if(errArray){
			model.errors = errArray
			res.render('signup', model)
		}else{
			var userData = req.body;
			userData.imagePath = req.file.filename;
			storageManager.addUser(userData, function(err, callback){
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

router.get('/login', function(req, res, next){
    res.render('login', {title: lang.title_login})
})


router.post('/login', function(req, res, next){
    console.log('post request for login')
    storageManager.login(req.body.email, req.body.password, function(err, user){
        if(user){
            req.session.user = {
                id: user._id,
                displayName: user.displayName,
                email: user.email,
	            imagePath: user.imagePath
            }
            console.log("session user "+ req.session.user.displayName);

            res.redirect('/')
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

router.get('/*', isAuth, function(req, res, next){
    next()
})

router.post('/*', isAuth, function(req, res, next){
    next()
})


router.get('/', function(req, res, next){
    storageManager.getPosts({}, {start:0, limit:10}, function (err, posts) {
        var model = {
            user: req.session.user,
            title: lang.title_main,
            posts: posts
        }
        res.render('index', model)
    })
})

router.get('/logout', function(req, res, next){
    req.session.destroy()
    res.redirect('/login')
})

var validateSignupInput = function(userData, callback){
    var errArray = []
	var userData = req.body
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
        callback(errArray , req)
    else
        callback(null , req)
}

module.exports = router