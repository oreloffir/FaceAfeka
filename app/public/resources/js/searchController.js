var searchController = {
	init: function () {
		this.searchInput = $('#searchHeader');
		this.searchList = $('#searchList');

		this.bindEvent();
	},
	bindEvent: function () {
		var self = searchController;
		$(document).one('click', '#searchHeader', function() {
			self.searchList.hide()
			$(this).on('keyup' , self.keypress);
		});
	},
	keypress: function (e) {
		var self = searchController;
		var input = self.searchInput.val();
		if(self.validateInput(input)){
			console.log(input)
			self.search(input)
		}
		self.searchList.html('')
	},
	search: function (input) {
		var self = searchController;
		$.ajax({
			url: '/profile/'+input+'/search/',
			type: 'GET',
			dataType: "JSON",
			success: function(callback){
				console.log(callback);
				var imgElement;

				$.each(callback.res, function (idx, user) {
					imgElement = "<img class='img img-circle img-profile-search' src='/images/profile/tmb_"+user.imagePath+"'>";
					self.searchList.append('<li><a href="profile/'+user._id+'">'+imgElement+user.displayName+'</a></li>')
				})

			},
			error: function (callback) {
				console.log(callback);
			}
		});
	},
	validateInput: function (input) {
		var self = searchController;
		var string =input.trim();
		if(string.length > 0 ){
			self.searchList.show()
			return true;

		}
		self.searchList.hide()
		return false;
	}

}