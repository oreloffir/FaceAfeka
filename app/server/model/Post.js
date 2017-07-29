var mongoose = require('mongoose')
var lang	 = require('../lang/en')

var PostSchema = new mongoose.Schema({
	userId: 	{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  	content: 	{ type: String, required: [true, lang.err_post_content_empty] },
  	imagePath: 	String,
  	likes: 		[ String ],
  	date: 		{ type: Date, default: Date.now }, 	
  	comments: 	[{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  	privacy: 	{ type: Boolean, default: false }
})

mongoose.model('Post', PostSchema)