var mongoose = require('mongoose')
var lang	 = require('../lang/en')

var ImageSchema = new mongoose.Schema({
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId: 	{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    imagePath: 	{ type: String, required: [true, lang.err_post_image_empty] },
    date: 	    { type: Date, default: Date.now }
})

mongoose.model('Image', ImageSchema)