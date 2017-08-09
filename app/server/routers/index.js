var express = require('express')
var router  = express.Router()
var lang    = require('../lang/en')
var storageManager  = require('../managers/storage-manager')
var uploadManager   = require('../managers/upload-manager')
//router.use(uploadManager.uploadProfileImage)

/**
 * This function is a middleware for checking if a user is login
 * If not the request will redirect to /login
 */
var isAuth = function(req, res, next){
    if(req.session.user){
        //console.log('userOnline!')
        next()
    }
    else
        res.redirect('/login')
}

router.get('/signup', function(req, res, next){
    res.render('signup', {title: lang.title_signup})
})

/**
 * This route is for signup post request
 * uploadManager.uploadProfileImage is a middleware to upload the profile photo
 * @see upload-manager
 * @see storage-manager.addUser
 */
router.post('/signup', uploadManager.uploadProfileImage, function(req, res, next){
	uploadManager.createProfileImgs(req.file)
	var model = { title: lang.title_signup, errors: [] }
	validateSignupInput(req, function(errArray , req){
		if(errArray){
			model.errors = errArray
			res.render('signup', model)
		}else{
		    // get the userData from the form
			var userData = req.body;
			// set the profile photo
			userData.imagePath = req.file.filename;
			storageManager.addUser(userData, function(err, callback){
				if (err) {
					console.log('Error Inserting New Data');
					if (err.name === 'ValidationError')
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

/**
 * This route is for login post request
 * @see storage-manager.login
 */
router.post('/login', function(req, res, next){
    console.log('post request for login')
    storageManager.login(req.body.email, req.body.password, function(err, user){
        if(user){
            // set the user session
            req.session.user = {
                id: user._id,
                displayName: user.displayName,
                email: user.email,
	            imagePath: user.imagePath,
                friends: user.friends
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

/**
 * This routes validate any request to the server for login
 */
router.get('/*', isAuth, function(req, res, next){
    next()
})
router.post('/*', isAuth, function(req, res, next){
    next()
})

/**
 * Home page
 */
router.get('/', function(req, res, next){
    // get the user friends to display their posts
    storageManager.getFriendsByUserId(req.session.user.id.toString(), function (err, friends) {
        if(err) throw err
        if(!friends) friends = []
        // add user id to dislpay his posts also
        friends.push(req.session.user.id)
        storageManager.getPosts(
            // the query
            {
            $or:[{
                $and:[
                    {userId: {$in: friends}},
                    {privacy: false}
                ]},
                {userId: req.session.user.id}]
            },
            // show 20 results @todo: define const
            {start:0, limit:20},
            // callback function
            function (err, posts) {
                var model = {
                    user: req.session.user,
                    title: lang.title_main,
                    friends: friends,
                    posts: posts,
                    showAddPost: true
                }
                res.render('index', model)
            }
        )
    })
})

router.get('/logout', function(req, res, next){
    req.session.destroy()
    res.redirect('/login')
})

var validateSignupInput = function(req, callback){
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