var mongoose = require('mongoose')
var lang	 = require('../lang/en')
var timeago  = require('timeago.js')

var CommentSchema = new mongoose.Schema({
	userId: 	{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  	content: 	{ type: String, required: [true, lang.err_comment_content_empty] },
  	date: 		{ type: Date, default: Date.now }	
})
CommentSchema.methods.timeago = function(date) {
    return timeago().format(date);
}

mongoose.model('Comment', CommentSchema)