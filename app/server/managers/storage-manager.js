var mongoose   		= require('mongoose')
var postSchema 		= mongoose.model('Post')
var commentSchema 	= mongoose.model('Comment')
var userSchema 		= mongoose.model('User')

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
    getPosts: function (params, callback) {
        postSchema.find({}, {comments:{$slice:[0, 10]}})
            .populate('userId')
            .populate({
                path: 'comments',
                model: 'Comment',
                populate:{
                    path: 'userId',
                    model: 'User'
                }
            })
            .populate('likes')
            .skip(params.start)
            .sort({date: -1})
            .limit(params.limit)
            .exec(function (err, posts) {

                callback(err, posts)
            })
    },
	getPostById: function(postId, callback){
		postSchema.findOne({_id: postId})
		.populate('comments')
		.populate('userId')
		.exec(function(err, post){
			callback(post)
		})
	},
	getPostsByUser: function(user, callback){
		postSchema.find({ userId: user._id })
        .sort({date: -1})
            .populate('userId')
            .populate({
                path: 'comments',
                model: 'Comment',
                populate:{
                    path: 'userId',
                    model: 'User'
                }
            })
            .populate('likes')
		    .exec(function(err, posts){
			    callback(posts)
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
