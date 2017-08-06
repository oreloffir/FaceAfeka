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
        $(window).scroll(this.scroll); //listening to scrolling
    },
    scroll: function () { //change the fragment position according to scrolling
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
        this.imageModal         = $('#imageModal');
        this.imageModalBody     = $('#imageModalBody');
        this.imageModalBtns     = $('.img-dialog-btn');
        this.imageModalImg      = $('#imageModalImg');
        this.rightModal         = $('#imageModalRight');
        this.nextImageBtn       = $('#nextImageModal');
        this.prevImageBtn       = $('#prevImageModal');
        this.imagesNav          = $('#imagesNav');
        this.imagesNavBtns      = [];
        this.imagesPathArr      = [];
        this.caruselaCount      = 0;
        this.bindEvent();
    },
    bindEvent: function () {
        var self = imageDialog;
        this.imageModalBtns.each(function(index, imageBtn){ // listening to click on img
            $(imageBtn).on('click', self.updateModal)
        })
	    //listening to click on right/left change img btns
        this.nextImageBtn.on('click', function () {
            self.crusela('next');
        })
        this.prevImageBtn.on('click', function () {
            self.crusela('prev');
        })
    },
    crusela: function (action) {
        var self = imageDialog,
            currentPosition = 0,
            prevPosition = Math.abs(self.caruselaCount % self.imagesPathArr.length);
        $(self.imagesNavBtns[prevPosition]).removeClass('selected');
        switch(action) {
            case 'next':
                self.caruselaCount--;
                break;
            case 'prev':
                self.caruselaCount++;
                break;
        }
        currentPosition = Math.abs(self.caruselaCount % self.imagesPathArr.length)
        $(self.imagesNavBtns[currentPosition]).addClass('selected');
        self.imageModalImg
            .fadeOut(300, function() {
                self.imageModalImg.attr('src', self.imagesPathArr[currentPosition]);
            })
            .fadeIn(300);
    },
    updateModal: function () {
        var self = imageDialog;
        self.imagesPathArr   = [];
        self.imagesNav.html("");
        var postParent = $(this).parents('.posts');
        if(postParent.length === 0) { // gallery doesn't have post container, need to get the post.
            var postId = $(this).attr('data-postid');
            $.ajax({
                url: "/posts/"+postId+"/ajax",
                async: false,
                method: 'GET',
                success: function (data) {
                    console.log(data);
                    postParent = $(data);
                }
            });
        }
        var ImagesPathObjArr = postParent.find('.img-thumbnail'); // for posts with more than 1 img

        if(ImagesPathObjArr.length > 1) {
            self.nextImageBtn.show();
            self.prevImageBtn.show();
            for (var i = 0; i < ImagesPathObjArr.length; i++) { // crate array with all the img paths
                self.imagesNav.append('<span></span>')
                self.imagesPathArr.push($(ImagesPathObjArr[i]).attr('src'));
            }
            self.imagesNavBtns = self.imagesNav.find('span');
        }else{
            imageDialog.nextImageBtn.hide();
            imageDialog.prevImageBtn.hide();
        }
        self.caruselaCount = self.imagesPathArr.indexOf($(this).attr('src'));
        $(self.imagesNavBtns[self.caruselaCount]).addClass('selected');
        var parentContent = postParent.clone(); // clone the parent post for display in the img dialog
        parentContent.find('.extContent').hide();
        parentContent.find('.posts-delete-btn').hide();
        parentContent.find('.posts-content-external').hide();
        imageDialog.imageModalImg.attr('src', $(this).attr('src'));
        imageDialog.imageModalImg.css("max-height", Math.ceil($(window).height() * 0.8));
        imageDialog.rightModal.html(parentContent.css('padding','15px').css('border', '0'));
    }
}