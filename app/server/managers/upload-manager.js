// upload files npm
var multer   = require('multer')
// edit photos npm
var jimp = require("jimp");
// create a new disk storage for profile images that define where and how to save the upload
var storageProfileImg = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './app/public/images/profile')
	},
	filename: function (req, file, cb) {
		cb(null, 'profile' + '_' + Date.now() + '.jpg')
	}
})
// create a new disk storage for post images that define where and how to save the upload
var storagePostImg = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './app/public/images/post')
    },
    filename: function (req, file, cb) {
        cb(null, 'post_image_' + '_' + Date.now() + '.jpg')
    }
})

// export upload profile image function that can storage only 1 image in limit of 5MB
module.exports.uploadProfileImage = multer({
	storage: storageProfileImg,
	limits: {
		files: 1,
		filesize: 5
	}
}).single('profileImage')
// export upload post images function that can storage only 4 image in limit of 5MB
module.exports.uploadPostImages = multer({
    storage: storagePostImg,
    limits: {
        files: 4,
        filesize: 5
    }
}).array('uploadPostImages')

// export create profile image function that resize the image and create a thumb
module.exports.createProfileImgs = function (file) {
	// resize the img 400X400
	jimp.read(file.path , function (err, img) {
		if (err) throw err;
		img.resize(400, 400) // resize
			.quality(90) // set JPEG quality
			.write(file.path); // save
	})
	// create new  thumb img 70X70 with the new name: tmb_+the original name
	var tmbImgPath = file.path.split('\\')
	tmbImgPath[tmbImgPath.length-1] = "tmb_" + tmbImgPath[tmbImgPath.length-1];
	tmbImgPath =tmbImgPath.join('\\')

	jimp.read(file.path , function (err, img) {
		if (err) throw err;
		img.resize(70, 70) // resize
			.quality(90) // set JPEG quality
			.write(tmbImgPath); // save
	})
}
