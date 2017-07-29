var express = require('express')
var router  = express.Router()
var lang    = require('../lang/en')
require('../model/Post')
require('../model/Comment')
require('../model/User')
var storageManager = require('../managers/storage-manager')

router.post('/add', function(req, res, next){
    var model = {errors: [] }
    validatePostInput(req.body, function(errArray){
        if(errArray){
            model.errors = errArray
            res.json(model)
        }else{
            storageManager.addPost(req.session.user, req.body, function(err, post){
                if(err){
                    model.errors.push(lang.err_saving)
                    res.json(model)
                }else{
                    model.success = true
                    var resPost = {};
                    resPost.id          = post.id
                    resPost.userId      = req.session.user
                    resPost.date        = post.timeago(post.date)
                    resPost.likes       = []
                    resPost.comments    = []
                    resPost.content     = post.content;
                    console.log(resPost)
                    model.response      = resPost;
                    res.json(model)
                }
            })
        }
    })
})

router.get('/:id', function(req, res, next){
    storageManager.getPostById(req.params.id, function(post){
        var model = {
            user: {
                id: req.session.user.id,
                displayName: req.session.user.displayName
            },
            title: 'Hey',
            message: post
        }
        res.render('index', model)
    })
})

// add comment
router.post('/:id/add', function(req, res, next){
    res.json({status: "ok"});
})

var validatePostInput = function (post , callback) {
    var errArray = []
    if(!post.content || post.content.length === 0)
        errArray.push(lang.err_post_content_empty)
    if(errArray.length > 0)
        callback(errArray)
    else
        callback(null)
}
module.exports = router