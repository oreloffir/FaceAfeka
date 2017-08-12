/*
Post controller,
responsible for all functions in post
listening to submit on add post/comment, like.
send the req by Ajax to posts route,
 */
var postController = {
    init: function () {
        // max photos for post
        this.MAX_PHOTOS         = 4;
	    this.MAX_PHOTOS_Alert   = 'Maximum '+this.MAX_PHOTOS+' photos'
	    this.No_More_Results    = 'No more results';
	    // flag for validate post
        this.validPost          = true;
        this.addPostForm        = $('#addPostForm');
        this.addPostErrors      = $('#addPostErrors');
        this.postsContainer     = $('#postsContainer');
        this.filesInput         = $('#uploadPostImages');
        this.fileInputFeedBack  = $('#uploadPostImagesFeedBack');
        this.bindEvent();
    },
    bindEvent: function () {
        var self = this;
	    // listening to submit of the addPostForm
        this.addPostForm.submit(this.addPost);
	    // listening to click on add comment form
        $(document).on('click', '.add-comment-form', function() {
	        // listening to submit and call to add comment
            $(this).on('submit', self.addComment);
	        // listening to 'enter key' in the textarea and call to submit
            $(this).find("[name='content']").keyup(function (e) {
                e.preventDefault();
                var key = e.which;
                if (key === 13) {
                    $(this).closest("form").submit();
                }
            });
        });
        // listening to click on func btn go to the appropriate function
        $(document).on('click', '.posts-func-like', this.likePost);
        $(document).on('click', '.load-more-comments', this.loadMoreComments);
        $(document).on('click', '.posts-edit-btn', this.createEditPost);
        $(document).on('click', '.posts-delete-btn', this.deletePost);
        // when the user select photos call to filesSelected
        this.filesInput.on('change', this.filesSelected)
    },
	// add new post
    addPost: function (e) {
        e.preventDefault();
        var self = postController;
        // check the valid post flag
        if(!self.validPost)
            return false;
	    // send the post by Ajax to posts route
        $.ajax({
            url: "/posts/add",
            type: $(this).attr("method"),
            dataType: "JSON",
            data: new FormData(this),
            processData: false,
            contentType: false,
	        // receive modal with errors and response
            success: function (callback) {
                self.addPostErrors.html("");
                // check the errors
                if (callback.errors.length > 0) {
                    // update the add post errors div with the callback errors
                    errorsString = "";
                    callback.errors.forEach(function (error) {
                        errorsString += error + " <br\>"
                    });
                    self.addPostErrors.html("<div class=\"alert alert-danger to-left\" role=\"\" >" + errorsString + "</div>");
                } else {
                    // add the new posts container with the new post
                    $.get("/posts/"+callback.response.id+"/ajax", function( data ) {
                        $(data).prependTo(self.postsContainer).hide().fadeIn(700);
                    });
                }
            },
            error: function (callback) {
                console.log(callback);
            }
        });
    },
    // the user select new photo/s to upload
    filesSelected: function () {
        var self = postController;
        // check the num of photos if more than the limit print error and change the valid post flag
        if(this.files.length > self.MAX_PHOTOS){
            self.fileInputFeedBack.addClass('red');
            self.fileInputFeedBack.html(this.MAX_PHOTOS_Alert);
            self.validPost = false;
        }else{
            // give positive feedback for user
            self.fileInputFeedBack.html("Selected "+this.files.length+" photos");
            self.fileInputFeedBack.addClass('green-afeka');
            self.validPost = true;
        }
    },
    // add new comment to post
    addComment: function (e) {
        e.preventDefault();
        var self = postController;
        // get the date from the form
        var dataString = $(this).serialize();
        // the comments container
	    var outputBlock = $(this).parents('.posts').find('.posts-comments');
	    // the comments btn
	    var commentBtn = $(this).parents('.posts').find('.posts-comments-btn');
	    // find and clear the comment form textArea
        var contentArea = $(this).find("[name='content']");
        contentArea.val("");
        var commentCounter = commentBtn.attr('numOfComments')
	    // send the comment by Ajax to posts route
        $.ajax({
            url: $(this).attr("action"),
            type: $(this).attr("method"),
            dataType: "JSON",
            data: dataString,
	        // receive modal with errors and response
            success: function (callback) {
                if (callback.errors.length > 0) {
                    console.log(callback.errors)
                } else {
                    // prepand the new comment element to the comments container
                    var commentElement = self.createCommentElement(callback.response);
                    commentElement.prependTo(outputBlock).hide().fadeIn(700);
	                commentCounter++;
	                commentBtn.attr('numOfComments', commentCounter);
	                commentBtn.text(commentCounter+' Comments');
                }
            },
            error: function (callback) {
                console.log(callback);
            }
        });
    },
	// add like or unlike a post
    likePost: function (e) {
	    e.preventDefault();
	    // get the post container
        var postParent = $(this).parents('.posts');
	    // get the postId from post's attr 'data-postid'
        var postId = postParent.attr('data-postid');
        var likeCount = postParent.find('.posts-likes-count');
        var likeBtn = $(this);
	    // send like by Ajax to posts route
        $.ajax({
            url: '/posts/' + postId + '/like',
            type: 'POST',
            dataType: "JSON",
	        // receive modal with errors and response
            success: function (callback) {
            	// update the like btn and the like counter
                if (callback.success) {
                    likeBtn.toggleClass('like');
                    if (callback.response)
                        likeCount.html(parseInt(likeCount.html()) + 1)
                    else
                        likeCount.html(parseInt(likeCount.html()) - 1)
                }
            },
            error: function (callback) {
                console.log(callback);
            }
        });
    },
	// load more comment
    loadMoreComments: function (e) {
        e.preventDefault();
        var self = postController;
	    // get the post container
        var postParent = $(this).parents('.posts');
	    // the load more btn
        var remainCommentsDiv = postParent.find('.posts-comments-load-more-remain');
        var pageNumber = parseInt($(this).attr('data-pagenum'));
        var postId = postParent.attr('data-postid');
        // the block of comments
        var outputBlock = postParent.find('.posts-comments');
        $(this).attr('data-pagenum', (pageNumber + 1));
	    // send request by Ajax to posts route
        $.ajax({
            url: '/posts/' + postId + '/comments/' + (pageNumber + 1),
            type: 'GET',
            dataType: "JSON",
	        // receive modal with success and response
            success: function (callback) {
            	// check the req success and the num of comments
                if (callback.success && callback.response.length > 0) {
                	// add the new comments to the block
                    $(callback.response).each(function (index, comment) {
                        var commentElement = self.createCommentElement(comment);
                        commentElement.appendTo(outputBlock).hide().fadeIn(700);
                    })
	                // calculate the num of the remaining comments and update UI
                    var remain = parseInt(remainCommentsDiv.html()) - callback.response.length;
                    // scroll animation to the bottom of the block ( where the new comment )
                    outputBlock.animate({ scrollTop: outputBlock.prop("scrollHeight")}, 600);
                    if (remain > 0)
	                    remainCommentsDiv.html(remain);
                    else {
	                    remainCommentsDiv.parents('.posts-comments-more').html(this.No_More_Results);
                    }
                }
            },
            error: function (callback) {
                console.log(callback);
            }
        });
    },
	// create new comment element
    createCommentElement: function (comment) {
        var commentElement = "";
        commentElement += "<div class=\"posts-comment posts-sub-block\">";
        commentElement += "<a href=\"/profile/" + comment.userId.id + "\">" + comment.userId.displayName + "</a>";
        commentElement += "<span>" + comment.content + "</span>";
        commentElement += "<div class=\"posts-comment-date\">" + comment.date + "</div>"
        commentElement += "</div>"
        return $(commentElement);
    },
	// update the post to edit post element
    createEditPost: function (e) {
        e.preventDefault();
        var self = postController;
        // get the post originals elements/values
        var postParent = $(this).parents('.posts');
        var postId = postParent.attr('data-postid');
        var postPrivacy = postParent.attr('data-privacy');
        var contentHolder = postParent.find('.posts-content-text');
        var currentContent = contentHolder.children('pre').html();
	    // create new form and set the form with the originals elements/values
        var editForm = $("<form method='post' action='/posts/" + postId + "/edit'></form>");
        var textarea = $("<textarea></textarea>");
        var submit = $("<input/>");
        var privacy = $('<input/>').prop('checked', $.parseJSON(postPrivacy));
        var privacyLable = $('<lable></lable>')

        privacy.attr('type', 'checkbox');
        privacy.attr('name', 'privacy')
        privacyLable.addClass('to-left posts-edit-options')
        privacyLable.append(privacy);
        privacyLable.append("Private");

        textarea.addClass('form-control');
        textarea.attr('name', 'content');
        textarea.html(currentContent);

        submit.attr('type', 'submit');
        submit.attr('value', 'Save')
        submit.addClass('btn btn-primary posts-edit-options to-right')

        editForm.append(textarea);
        editForm.append(submit);
        editForm.append(privacyLable);

        contentHolder.html(editForm);
        editForm.submit(self.editPost);

    },
	// send edit post request
    editPost: function (e) {
        e.preventDefault();
        var postParent = $(this).parents('.posts');
        // the new content element holder
	    var contentHolder = postParent.find('.posts-content-text');
	    // send request by Ajax to posts route
        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            dataType: "JSON",
	        // get the date from the form
            data: $(this).serialize(),
	        // receive modal with success and response
            success: function (callback) {
                if (callback.success) {
                	// update the post with the new content
                    contentHolder.html('<pre>' + callback.response.content + '</pre>')
                    postParent.attr('data-privacy', callback.response.privacy)
                } else {
                    console.log(callback.errors)
                }
            },
            error: function (callback) {
                console.log(callback);
            }
        });
    },
	// send delete post request
    deletePost: function (e) {
        e.preventDefault();
        var postParent = $(this).parents('.posts');
        var postId = postParent.attr('data-postid');
	    // send delete request by Ajax to posts route
        $.ajax({
            url: '/posts/'+postId,
            type: 'DELETE',
	        // receive modal with success
            success: function (callback) {
            	// remove the post from the posts container
                if (callback.success)
                    postParent.fadeOut(400);
            },
            error: function (callback) {
                console.log(callback);
            }
        });


    }
}