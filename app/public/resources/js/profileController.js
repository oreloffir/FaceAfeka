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
        // add/remove friend btn in profileLeft
        this.friendBtn = $("#profileFriendBtn");
        this.bindEvent()
    },
    bindEvent: function () {
        var self = profileController;
	    // listening to click on add friend btn
        this.friendBtn.on('click', self.addFriend);
    },
    addFriend: function (e) {
        e.preventDefault()
        var friendBtn   = $(this);
        // get the friendId from friendbtn's attr 'data-profileId'
        var friendId    = $(this).attr('data-profileId');
	    // send the user id with add action by Ajax to profile route
        $.ajax({
            url: '/profile/'+friendId+'/add',
            type: 'GET',
            dataType: "JSON",
	        //receive res
            success: function(callback){
	            // toggle class and change html of friend btn
                if(callback.success)
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