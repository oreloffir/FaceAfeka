var express = require('express')
var router  = express.Router()
var lang    = require('../lang/en')
require('../model/Post')
require('../model/Comment')
require('../model/User')
var storageManager = require('../managers/storage-manager')

router.get('/', function(req, res, next){
    storageManager.getUser(req.session.user.id, function(err, user){
        if(err || user === null){
            res.redirect('/')
        }else{
            storageManager.getPostsByUser(user.id.toString(), function(err, posts){
                var model = {
                    title: user.displayName + ' profile',
                    user: req.session.user,
                    profile: user,
                    posts: posts
                }
                res.render('profile', model)
            })
        }
    })
})

router.get('/:id', function(req, res, next){
    storageManager.getUser(req.params.id, function(err, user){
        if(err || user === null){
            res.redirect('/')
        }else{
            storageManager.getPostsByUser(user.id.toString(), function(err, posts){
                if(err) throw err
                var model = {
                    title: user.displayName + ' profile',
                    user: req.session.user,
                    profile: user,
                    posts: posts
                }
                console.log(user)
                res.render('profile', model)
            })
        }
    })
})


module.exports = router