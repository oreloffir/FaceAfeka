var mongoose = require('mongoose')
var lang	 = require('../lang/en')

var CommentSchema = new mongoose.Schema({
	userId: 	{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  	content: 	{ type: String, required: [true, lang.err_comment_content_empty] },
  	date: 		{ type: Date, default: Date.now }	
})

mongoose.model('Comment', CommentSchema)