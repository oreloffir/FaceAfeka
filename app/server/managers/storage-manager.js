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
		.populate('comments')
		.populate('userId')
        .populate('likes')
		.exec(function(err, posts){
			callback(posts)
		})
	},
	addPost: function(user, postData, callback){
        postData.userId		= user.id
		var post 		= new postSchema(postData)
		console.log("add post:\n"+JSON.stringify(post, null, "\t"))
		post.save(function(err, doc){
			callback(err, doc)
		})
	},
	deletePost: function(){
		console.log("delete post")
	},
	addComment: function(postId, content){
		postSchema.findOne({_id: postId}, function(err, doc){
			if(err)
				throw err
			var comment = new commentSchema();
			comment.userId = "orel"
			comment.content = "testing123"
			comment.save()
			doc.comments.push(comment);
			doc.save(function(err, res){
				callback(err, res)
			})
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
