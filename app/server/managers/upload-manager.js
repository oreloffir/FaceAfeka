var multer   = require('multer')
var jimp = require("jimp");

var storageProfileImg = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './app/public/images/profile')
	},
	filename: function (req, file, cb) {
		cb(null, 'profile' + '_' + Date.now() + '.jpg')
	}
})

var storagePostImg = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './app/public/images/post')
    },
    filename: function (req, file, cb) {
        cb(null, 'post_image_' + '_' + Date.now() + '.jpg')
    }
})

module.exports.uploadProfileImage = multer({
	storage: storageProfileImg,
	limits: {
		files: 1,
		filesize: 5
	}
}).single('profileImage')

module.exports.uploadPostImages = multer({
    storage: storagePostImg,
    limits: {
        files: 4,
        filesize: 5
    }
}).array('uploadPostImages')

module.exports.createProfileImgs = function (file) {
	console.log(file.filename + ' uploaded to  ' + file.path)
	// create new img 400X400
	jimp.read(file.path , function (err, img) {
		if (err) throw err;
		img.resize(400, 400) // resize
			.quality(90) // set JPEG quality
			.write(file.path); // save
	})

	var tmbImgPath = file.path.split('\\')
	tmbImgPath[tmbImgPath.length-1] = "tmb_" + tmbImgPath[tmbImgPath.length-1];
	tmbImgPath =tmbImgPath.join('\\')
	// create new tmb_img 70X70
	jimp.read(file.path , function (err, img) {
		if (err) throw err;
		img.resize(70, 70) // resize
			.quality(90) // set JPEG quality
			.write(tmbImgPath); // save
	})
}
