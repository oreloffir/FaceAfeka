var express = require('express')
var router  = express.Router()
var lang    = require('../lang/en')
require('../model/Post')
require('../model/Comment')
require('../model/User')
var storageManager = require('../managers/storage-manager')
var uploadManager  = require('../managers/upload-manager')

router.post('/add', uploadManager.uploadPostImages, function(req, res, next){
    var model = {errors: [] }
    validatePostInput(req.body, function(errArray){
        if(errArray){
            model.errors = errArray
            res.json(model)
        }else{
            var postData = req.body;
            postData.imagesNames = [];
            req.files.forEach(function (file) {
                postData.imagesNames.push(file.filename)
            })
            console.log("postData:")
            console.log(postData)
            storageManager.addPost(req.session.user, postData, function(err, post){
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
    storageManager.getPostById(req.params.id, function(err, post){
        var model = {
            user: req.session.user,
            title: lang.title_main,
            posts: [post],
        }
        res.render('singlePost', model)
    })
})

router.delete('/:id', function(req, res, next){
    var model = { errors: [] }
    storageManager.deletePost(req.params.id, function (err) {
        if(err)
            model.errors.push(lang.err_saving)
        else{
            model.success = true
            res.json(model)
        }
    })
})

router.get('/:id/ajax', function(req, res, next){
    var model = { errors: [] }
    storageManager.getPostById(req.params.id, function(err, post){
        console.log(post)
        var model = {
            user: req.session.user,
            posts: [post]
        }
        res.render('fragments/posts', model);
    })
})

router.post('/:id/edit', function(req, res, next){
    var model = { errors: [] }

    validateEditPostInput(req.body.content, function (errArray) {
        if (errArray) {
            model.errors = errArray
            res.json(model)
        } else {
            var update = {content: req.body.content, privacy: req.body.privacy}
            storageManager.updatePost(req.params.id, update, function(err, post){
                if(err){
                    model.errors.push(lang.err_saving)
                    model.success = false
                }else{
                    model.response  = post
                    model.success   = true
                }
                res.json(model)
            })
        }
    })
})

router.get('/:id/comments/:page', function(req, res, next){
    var model = {errors: [] }
    storageManager.getCommentsPost(req.params.id, parseInt(req.params.page), function(err, comments){
        if(err){
            model.errors.push(lang.err_load_comments)
            model.success = false
        }
        else{
            model.success   = true
            model.response  = comments

        }
        res.json(model);
    });
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
            model.success   = true
            model.response  = like
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
    if(comment.content.trim().length === 0)
        errArray.push(lang.err_comment_content_empty)
    if(errArray.length > 0)
        callback(errArray)
    else
        callback(null)
}

var validateEditPostInput = function (content, callback) {
    var errArray = []
    if(content.trim().length === 0)
        errArray.push(lang.err_post_content_empty)
    if(errArray.length > 0)
        callback(errArray)
    else
        callback(null)
}
module.exports = router