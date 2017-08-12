var express = require('express')
var router  = express.Router()
var lang    = require('../lang/en')
require('../model/Post')
require('../model/Comment')
require('../model/User')
var storageManager = require('../managers/storage-manager')

/**
 * This route will handle search request.
 */
router.get('/profile/:value', function(req, res, next){
	var searchValue = req.params.value
	if ( searchValue.localeCompare('*') === 0)
		storageManager.getFriendsByUserId(req.session.user.id,function(err, friends){
			var model = {errors: []}
			if(err){
				model.errors.push(lang.err_searching)
				model.success = false
			}else{
				model.success = true
				console.log("friends: "+friends)
				model.res     = friends
			}
			res.json(model)
		})
	else{
		storageManager.searchUsers(req.params.value, function(err, users){

			var model = {errors: []}
			if(err){
				model.errors.push(lang.err_searching)
				model.success = false
			}else{
				model.success = true
				console.log("users: "+users)
				model.res     = users.slice(0,6)
			}
			res.json(model)
		})
	}

})

module.exports = router