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
        this.bindEvent();
    },
    bindEvent: function () {
        var self = imageDialog;
        this.imageModalBtns.each(function(index, imageBtn){
            $(imageBtn).on('click', self.updateModal)
        })
    },
    updateModal: function () {
        var parentContent = $(this).parents('.posts').clone();
        parentContent.find('.extContent').hide();
        parentContent.find('.posts-delete-btn').hide();
        parentContent.find('.posts-content-external').hide();
        imageDialog.imageModalImg.attr('src', $(this).attr('src'));
        imageDialog.imageModalImg.css("max-height", Math.ceil($(window).height() * 0.8));
        imageDialog.rightModal.html(parentContent.css('padding','15px').css('border', '0'));
    }
}