/*
Scroll Profile left controller,
responsible for the profile left fragment in the profile view.
listening to scrolling,
change the fragment position according to scrolling
 */
var scrollProfileLeft = {
    init: function () {
        this.startPos   = 20;
        this.leftBlock  = $("#leftSide");
        this.bindEvent();
    },
    bindEvent: function () {
	    //listening to scrolling
        $(window).scroll(this.scroll);
    },
	//change the fragment position according to scrolling
    scroll: function () {
        var windowHeight = $(document).height;
        var self = scrollProfileLeft;
        var top = $(document).scrollTop();
        if (top < self.startPos) top = self.startPos;
        self.leftBlock.css("top", top - self.startPos  + "px");
    }
}

/*
Image dialog controller,
responsible for show/update the image modal.
listening to click on img, right/left change img btns
show the image modal / update the modal
 */
var imageDialog = {
    init: function () {
        // the modal image
        this.imageModalImg      = $('#imageModalImg');
        // the modal right side
        this.rightModal         = $('#imageModalRight');
        // next & prev btn for post with many photos
        this.nextImageBtn       = $('#nextImageModal');
        this.prevImageBtn       = $('#prevImageModal');
        // show the current position in the img arr
        this.imagesNav          = $('#imagesNav');

        this.imagesNavBtns      = [];
        this.imagesPathArr      = [];
        // counter for the crusela make the navigate cyclic
        this.caruselaCount      = 0;
        this.bindEvent();
    },
    bindEvent: function () {
        var self = imageDialog;
	    // listening to click on img to open modal // open modal btns
        $(document).on('click', '.img-dialog-btn', this.updateModal);
	    // listening to click on right/left btns to change img
        this.nextImageBtn.on('click', function () {
            self.crusela('next');
        });
        this.prevImageBtn.on('click', function () {
            self.crusela('prev');
        });
    },
	// change the img modal according to click on next/prevImageBtn
    crusela: function (action) {
        var self = imageDialog,
            currentPosition = 0,
	        // calculate the prev pos absolute of caruselaCount % numOfImgs
            prevPosition = Math.abs(self.caruselaCount % self.imagesPathArr.length);
	    // remove the circle(span) selected according to the prevPosition value
        $(self.imagesNavBtns[prevPosition]).removeClass('selected');
        // update the caruselaCount according to the action value
        switch(action) {
            case 'next':
                self.caruselaCount--;
                break;
            case 'prev':
                self.caruselaCount++;
                break;
        }
	    // calculate the currentPosition absolute of caruselaCount % numOfImgs
        currentPosition = Math.abs(self.caruselaCount % self.imagesPathArr.length)
	    // set the circle(span) as selected according to the currentPosition value
        $(self.imagesNavBtns[currentPosition]).addClass('selected');
        // change the img modal
        self.imageModalImg
            .fadeOut(300, function() {
                self.imageModalImg.attr('src', self.imagesPathArr[currentPosition]);
            })
            .fadeIn(300);
    },
	// create the modal bring the post details and the imgs paths
    updateModal: function () {
        var self = imageDialog;
        // clean the images path array
        self.imagesPathArr   = [];
        // clean the images nav
        self.imagesNav.html("");
        // the post container
        var postParent = $(this).parents('.posts');
        if(postParent.length === 0) {
            var postId = $(this).attr('data-postid');
            // send the postId by Ajax to posts route
            $.ajax({
                url: "/posts/"+postId+"/ajax",
                async: false,
                method: 'GET',
                success: function (data) {
                    postParent = $(data);
                }
            });
        }
	    // for posts with more than 1 img array of all the post's images objects(divs)
        var ImagesPathObjArr = postParent.find('.img-thumbnail');

        if(ImagesPathObjArr.length > 1) {
        	// show the next & prev btn for post with many photos
            self.nextImageBtn.show();
            self.prevImageBtn.show();
	        // create array with all the img paths and create circle(span) for each img
            for (var i = 0; i < ImagesPathObjArr.length; i++) {
                self.imagesNav.append('<span></span>')
                self.imagesPathArr.push($(ImagesPathObjArr[i]).attr('src'));
            }
            // get the nav's circles(spans)
            self.imagesNavBtns = self.imagesNav.find('span');
        }else{
            imageDialog.nextImageBtn.hide();
            imageDialog.prevImageBtn.hide();
        }
        // set the current position according to the position of the img in the paths array
        self.caruselaCount = self.imagesPathArr.indexOf($(this).attr('src'));
        // set the circle(span) as selected according to the caruselaCount value
        $(self.imagesNavBtns[self.caruselaCount]).addClass('selected');
	    // clone the parent post for display in the img dialog
        var parentContent = postParent.clone();
        // hide the irrelevant elements of the original post
        parentContent.find('.extContent').hide();
        parentContent.find('.posts-delete-btn').hide();
        parentContent.find('.posts-content-external').hide();
        // set the modal img and change CSS
        imageDialog.imageModalImg.attr('src', $(this).attr('src'));
        imageDialog.imageModalImg.css("max-height", Math.ceil($(window).height() * 0.8));
        imageDialog.rightModal.html(parentContent.css('padding','15px').css('border', '0'));
    }
}