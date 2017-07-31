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
                    model.success = false
                }else{
                    model.success = true
                    var resPost = {}
                    resPost.id          = post.id
                    resPost.userId      = req.session.user
                    resPost.date        = post.timeago(post.date)
                    resPost.likes       = []
                    resPost.comments    = []
                    resPost.content     = post.content;
                    console.log(resPost)
                    model.response      = resPost;
                }
                res.json(model)
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
    var model = {errors: [] }

    validateCommentInput(req.body, function (errArray) {
        if(errArray){
            model.errors = errArray
            res.json(model)
        }else{
            storageManager.addComment(req.session.user, req.body.postid, req.body, function(err, comment){
                if(err){
                    model.errors.push(lang.err_saving)
                    model.success = false
                }else{
                    model.success = true
                    var resComment = {}
                    resComment.id           = comment.id
                    resComment.userId       = req.session.user
                    resComment.date         = comment.timeago(comment.date)
                    resComment.content      = comment.content;
                    console.log(resComment)
                    model.response          = resComment;
                }
                res.json(model)
            })
        }
    });
})

// add like
router.get('/:id/like', function(req, res, next){
    var model = {errors: [] }
    storageManager.likePost(req.session.user, req.params.id, function(err, like){
        if(err){
            model.errors.push(lang.err_like)
            model.success = false
        }
        else{
            model.success = true
            model.res     = like
        }
        res.json(model);
    });
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

var validateCommentInput = function (comment , callback) {
    var errArray = []
    if(!comment.content || comment.content.length === 0)
        errArray.push(lang.err_comment_content_empty)
    if(errArray.length > 0)
        callback(errArray)
    else
        callback(null)
}
module.exports = router