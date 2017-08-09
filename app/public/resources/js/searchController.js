/*
Search controller,
responsible for the search component in the header.
listening to keyUp in search input,
send the input string by Ajax to search route,
receive list of users that the display name start with the input,
create drop-sown list with the result
 */
var searchController = {
	init: function () {
        //The search input component
		this.searchInput = $('#searchHeader');
        //The search drop-down list component
		this.searchList = $('#searchList');

		this.bindEvent();
	},
	bindEvent: function () {
		var self = searchController;
		self.searchInput.on('keyup' , self.keypress);
	},
	keypress: function (e) {
		var self = searchController;
		var input = self.searchInput.val();
		if(self.validateInput(input)){
			self.search(input)
		}
		self.searchList.html('<li></li>')
	},
	search: function (input) {
		var self = searchController;

        //send the input string by Ajax to search route
		$.ajax({
			url: '/search/profile/'+input,
			type: 'GET',
			dataType: "JSON",
			success: function(callback){ //receive list of users that the display name start with the input
				var imgElement;
				if(callback.res.length === 0)
					self.searchList.append('<li> no result </li>')
				else{ // create drop-sown list with the result
					$.each(callback.res, function (idx, user) {
						imgElement = "<img class='img img-circle img-profile-search' src='/images/profile/tmb_"+user.imagePath+"'>";
						self.searchList.append('<li><a href="/profile/'+user._id+'">'+imgElement+user.displayName+'</a></li>')
					})
				}
			},
			error: function (callback) {
				console.log(callback);
			}
		});
	},
	validateInput: function (input) { // validate the input string
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