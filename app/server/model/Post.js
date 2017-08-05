var mongoose = require('mongoose')
var lang	 = require('../lang/en')
var timeago  = require('timeago.js')

var PostSchema = new mongoose.Schema({
	userId: 		{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  	content: 		{ type: String, required: [true, lang.err_post_content_empty] },
    extContent:     { type: mongoose.Schema.Types.ObjectId, ref: 'ExtContent' },
	images:			[ { type: mongoose.Schema.Types.ObjectId, ref: 'Image' } ],
    comments: 		[ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],
  	likes: 			[ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  	date: 			{ type: Date, default: Date.now },
  	privacy: 		{ type: Boolean, default: false }
})
PostSchema.methods.timeago = function(date) {
    return timeago().format(date);
}
mongoose.model('Post', PostSchema)