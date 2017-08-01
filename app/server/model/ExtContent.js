var mongoose = require('mongoose')
var lang	 = require('../lang/en')

var ExtContentSchema = new mongoose.Schema({
    content: 	{ type: String, required: [true, lang.err_ext_content_empty] },
    type: 	    { type: String }
})

mongoose.model('ExtContent', ExtContentSchema)