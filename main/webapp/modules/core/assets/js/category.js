jQuery(document).ready(function($) {
	var weburl = 'https://'+window.location.hostname+'/web'; 
	//category submission
	jQuery('body').on('click', '.category-submit', function() {
		//defince variable for get input field data
        var categoryname = $("#category-name").val();
		var categorypopularity = $("#category-popularity").val();
		if( $("#category-isactive").is(':checked')) {
			var categoryisactive = $("#category-isactive").val();
        }
		else {
			var categoryisactive = 'false';
		}								
		if (!categoryname || !categoryname.length) {
            $('.error').show();
            $(".error").html('Please enter name');
        }
		else {
			$('.error').hide();
			
			firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			  user.getIdToken().then(function(idToken) {
				 var encode = idToken;
                    $.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/category/category-ajax.php",
                      data: {
                              categoryname: categoryname,
							  categorypopularity: categorypopularity,
							  categoryisactive: categoryisactive,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									 $('.success').show();
                                     $(".success").html('category Submited Successfully');
								 }
								 else if(msg['fail'] == 'fail') {
									 $('.error').show();
                                     $(".error").html('Please Check Field And Try Again!');
								 }
							 }
				 });
				 });
				 }
		});
		}
		
	});	
		
	//category edit	
	jQuery('body').on('click', '.category-edit', function() {	
		var categoryid = $('body').find(this).attr("category-edit");
		$("#category-edit-id").val(categoryid);
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			  user.getIdToken().then(function(idToken) {
				 var encode = idToken;
                    $.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/category/category-get.php",
                      data: {
                              categoryid: categoryid,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									$("#category-name-edit").val(msg['name']);
									$("#category-popularity-edit").val(msg['popularity']);
									if(msg['active'] == true) {
										$("#category-isactive-edit").prop('checked', true);
									}
									else {
										$("#category-isactive-edit").prop('checked', false);
									}
								 }
								 else if(msg['fail'] == 'fail') {
									 alert('There is a error please reload page and try again.');
								 }
							 }
				 });	
				 });
				 }
		});
	});
	
	//category-update
	jQuery('body').on('click', '.category-submit-edit', function() {		
		//defince variable for get input field data
        var categoryname = $("#category-name-edit").val();
		var categorypopularity = $("#category-popularity-edit").val();
		var categoryeditid = $("#category-edit-id").val();
		if( $("#category-isactive-edit").is(':checked')) {
			var categoryisactive = $("#category-isactive-edit").val();
        }
		else {
			var categoryisactive = 'false';
		}
		if (!categoryname || !categoryname.length) {
            $('.error-edit').show();
            $(".error-edit").html('Please enter name');
        }
		else {
			$('.error-edit').hide();
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			  user.getIdToken().then(function(idToken) {
				 var encode = idToken;
                    $.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/category/category-ajax-edit.php",
                      data: {
                              categoryname: categoryname,
							  categorypopularity: categorypopularity,
							  categoryisactive: categoryisactive,
							  categoryeditid: categoryeditid,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									 $('.success-edit').show();
                                     $(".success-edit").html('category Submited Successfully');
								 }
								 else if(msg['fail'] == 'fail') {
									 $('.error-edit').show();
                                     $(".error-edit").html('Please Check Field And Try Again!');
								 }
							 }
				 });
				 });
				 }
		});
		}
		
	});	

});