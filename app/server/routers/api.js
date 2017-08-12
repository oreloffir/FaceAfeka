var express = require('express')
var router  = express.Router()
var lang    = require('../lang/en')
var storageManager  = require('../managers/storage-manager')

router.post('/posts/add', function (req, res, next) {
    storageManager.login(req.body.client.email, req.body.client.password, function (err, user) {
        var model = {errors : []}
        if(err)
            model.errors.push(lang.err_login_invalid)
        else{
            storageManager.addPost(user, req.body.postData, function (err, doc) {
                if(err)
                    model.errors.push(lang.err_saving)
                else
                    model.response = doc.id;
            })
        }
        res.json(model);
    })
})



module.exports = router