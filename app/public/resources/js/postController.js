var postController = {
    init: function () {
        this.addPostForm    = $('#addPostForm');
        this.addPostErrors  = $('#addPostErrors');
        this.postsContainer = $('#postsContainer');
        this.bindEvent();
    },
    bindEvent: function(){
        this.addPostForm.submit(this.addPost);
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
            success: function(callback){
                self.addPostErrors.html("");
                if (callback.errors.length > 0){
                    console.log("callback = errors");
                    errorsString = "";
                    callback.errors.forEach(function (error) { errorsString += error+" <br\>" });
                    self.addPostErrors.html("<div class=\"alert alert-danger to-left\" role=\"\" >"+errorsString+"</div>");
                }else{
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
    createPostElement: function (post) {
        var postElement =  "";

        postElement+= "<div class=\"container-fluid posts\">";
        postElement+=   "<div class=\"row posts-sub-block\">";
        postElement+=       "<div class=\"col-md-2 col-sm-2 col-xs-2\">";
        postElement+=           "<img class=\"img-circle img-responsive\" src=\"http://cdn.business2community.com/wp-content/uploads/2014/04/profile-picture.jpg\">";
        postElement+=       "</div>"
        postElement+=       "<div class=\"col-md-10 col-sm-10 col-xs-10\">";
        postElement+=           "<div class=\"posts-user-link\">";
        postElement+=               "<a href=\"/profile/"+post.userId.id+"\">"+post.userId.displayName+"</a>";
        postElement+=           "</div>"
        postElement+=           "<div class=\"posts-date\">";
        postElement+=               "<span>"+post.date+"</span>";
        postElement+=           "</div>"
        postElement+=       "</div>";
        postElement+=   "</div>";
        postElement+=   "<div class=\"posts-content posts-sub-block\">";
        postElement+=       post.content;
        postElement+=   "</div>";
        postElement+=   "<div class=\"posts-info posts-sub-block\">";
        postElement+=       "<div class=\"posts-info-item to-left\">";
        postElement+=              post.likes.length + " Likes";
        postElement+=       "</div>";
        postElement+=       "<div class=\"posts-info-item to-right\">";
        postElement+=              "<a href=\"\">" + post.comments.length + " Comments</a>";
        postElement+=       "</div>";
        postElement+=   "</div>";
        postElement+=   "<div class=\"posts-func posts-sub-block\">";
        postElement+=       "<div class=\"posts-info-item to-left\">";
        postElement+=              "<span class=\"glyphicon glyphicon-heart\"></span> <span>Like</span>";
        postElement+=       "</div>";
        postElement+=   "</div>";
        postElement+=   "<div class=\"posts-comments posts-sub-block\">";
        $.each(post.comments.slice(0,3), function (comment) {
            postElement+= "<div class=\"posts-comment posts-sub-block\">";
            postElement+=   "<a href=\"/profile/" + comment.userId.id + "\">" + comment.userId.displayName + "</a>";
            postElement+=   "<span>" + comment.content + "</span>";
            postElement+=   "<div class=\"posts-comment-date\">" + comment.date + "</div>";
            postElement+= "</div>";
        });
        postElement+=   "</div>";
        postElement+=   "<div class=\"posts-comments-more posts-sub-block\">";
        var commentsLeft = post.comments.length-3;
        if(commentsLeft < 0)
            commentsLeft = 0;
        postElement+=        "<a href=\"\">··· " + commentsLeft + " more ···</a>";
        postElement+=   "</div>";
        postElement+=   "<div class=\"posts-add-comment posts-sub-block\">";
        postElement+=        "<form method=\"post\">";
        postElement+=           "<textarea class=\"form-control\" name=\"content\" placeholder=\"Leave a comment\"></textarea>"
        postElement+=        "</form>"
        postElement+=   "</div>";
        postElement+= "</div>";
        return $(postElement);
    }
}