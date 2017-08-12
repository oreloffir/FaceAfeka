var mongoose 		= require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
var crypto			= require('crypto')
var lang			= require('../lang/en')

var UserSchema = new mongoose.Schema({
	displayName: { 
		type: String, 
		minlength: [5, lang.err_user_display_name_short], 
		maxlenght: [15, lang.err_user_display_name_long], 
		required:  [true, lang.err_user_display_name_empty],
		index: true
	},
	email: { 
		type: String,
		lowercase: true,
		unique: true,
		required: [true, lang.err_user_email_empty],
		match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, lang.err_user_email_invalid] ,
		index: true
	},
  	imagePath: String,
  	date: { 
  		type: Date, 
  		default: Date.now 
  	},
  	friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  	hash: {type: String, select: false},
  	salt: {type: String, select: false}
})
UserSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex')
	this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
}
UserSchema.methods.validPassword = function(password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
	return this.hash === hash
}
UserSchema.plugin(uniqueValidator, {message: lang.err_value_taken})

mongoose.model('User', UserSchema)