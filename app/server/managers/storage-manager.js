var mongoose   		    = require('mongoose')
var postSchema 		    = mongoose.model('Post')
var commentSchema 	    = mongoose.model('Comment')
var userSchema 		    = mongoose.model('User')
var extContentSchema 	= mongoose.model('ExtContent')
var imageSchema 	    = mongoose.model('Image')
var commentsPerPage     = 3;
var youTubeRegex        = /.*.youtube.com.*v=([^\&]{11}).*/
var YOUTUBE_CONTENT     = "youtube"
var imageRegex          = /(https?:\/\/.*\.(?:jpg|JPG|jpeg|png|gif))/i
var IMAGE_CONTENT       = "image"
var checkRegexArr       = [{regex: youTubeRegex, token:YOUTUBE_CONTENT},
                           {regex: imageRegex, token:IMAGE_CONTENT}]

mongoose.connect('mongodb://localhost/face_afeka')

var storageManager = {
	login: function(email, password, callback){
		userSchema.findOne({ email: email.toLowerCase()},['+hash', '+salt'])
		.exec(function(err, user){
			if(err)
				callback(err, null)
			else if(user)
				if(user.validPassword(password))
					callback(null, user)
				else
                    callback(null, null)
			else
				callback(null, null)

		})
	},
    getPosts: function(query, params, callback) {
        postSchema.find(query)
            .populate('userId')
            .populate('extContent')
            .populate('images')
            .populate({
                path: 'comments',
                model: 'Comment',
                options: {sort:{'date': -1}},
                populate:{
                    path: 'userId',
                    model: 'User'
                }
            })
            .skip(params.start)
            .limit(params.limit)
            .sort({date: -1})
            .exec(function (err, posts) {
                callback(err, posts)
            })
    },
	getPostById: function(postId, callback){
		this.getPosts({_id: mongoose.Types.ObjectId(postId)}, {skip:0, limit:1}, function (err, posts) {
            if(posts[0])
                callback(null, posts[0])
            else
                callback(err, posts)
        })
	},
	getPostsByUser: function(userId, callback){
        this.getPosts({userId: mongoose.Types.ObjectId(userId)}, {skip:0, limit:10}, callback)
	},
    getImagesPostsByUser: function (userId, callback) {
        var query = {
            userId: mongoose.Types.ObjectId(userId),
            images: { $exists: true, $ne: [] }
        }
        this.getPosts(query, {skip:0, limit:10}, callback)
    },
    getExternalPostsByUser: function (userId, callback) {
        var query = {
            userId: mongoose.Types.ObjectId(userId),
            extContent: { $exists: true }
        }
        this.getPosts(query, {skip:0, limit:10}, callback)
    },
    getTextPostsByUser: function (userId, callback) {
        var query = {
            userId: mongoose.Types.ObjectId(userId),
            extContent: { $exists: false },
            images: []
        }
        this.getPosts(query, {skip:0, limit:10}, callback)
    },
	getCommentsPost: function (postId, page, callback) {
	    //console.log("page: "+page)
        //console.log("start: "+(commentsPerPage * page)+" limit:"+commentsPerPage)
		postSchema.find({ _id: mongoose.Types.ObjectId(postId)}, 'comments')
            .populate(
                {
                path: 'comments',
                model: 'Comment',
                options: {skip:commentsPerPage * page, limit: commentsPerPage, sort:{'date': -1}},
                populate:{
                    path: 'userId',
                    model: 'User'
                }
            })
            .exec(function (err, posts) {

                var comments = posts[0].comments;
            	comments.forEach(function (comment, idx) {
            	    var c = {}
            	    c.id        = comment.id
                    c.userId    = comment.userId
                    c.content   = comment.content
                    c.date      = comment.date
                    c.date      = comment.timeago(comment.date)
                    comments[idx] = c
                    //console.log()
                })
				console.log(JSON.stringify(comments, null, "\t"))
                callback(err, comments)
            })
    },
	addPost: function(user, postData, callback) {
        postData.userId = user.id
        var post        = new postSchema(postData)

        if(postData.imagesNames && postData.imagesNames.length > 0){
            post.save(function(err, post){
                if(err) {
                    console.log(err)
                    callback(err, post)
                    return
                }
                var imagesArr = []
                postData.imagesNames.forEach(function (imagePath) {
                    imagesArr.push(new imageSchema({
                        userId: user.id,
                        postId: post.id,
                        imagePath: imagePath
                    }))
                })
                imageSchema.insertMany(imagesArr, function (err, images) {
                    post.images = images
                    post.save(callback)
                })
            })
        }else{
            var extContent = this.getExtContent(post.content)
            if (extContent) {
                extContent = new extContentSchema(extContent)
                extContent.save(function (err, doc) {
                    if(err) throw err;
                    post.extContent = doc.id
                    post.save(function(err, doc){
                        callback(err, doc)
                    })
                })
            }else{
                post.save(function(err, doc){
                    callback(err, doc)
                })
            }
        }
	},
	likePost: function (user, postId, callback) {
        this.getPosts({ _id: mongoose.Types.ObjectId(postId), likes: user.id }, {start: 0, limit: 1}, function (err, post) {
        	var action;
        	var like;
            if (post.length > 0){
				action = {$pull: {"likes": user.id}}
                like = false
			}else{
                action = {$push: {"likes": user.id}}
                like = true
            }
            postSchema.findByIdAndUpdate(
                mongoose.Types.ObjectId(postId),
                action,
                {safe: true, upsert: true, new : true},
                function(err, doc) {
                    callback(err, like);
                }
            )
        })
    },
    updatePost: function (postId, update, callback) {
        postSchema.findByIdAndUpdate(mongoose.Types.ObjectId(postId),
            {$set: update},
            {safe: true, upsert: true, new : true},
            callback)
    },
	deletePost: function(postId, callback){
        postSchema.findOne({ _id: mongoose.Types.ObjectId(postId)}, function (err, post) {
            commentSchema.remove({_id: {$in: post.comments}}, function (err) {
                if(post.extContent){
                    extContentSchema.remove({_id: post.extContent}, function () {
                        post.remove(callback)
                    })
                }else{
                    post.remove(callback)
                }
            })
        });
	},
	addComment: function(user, postId, commentData, callback){
        commentData.userId = user.id
		var comment = new commentSchema(commentData)
        console.log("add comment:\n"+JSON.stringify(comment, null, "\t"))
        comment.save(function (err, doc) {
            if(err) {
                console.log(err);
                callback(err, doc);
            }else{
                postSchema.findByIdAndUpdate(
                    mongoose.Types.ObjectId(postId),
                    {$push: {"comments": doc.id}},
                    {safe: true, upsert: true, new : true},
                    function(err, model) {
                        if(err)
                            console.log(err);
                        callback(err, doc);
                    }
                )
            }
        })
	},
	addUser: function(userData, callback){
		var user = new userSchema(userData)
		user.setPassword(userData.password)
		user.save(function(err,res){
			callback(err, res)
		})
	},
    getUsers: function(query, callback){
        userSchema.find(query)
            .populate('friends')
            .exec(function(err, users){
            	console.log(users)
	            mongoose
                callback(err, users)
            })
    },
    getUserById: function(userId, callback){
        this.getUsers({_id: mongoose.Types.ObjectId(userId)}, function (err, users) {
            if(users)
                callback(err, users[0])
            else
                callback(err, null)
        })
    },
	searchUsers: function (serchValue , callback) {
    	var query = { displayName: { $regex: '^'+serchValue, $options: "i" } }
        this.getUsers(query,callback )
	},
    addFriend: function (userId, friendId, callback) {
	    var query = { _id: mongoose.Types.ObjectId(userId), friends: mongoose.Types.ObjectId(friendId)}
	    this.getUsers(query, function (err, users) {
            var action
            var userCallback = {}
            if (users[0]){
                action 	= {$pull: {"friends": mongoose.Types.ObjectId(friendId)}}
                userCallback.isFriend = false
            }else{
                action = {$push: {"friends": mongoose.Types.ObjectId(friendId)}}
                userCallback.isFriend = true
            }
            userSchema.findByIdAndUpdate(
                mongoose.Types.ObjectId(userId),
                action,
                {safe: true, upsert: true, new : true},
                function(err, doc) {
                    userCallback.friendList = doc.friends;
                    callback(err, userCallback);
                }
            )
        })
    },
    getFriendsByUserId: function (userId, callback) {
        var query = { _id: mongoose.Types.ObjectId(userId)}
        userSchema.find(query, function (err, users) {
            if(users)
                callback(err, users[0].friends)
            else
                callback(err, null)
        });
    },
    getImagesByUserId: function (userId, params, callback) {
        imageSchema.find({ userId: mongoose.Types.ObjectId(userId)})
            .sort({date: -1})
            .skip(params.start)
            .limit(params.limit)
            .exec(callback)
    },
    getExtContent: function(content) {
        var matches, result = null
        checkRegexArr.some(function (regexItem){
            matches = regexItem.regex.exec(content)
            if(matches && matches[1]) {
                result = {content: matches[1], type: regexItem.token}
                return true;
            }
        })
        return result
    }
}

module.exports = storageManager;
