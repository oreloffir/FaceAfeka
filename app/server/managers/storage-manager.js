var mongoose   		    = require('mongoose')
// import object schema fro mongoDB @see /model
var postSchema 		    = mongoose.model('Post')
var commentSchema 	    = mongoose.model('Comment')
var userSchema 		    = mongoose.model('User')
var extContentSchema 	= mongoose.model('ExtContent')
var imageSchema 	    = mongoose.model('Image')
// The amount of comments for ajax call
var commentsPerPage     = 3;
var postsStartPosition  = 0;
var postsPerPage        = 10;
// Regex and tokens for post ExternalContent
var youTubeRegex        = /.*.youtube.com.*v=([^\&]{11}).*/
var YOUTUBE_CONTENT     = "youtube"
var imageRegex          = /(https?:\/\/.*\.(?:jpg|JPG|jpeg|png|gif))/i
var IMAGE_CONTENT       = "image"
/*  Array of regex and tokens for post ExternalContent,
    See storageManager.getExtContent
*/
var checkRegexArr       = [
    {regex: youTubeRegex, token:YOUTUBE_CONTENT},
    {regex: imageRegex, token:IMAGE_CONTENT}]

mongoose.connect('mongodb://localhost/face_afeka')

var storageManager = {
    /**
        * This method is to login a user based on email and password
        * @callback requestCallback
        * @param {String} email - The email for login
        * @param {String} password - The password for login
        * @param {requestCallback} callback - The callback that handles the response (err, user)
        * @see UserSchema for more information
    **/
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
    /**
     * This method is a generic function to get posts based on a query, with start position and limit,
     * You should use this method as helper, for simpler actions, for example
     * @see getPostById
     *
     * @callback requestCallback
     * @param {object} query - the query to find, for ex { _id: mongoose.Types.ObjectId(postId) }
     * @param {object} params - params is object who contains params.start, params.limit
     *                          start is the start position for the returned posts,
     *                          limit is the amount of posts to return.
     * @param {requestCallback} callback - The callback that handles the response (err, posts)
     **/
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
    /**
     * This method will callback a post that have a specific id
     * @use getPosts
     * @callback requestCallback
     * @param {String} postId - the post id to find.
     * @param {requestCallback} callback - The callback that handles the response (err, posts)
     **/
	getPostById: function(postId, callback){
		this.getPosts({_id: mongoose.Types.ObjectId(postId)}, {skip:0, limit:1}, function (err, posts) {
            if(posts[0])
                callback(null, posts[0])
            else
                callback(err, posts)
        })
	},
    /**
     * This method will callback the recent postsPerPage posts of a user
     * @see postsPerPage
     * @use getPosts
     *
     * @callback requestCallback
     * @param {String} userId - the user id posts to find.
     * @param {requestCallback} callback - The callback that handles the response (err, posts)
     **/
	getPostsByUser: function(userId, callback){
        this.getPosts({userId: mongoose.Types.ObjectId(userId)}, {skip:postsStartPosition, limit:postsPerPage}, callback)
	},
    /**
     * This method will callback the recent postsPerPage posts that contains images of a user
     * @see postsPerPage
     * @use getPosts
     *
     * @callback requestCallback
     * @param {String} userId - the user id images posts to find.
     * @param {requestCallback} callback - The callback that handles the response (err, posts)
     **/
    getImagesPostsByUser: function (userId, callback) {
        var query = {
            userId: mongoose.Types.ObjectId(userId),
            images: { $exists: true, $ne: [] }
        }
        this.getPosts(query, {skip:postsStartPosition, limit:postsPerPage}, callback)
    },
    /**
     * This method will callback the recent postsPerPage posts that contains external content of a user
     * @see postsPerPage
     * @use getPosts
     *
     * @callback requestCallback
     * @param {String} userId - the user id external content posts to find.
     * @param {requestCallback} callback - The callback that handles the response (err, posts)
     **/
    getExternalPostsByUser: function (userId, callback) {
        var query = {
            userId: mongoose.Types.ObjectId(userId),
            extContent: { $exists: true }
        }
        this.getPosts(query, {skip:0, limit:10}, callback)
    },
    /**
     * This method will callback the recent postsPerPage posts that contains only text of a user
     * @see postsPerPage
     * @use getPosts
     *
     * @callback requestCallback
     * @param {String} userId - the user id text posts to find.
     * @param {requestCallback} callback - The callback that handles the response (err, posts)
     **/
    getTextPostsByUser: function (userId, callback) {
        var query = {
            userId: mongoose.Types.ObjectId(userId),
            extContent: { $exists: false },
            images: []
        }
        this.getPosts(query, {skip:0, limit:10}, callback)
    },
    /**
     * The following method use is for ajax call to load more comments DESC by date (default).
     * The page param is for pagination, which chunk to return.
     * for example page number 2 will return comments at index 6-8.
     * Calculation: start: (commentsPerPage * page), limit: commentsPerPage
     *
     * @callback requestCallback
     * @param {String} postId - the post id posts to find.
     * @param {int} page - the page.
     * @param {requestCallback} callback - The callback that handles the response (err, posts)
     **/
	getCommentsPost: function (postId, page, callback) {
	    //console.log("page: "+page)
        //console.log(")
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
    /**
     * This method will add a new post and callback the inserted post
     *
     * @callback requestCallback
     * @param {UserSchema} user - the user
     * @param {object} postData - the post data, should contain the post data which sent by the user
     * @param {requestCallback} callback - The callback that handles the response (err, post)
     **/
	addPost: function(user, postData, callback) {
        postData.userId = user.id
        var post        = new postSchema(postData)
        // check if the user uploaded images
        if(postData.imagesNames && postData.imagesNames.length > 0) {
            // In order to have post id for ImageSchema, post.save is required
            post.save(function (err, post) {
                if (err) {
                    console.log(err)
                    callback(err, post)
                    return
                }
                // create array of imageSchema for each image name post.Data contains
                var imagesArr = []
                postData.imagesNames.forEach(function (imagePath) {
                    imagesArr.push(new imageSchema({
                        userId: user.id,
                        postId: post.id,
                        imagePath: imagePath
                    }))
                })
                // save the array of imageSchema, and update the post
                imageSchema.insertMany(imagesArr, function (err, images) {
                    post.images = images
                    post.save(callback)
                })
            })
        // If there is no images, check for external content
        // post cannot have both
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
    /**
     * This method will like a post
     * @callback requestCallback
     * @param {UserSchema}  user - the user
     * @param {String}      postId - the post id the user wants to like
     * @param {requestCallback} callback - The callback that handles the response (err, like)
     *         if like = true - the user like the post
     *         else - the user unliked the post
     */
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
    /**
     * This method responsible to update a post based on post id
     *
     * @callback requestCallback
     * @param {UserSchema} user - the user
     * @param {String} postId - the post id to edit
     * @param {object} update - fields with value according to postSchema
     *         for example { content: "updated content" } will set the post content to "updated content".
     * @param {requestCallback} callback - The callback that handles the response (err, post)
     */
    updatePost: function (user, postId, update, callback) {
        postSchema.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(postId), userId: user.id },
            {$set: update},
            {safe: true, upsert: true, new : true},
            callback)
    },
    /**
     * This method will delete a post based on post id
     * @callback requestCallback
     * @param {UserSchema} user - the user
     * @param {String} postId - the post id to delete
     * @param {requestCallback} callback
     */
	deletePost: function(user, postId, callback){
        postSchema.findOne({ _id: mongoose.Types.ObjectId(postId), userId: user.id }, function (err, post) {
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
    /**
     * This method will add a comment to a post
     *
     * @callback requestCallback
     * @param {userSchema} user - The user who commented
     * @param {String} postId - The post id to add the comment
     * @param {object} commentData - the required comment data according to commentSchema
     *                               in this case, required only content
     * @param {requestCallback} callback (err, comment)
     */
	addComment: function(user, postId, commentData, callback){
        commentData.userId = user.id
		var comment = new commentSchema(commentData)
        //console.log("add comment:\n"+JSON.stringify(comment, null, "\t"))
        // save the comment
        comment.save(function (err, doc) {
            if(err) {
                console.log(err);
                callback(err, doc);
            }else{
                // update the post
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
    /**
     * This method will add a new user to the system (Register)
     *
     * @callback requestCallback
     * @param {object} userData - the required fields according to UserSchema
     * @param {requestCallback} callback (err, user)
     */
	addUser: function(userData, callback){
		var user = new userSchema(userData)
		user.setPassword(userData.password)
		user.save(function(err,res){
			callback(err, res)
		})
	},
    /**
     * This method is a generic function to get users based on a query,
     * You should use this method as helper, for simpler actions, for example
     * @see getUserById
     * @callback requestCallback
     * @param {object} query - the query to find, for ex { _id: mongoose.Types.ObjectId(userId) }
     * @param {requestCallback} callback - The callback that handles the response (err, users)
     **/
    getUsers: function(query, callback){
        userSchema.find(query)
            .populate('friends')
            .exec(function(err, users){
            	console.log(users)
	            mongoose
                callback(err, users)
            })
    },
    /**
     * This method will callback a user based on specific user id
     * @use getUsers
     *
     * @callback requestCallback
     * @param {String} userId - the user id to find
     * @param {requestCallback} callback - The callback that handles the response (err, user)
     **/
    getUserById: function(userId, callback){
        this.getUsers({_id: mongoose.Types.ObjectId(userId)}, function (err, users) {
            if(users)
                callback(err, users[0])
            else
                callback(err, null)
        })
    },
    /**
     * This method will callback all the users which theirs display name have a specific sub-string
     * @callback requestCallback
     * @param {String} searchValue - The start sub string to match for user display name
     * @param {requestCallback} callback - The callback that handles the response (err, users)
     **/
	searchUsers: function (searchValue , callback) {
    	var query = { displayName: { $regex: '^' + searchValue, $options: "i" } }
        this.getUsers(query,callback)
	},
    /**
     * This method will add a user to the friends list of another user
     * @see UserSchema
     *
     * @callback requestCallback
     * @param {String} userId - the user id who requested to add friend
     * @param {String} friendId - the friend user id to add
     * @param {requestCallback} callback - The callback that handles the response (err, userCallback)
     *                          userCallback.isFriend - boolean - true if now the 2 users are friends, false otherwise
     *                          userCallback.friends  - array - the updated friends array
     */
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
    /**
     * This method will callback all the friends ids of a user
     * @callback requestCallback
     * @param {String} userId - the user id to get friends
     * @param {requestCallback} callback - The callback that handles the response (err, friends)
     */
    getFriendsByUserId: function (userId, callback) {
        var query = { _id: mongoose.Types.ObjectId(userId)}
        userSchema.find(query, function (err, users) {
            if(users)
                callback(err, users[0].friends)
            else
                callback(err, null)
        });
    },
    /**
     * This method will callback all the images a specific user have uploaded
     * @see ImageSchema
     *
     * @param {String} userId - the user id
     * @param {object} params - params is object who contains params.start, params.limit
     *                          start is the start position for the returned images obj,
     *                          limit is the amount of images obj to return.
     * @param callback
     */
    getImagesByUserId: function (userId, params, callback) {
        imageSchema.find({ userId: mongoose.Types.ObjectId(userId)})
            .sort({date: -1})
            .skip(params.start)
            .limit(params.limit)
            .exec(callback)
    },
    /**
     * This method will analysis a given post content for external content
     * Regex and token are defined at checkRegexArr
     * @see checkRegexArr
     * @see addPost
     * @return {object} result, result.content = the external content required value,
     *                          result.type = the token
     */
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
