var express = require('express')
var router  = express.Router()
var lang    = require('../lang/en')
require('../model/Post')
require('../model/Comment')
require('../model/User')
var storageManager = require('../managers/storage-manager')

router.get('/', function(req, res, next){
    storageManager.getUserById(req.session.user.id, function(err, user){
        if(err || user === null){
            res.redirect('/')
        }else{
            storageManager.getPostsByUser(user.id.toString(), function(err, posts){
                var model = {
                    title: user.displayName + ' profile',
                    user: req.session.user,
                    friends: user.friends,
                    profile: user,
                    posts: posts,
                    postsFilter: 'all'
                }
                res.render('profile', model)
            })
        }
    })
})

router.get('/:id/add', function(req, res, next){
    storageManager.addFriend(req.session.user.id, req.params.id, function(err, user){
        var model = {errors: []}

        if(err){
            model.errors.push(lang.err_saving)
            model.success = false
        }else{
            model.success = true
            model.res     = user.isFriend
        }
        res.json(model)
    })
})

router.get('/:id/:filter?', function(req, res, next){
    storageManager.getUserById(req.params.id, function(err, user){
        if(err || user === null){
            res.redirect('/')
        }else{
            storageManager.getFriendsByUserId(req.session.user.id.toString(), function (err, friends) {
                var action = 'getPostsByUser', filter = 'all'
                if(req.params.filter) {
                    switch (req.params.filter) {
                        case 'photos':
                            filter = 'photos'
                            action = 'getImagesPostsByUser'
                            break
                        case 'external':
                            filter = 'external'
                            action = 'getExternalPostsByUser'
                            break;
                        case 'text':
                            filter = 'text'
                            action = 'getTextPostsByUser'
                    }
                }
                storageManager[action](user.id.toString(), function(err, posts){
                    if(err) throw err
                    if(!friends) friends = []
                    var model = {
                        title: user.displayName + ' profile',
                        user: req.session.user,
                        friends: friends,
                        profile: user,
                        posts: posts,
                        postsFilter: filter
                    }
                    res.render('profile', model)
                    console.log(user)
                })
            })
        }
    })
})

module.exports = router