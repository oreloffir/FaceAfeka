var postController = {
    init: function () {
        this.addPostForm        = $('#addPostForm');
        this.addPostErrors      = $('#addPostErrors');
        this.postsContainer     = $('#postsContainer');
        this.bindEvent();
    },
    bindEvent: function () {
        var self = postController;
        this.addPostForm.submit(this.addPost);
        $(document).on('click', '.add-comment-form', function() {
            $(this).on('submit', self.addComment);
            $(this).find("[name='content']").keypress(function (e) {
                var key = e.which;
                if (key === 13) {
                    $(this).closest("form").submit();
                }
            });
        });
        $(document).on('click', '.posts-func-like', self.likePost);
        $(document).on('click', '.load-more-comments', self.loadMoreComments);
        $(document).on('click', '.posts-edit-btn', self.createEditPost);
        $(document).on('click', '.posts-delete-btn', self.deletePost);
    },
    addPost: function (e) {
        e.preventDefault();
        var self = postController;
        var dataString = $(this).serialize();
        $.ajax({
            url: "./posts/add",
            type: $(this).attr("method"),
            dataType: "JSON",
            data: dataString,
            success: function (callback) {
                self.addPostErrors.html("");
                if (callback.errors.length > 0) {
                    console.log("callback = errors");
                    errorsString = "";
                    callback.errors.forEach(function (error) {
                        errorsString += error + " <br\>"
                    });
                    self.addPostErrors.html("<div class=\"alert alert-danger to-left\" role=\"\" >" + errorsString + "</div>");
                } else {
                    console.log(callback);
                    var postElement = self.createPostElement(callback.response);
                    postElement.prependTo(self.postsContainer).hide().fadeIn(700);
                }
            },
            error: function (callback) {
                console.log(callback);
            }
        });
    },
    addComment: function (e) {
        e.preventDefault();
        var self = postController;
        var dataString = $(this).serialize();
        var outputBlock = $(this).parents('.posts').find('.posts-comments');
        var contentArea = $(this).find("[name='content']");
        contentArea.val("");
        contentArea.focusout();
        console.log(dataString);
        $.ajax({
            url: $(this).attr("action"),
            type: $(this).attr("method"),
            dataType: "JSON",
            data: dataString,
            success: function (callback) {
                self.addPostErrors.html("");
                if (callback.errors.length > 0) {
                    // error
                } else {
                    console.log(callback);
                    var commentElement = self.createCommentElement(callback.response);
                    commentElement.prependTo(outputBlock).hide().fadeIn(700);
                }
            },
            error: function (callback) {
                console.log(callback);
            }
        });
    },
    likePost: function (e) {
        var postParent = $(this).parents('.posts');
        var postId = postParent.attr('data-postid');
        var likeCount = postParent.find('.posts-likes-count');
        var likeBtn = $(this);
        $.ajax({
            url: '/posts/' + postId + '/like',
            type: 'GET',
            dataType: "JSON",
            success: function (callback) {
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
    loadMoreComments: function (e) {
        e.preventDefault();
        var self = postController;
        var postParent = $(this).parents('.posts');
        var loadBtn = $(this);
        var leftDiv = postParent.find('.posts-comments-load-more-left');
        var pageNumber = parseInt($(this).attr('data-pagenum'));
        var postId = postParent.attr('data-postid');
        var outputBlock = postParent.find('.posts-comments');
        $(this).attr('data-pagenum', (pageNumber + 1));
        $.ajax({
            url: '/posts/' + postId + '/comments/' + (pageNumber + 1),
            type: 'GET',
            dataType: "JSON",
            success: function (callback) {
                console.log(callback);
                if (callback.success && callback.response.length > 0) {
                    $(callback.response).each(function (index, comment) {
                        var commentElement = self.createCommentElement(comment);
                        commentElement.appendTo(outputBlock).hide().fadeIn(700);
                    })
                    var left = parseInt(leftDiv.html()) - callback.response.length;
                    outputBlock.animate({ scrollTop: outputBlock.prop("scrollHeight")}, 600);
                    if (left > 0)
                        leftDiv.html(left);
                    else {
                        leftDiv.parents('.posts-comments-more').html("No more results");
                    }
                }
            },
            error: function (callback) {
                console.log(callback);
            }
        });
    },
    createPostElement: function (post) {
        var postElement = "";

        postElement += "<div class=\"container-fluid posts\">";
        postElement += "<div class=\"row posts-sub-block\">";
        postElement += "<div class=\"col-md-2 col-sm-2 col-xs-2\">";
        postElement += "<img class=\"img-circle img-responsive\" src=\"http://cdn.business2community.com/wp-content/uploads/2014/04/profile-picture.jpg\">";
        postElement += "</div>"
        postElement += "<div class=\"col-md-10 col-sm-10 col-xs-10\">";
        postElement += "<div class=\"posts-user-link\">";
        postElement += "<a href=\"/profile/" + post.userId.id + "\">" + post.userId.displayName + "</a>";
        postElement += "</div>"
        postElement += "<div class=\"posts-date\">";
        postElement += "<span>" + post.date + "</span>";
        postElement += "</div>"
        postElement += "</div>";
        postElement += "</div>";
        postElement += "<div class=\"posts-content posts-sub-block\">";
        postElement += post.content;
        postElement += "</div>";
        postElement += "<div class=\"posts-info posts-sub-block\">";
        postElement += "<div class=\"posts-info-item to-left\">";
        postElement += post.likes.length + " Likes";
        postElement += "</div>";
        postElement += "<div class=\"posts-info-item to-right\">";
        postElement += "<a href=\"\">" + post.comments.length + " Comments</a>";
        postElement += "</div>";
        postElement += "</div>";
        postElement += "<div class=\"posts-func posts-sub-block\">";
        postElement += "<div class=\"posts-info-item to-left\">";
        postElement += "<span class=\"glyphicon glyphicon-heart\"></span> <span>Like</span>";
        postElement += "</div>";
        postElement += "</div>";
        postElement += "<div class=\"posts-comments posts-sub-block\">";
        $.each(post.comments.slice(0, 3), function (comment) {
            postElement += "<div class=\"posts-comment posts-sub-block\">";
            postElement += "<a href=\"/profile/" + comment.userId.id + "\">" + comment.userId.displayName + "</a>";
            postElement += "<span>" + comment.content + "</span>";
            postElement += "<div class=\"posts-comment-date\">" + comment.date + "</div>";
            postElement += "</div>";
        });
        postElement += "</div>";
        postElement += "<div class=\"posts-comments-more posts-sub-block\">";
        var commentsLeft = post.comments.length - 3;
        if (commentsLeft < 0)
            commentsLeft = 0;
        postElement += "<a href=\"\">··· " + commentsLeft + " more ···</a>";
        postElement += "</div>";
        postElement += "<div class=\"posts-add-comment posts-sub-block\">";
        postElement += "<form method=\"post\">";
        postElement += "<textarea class=\"form-control\" name=\"content\" placeholder=\"Leave a comment\"></textarea>"
        postElement += "</form>"
        postElement += "</div>";
        postElement += "</div>";
        return $(postElement);
    },
    createCommentElement: function (comment) {
        var commentElement = "";
        commentElement += "<div class=\"posts-comment posts-sub-block\">";
        commentElement += "<a href=\"/profile/" + comment.userId.id + "\">" + comment.userId.displayName + "</a>";
        commentElement += "<span>" + comment.content + "</span>";
        commentElement += "<div class=\"posts-comment-date\">" + comment.date + "</div>"
        commentElement += "</div>"
        return $(commentElement);
    },
    createEditPost: function (e) {
        e.preventDefault();
        var self = postController;
        var postParent = $(this).parents('.posts');
        var postId = postParent.attr('data-postid');
        var postPrivacy = postParent.attr('data-privacy');
        var contentHolder = postParent.find('.posts-content');
        var currentContent = contentHolder.children('pre').html();

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
        console.log(currentContent);
    },
    editPost: function (e) {
        e.preventDefault();
        var self = postController;
        var postParent = $(this).parents('.posts');
        var contentHolder = postParent.find('.posts-content');
        var postId = postParent.attr('data-postid');
        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            dataType: "JSON",
            data: $(this).serialize(),
            success: function (callback) {
                if (callback.success) {
                    contentHolder.html('<pre>' + callback.response.content + '</pre>')
                    postParent.attr('data-privacy', callback.response.privacy)
                } else {
                    console.log('err')
                }
            },
            error: function (callback) {
                console.log(callback);
            }
        });
    },
    deletePost: function (e) {
        e.preventDefault();
        var self = postController;
        var postParent = $(this).parents('.posts');
        var postId = postParent.attr('data-postid');
        $.ajax({
            url: '/posts/'+postId,
            type: 'DELETE',
            success: function (callback) {
                if (callback.success)
                    postParent.fadeOut(400);
            },
            error: function (callback) {
                console.log(callback);
            }
        });


    }
}