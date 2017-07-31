var mongoose   		= require('mongoose')
var postSchema 		= mongoose.model('Post')
var commentSchema 	= mongoose.model('Comment')
var userSchema 		= mongoose.model('User')
var commentsPerPage = 3;
mongoose.connect('mongodb://localhost/face_afeka')

var storageManager = {
	login: function(email, password, callback){
		userSchema.findOne({ email: email })
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
            .sort({date: -1})
            .limit(params.limit)
            .exec(function (err, posts) {
                callback(err, posts)
            })
    },
	getPostById: function(postId, callback){
		this.getPosts({_id: mongoose.Types.ObjectId(postId)}, {skip:0, limit:1}, callback)
	},
	getPostsByUser: function(userId, callback){
        this.getPosts({userId: mongoose.Types.ObjectId(userId)}, {skip:0, limit:10}, callback)
	},
	getCommentsPost: function (postId, page, callback) {
	    console.log("page: "+page)
        console.log("start: "+(commentsPerPage * page)+" limit:"+commentsPerPage)
		postSchema.find({ _id: mongoose.Types.ObjectId(postId)}, 'comments')
            .populate({
                path: 'comments',
                model: 'Comment',
                options: {sort:{'date': -1}, skip:commentsPerPage * page, limit: commentsPerPage},
                populate:{
                    path: 'userId',
                    model: 'User'
                }
            })
            .exec(function (err, posts) {
            	callback(err, posts[0].comments)
            })
    },
	addPost: function(user, postData, callback){
        postData.userId		= user.id
		var post 			= new postSchema(postData)
		console.log("add post:\n"+JSON.stringify(post, null, "\t"))
		post.save(function(err, doc){
			callback(err, doc)
		})
	},
	likePost: function (user, postId, callback) {
        this.getPosts({ _id: mongoose.Types.ObjectId(postId), likes: user.id }, {start: 0, limit: 1}, function (err, post) {
        	var action;
        	var like;
            if (post.length > 0){
				action 	= {$pull: {"likes": user.id}}
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
	deletePost: function(){
		console.log("delete post")
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
	getUser: function(userId, callback){
		userSchema.findOne({ _id: userId })
		.exec(function(err, user){
			callback(err, user)
		})
	}
}

module.exports = storageManager;
