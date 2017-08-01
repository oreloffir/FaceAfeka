var profileController = {
    init: function () {
        this.friendBtn = $("#profileFriendBtn");
        this.bindEvent()
    },
    bindEvent: function () {
        var self = profileController;
        this.friendBtn.on('click', self.addFriend);
    },
    addFriend: function (e) {
        e.preventDefault()
        var friendBtn   = $(this);
        var friendId    = $(this).attr('data-profileId');
        $.ajax({
            url: '/profile/'+friendId+'/add',
            type: 'GET',
            dataType: "JSON",
            success: function(callback){
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