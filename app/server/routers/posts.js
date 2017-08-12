var express = require('express')
var router  = express.Router()
var lang    = require('../lang/en')
require('../model/Post')
require('../model/Comment')
require('../model/User')
var storageManager = require('../managers/storage-manager')
var uploadManager  = require('../managers/upload-manager')

/**
 * This route manages post request to add new post
 * uploadManager.uploadPostImages is a middleware to upload images
 * @see upload-manager.uploadPostImages
 * @see storage-manager.addPost
 */
router.post('/add', uploadManager.uploadPostImages, function(req, res, next){
    var model = {errors: [] }
    validatePostInput(req.body, function(errArray){
        if(errArray){
            model.errors = errArray
            res.json(model)
        }else{
            // create postData object
            var postData = req.body;
            // set a property of images names array
            postData.imagesNames = [];
            // if we have files uploaded, we need to add them to the post,
            // storage manager will handle the rest
            req.files.forEach(function (file) {
                postData.imagesNames.push(file.filename)
            })
            //console.log("postData:")
            //console.log(postData)
            storageManager.addPost(req.session.user, postData, function(err, post){
                if(err){
                    model.errors.push(lang.err_saving)
                    model.success = false
                }else{
                    model.success = true
                    // create result post for client
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

/**
 * This route will return a single post view based on specific post id
 */
router.get('/:id', function(req, res, next){
    storageManager.getPostById(req.params.id, function(err, post){
        var model = {
            user: req.session.user,
            title: lang.title_main,
            posts: [post]
        }
        res.render('singlePost', model)
    })
})
/**
 * This route will handle delete request for a post
 */
router.delete('/:id', function(req, res, next){
    var model = { errors: [] }
    storageManager.deletePost(req.session.user, req.params.id, function (err) {
        if(err)
            model.errors.push(lang.err_saving)
        else{
            model.success = true
            res.json(model)
        }
    })
})

/**
 * This route return a single view of a specific post (html only)
 */
router.get('/:id/ajax', function(req, res, next){
    storageManager.getPostById(req.params.id, function(err, post){
        console.log(post)
        var model = {
            user: req.session.user,
            posts: [post]
        }
        res.render('fragments/posts', model);
    })
})

/**
 * This route will handle post request for editing a post
 */
router.post('/:id/edit', function(req, res, next){
    var model = { errors: [] }

    validateEditPostInput(req.body.content, function (errArray) {
        if (errArray) {
            model.errors = errArray
            res.json(model)
        } else {
            var update = {content: req.body.content, privacy: req.body.privacy}
            storageManager.updatePost(req.session.user, req.params.id, update, function(err, post){
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

/**
 * This route handle load more comments ajax call
 */
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

/**
 * This route will handle a new comment post request for a specific post
 * @see storage-manager.addComment
 */
router.post('/:id/add', function(req, res, next){
    var model = {errors: [] }

    validateCommentInput(req.body, function (errArray) {
    	console.log("error: "+errArray)
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
                    // create the response comment element for client
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

/**
 * This route will handle like post request
 */
router.post('/:id/like', function(req, res, next){
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
	console.log("validateCommentInput "+comment.content.trim().length)
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