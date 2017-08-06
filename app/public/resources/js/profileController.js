/*
Profile controller,
responsible for the add friend component in the profile view.
listening to click on add friend btn,
send the user id with add action by Ajax to profile route,
receive res,
toggle class and change html of friend btn
 */
var profileController = {
    init: function () {
        this.friendBtn = $("#profileFriendBtn");
        this.bindEvent()
    },
    bindEvent: function () {
        var self = profileController;
        this.friendBtn.on('click', self.addFriend); //listening to click on add friend btn
    },
    addFriend: function (e) {
        e.preventDefault()
        var friendBtn   = $(this);
        var friendId    = $(this).attr('data-profileId');
        $.ajax({ //send the user id with add action by Ajax to profile route
            url: '/profile/'+friendId+'/add',
            type: 'GET',
            dataType: "JSON",
            success: function(callback){ //receive res
                if(callback.success) //toggle class and change html of friend btn
                    friendBtn.toggleClass('btn-green');
                    if(!friendBtn.hasClass('btn-green'))
                        friendBtn.html('Unfriend');
                    else
                        friendBtn.html('Add friend');

            },
            error: function (callback) {
                console.log(callback);
            }
        });
    }
}