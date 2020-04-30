jQuery(document).ready(function($) {
	var nextpage = '';
	function get_data(nextpage,url,button,publisherdata) {
		$(publisherdata).append( '<div class="loader"></div> ' );
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			 var weburl = 'https://'+window.location.hostname+'/web'; 
			 user.getIdToken().then(function(idToken) {
				 var encode = idToken;
			  $.ajax({
						type: "POST",
						dataType: "json",
						url: weburl+url,
						  data: {
								  nextpage: nextpage,
								  encode: encode,
								 },
								 success: function(msg) {
									 if(msg['success'] == 'success') {
										 $('.loader').hide();
										 $(publisherdata).append( msg['post'] );
										 $(button).val(msg['nextpage']);
									 }
									 else if(msg['fail'] == 'fail') {
										alert('Reload Page and try again');
									 }	
								 }
				});
				});
		  }
		});
	}
	
    //update linked entities
	if ($('.publisher-data')[0]) {
	get_data(nextpage,'/admin/ajax/publisher-view.php','.load-more','.publisher-data');
	
	//get data when click on button
	jQuery('.load-more').on('click', function() {
		var nextpage = $(".load-more").val();
		if (!nextpage || !nextpage.length) {
			var nextpage = 'null';
		}
		get_data(nextpage,'/admin/ajax/publisher-view.php','.load-more','.publisher-data');
	});
	}
	
	if ($('.entities-data')[0]) {
	//get linked entities first time
	get_data(nextpage,'/admin/ajax/entity-view.php','.load-more-entity','.entities-data');
	
	//get data when click on button
	jQuery('.load-more-entity').on('click', function() {
		var nextpage = $(".load-more-entity").val();
		if (!nextpage || !nextpage.length) {
			var nextpage = 'null';
		}
		get_data(nextpage,'/admin/ajax/entity-view.php','.load-more-entity','.entities-data');
	});
	}
	
	//get category first time
	if ($('.category-data')[0]) {
		get_data(nextpage,'/admin/ajax/category-view.php','.load-more-entity','.category-data');
	//get data when click on button
	jQuery('.load-more-entity').on('click', function() {
		var nextpage = $(".load-more-entity").val();
		if (!nextpage || !nextpage.length) {
			var nextpage = 'null';
		}
		get_data(nextpage,'/admin/ajax/category-view.php','.load-more-entity','.category-data');
	});	
	}

});