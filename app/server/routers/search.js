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
    storageManager.searchUsers(req.params.value, function(err, users){
        var model = {errors: []}
        if(err){
            model.errors.push(lang.err_searching)
            model.success = false
        }else{
            model.success = true
            model.res     = users.slice(0,6)
        }
        res.json(model)
    })
})

module.exports = router