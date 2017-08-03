var scrollProfileLeft = {
    init: function () {
        this.startPos   = 20;
        this.leftBlock  = $("#leftSide");
        this.bindEvent();
    },
    bindEvent: function () {
        $(window).scroll(this.scroll);
    },
    scroll: function () {
        var self = scrollProfileLeft;
        var top = $(document).scrollTop();
        if (top < self.startPos) top = self.startPos;
        self.leftBlock.css("top", top - self.startPos  + "px");
    }
}

var imageDialog = {
    init: function () {
        this.imageModal         = $('#imageModal');
        this.imageModalBody     = $('#imageModalBody');
        this.imageModalBtns     = $('.img-dialog-btn');
        this.imageModalImg      = $('#imageModalImg');
        this.rightModal         = $('#imageModalRight');
        this.nextImageBtn       = $('#nextImageModal');
        this.prevImageBtn       = $('#prevImageModal');
        this.imagesPathArr      = [];
        this.caruselaCount      = 0;
        this.bindEvent();
    },
    bindEvent: function () {
        var self = imageDialog;
        this.imageModalBtns.each(function(index, imageBtn){
            $(imageBtn).on('click', self.updateModal)
        })
        this.nextImageBtn.on('click', function () {
            self.crusela('next');
        })
        this.prevImageBtn.on('click', function () {
            self.crusela('prev');
        })
    },
    crusela: function (action) {
        var self = imageDialog;
        switch(action) {
            case 'next':
                self.caruselaCount++;
                break;
            case 'prev':
                self.caruselaCount--;
                break;
        }
        self.imageModalImg
            .fadeOut(300, function() {
                self.imageModalImg.attr('src', self.imagesPathArr[Math.abs(self.caruselaCount % self.imagesPathArr.length)]);
            })
            .fadeIn(300);
    },
    updateModal: function () {
        var self = imageDialog;
        self.imagesPathArr   = [];
        self.caruselaCount   = 0;
        var postParent       = $(this).parents('.posts');
        var ImagesPathObjArr = postParent.find('.img-thumbnail');

        if(ImagesPathObjArr.length > 0) {
            //self.nextImageBtn.show();
            //self.prevImageBtn.show();
            for (var i = 0; i < ImagesPathObjArr.length; i++)
                self.imagesPathArr.push($(ImagesPathObjArr[i]).attr('src'));
        }else{
            //imageDialog.nextImageBtn.hide();
            //imageDialog.prevImageBtn.hide();
        }
        var parentContent = $(this).parents('.posts').clone();
        parentContent.find('.extContent').hide();
        parentContent.find('.posts-delete-btn').hide();
        parentContent.find('.posts-content-external').hide();
        imageDialog.imageModalImg.attr('src', $(this).attr('src'));
        imageDialog.imageModalImg.css("max-height", Math.ceil($(window).height() * 0.8));
        imageDialog.rightModal.html(parentContent.css('padding','15px').css('border', '0'));
    }
}