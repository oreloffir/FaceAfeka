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
		// listening to keyUp in search input
		self.searchInput.on('keyup' , self.keypress);
	},
	keypress: function (e) {
		var self = searchController;
		var input = self.searchInput.val();
		// validate the search input
		if(self.validateInput(input)){
			// go to search function that send req to the server
			self.search(input)
		}
	},
	search: function (input) {
		var self = searchController;
		// send the input string by Ajax to search route
		$.ajax({
			url: '/search/profile/'+input,
			type: 'GET',
			dataType: "JSON",
			// receive list of users that the display name start with the input
			success: function(callback){
				var imgElement;
				// clean the search drop-down list before the search function edit the list
				self.searchList.html('<li></li>')
				if(callback.res.length === 0)
					self.searchList.append('<li> no result </li>')
				// create drop-sown list with the result
				else{
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
	// validate the input string
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