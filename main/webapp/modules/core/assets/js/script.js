jQuery(document).ready(function($) {
	var weburl = 'https://'+window.location.hostname+'/web'; 
	//publisher submission
	jQuery('body').on('click', '.publisher-submit', function() {
		//defince variable for get input field data
        var publishername = $("#publisher-name").val();
		var publisherlink = $("#publisher-link").val();
		var publisherdescription = $("#publisher-description").val();
		var publishercover = $("#publisher-cover").val();
		var publisherlogo = $("#publisher-logo").val();
		
			$('.error').hide();
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			  user.getIdToken().then(function(idToken) {
				 var encode = idToken;
			$.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/publisher/publisher-ajax.php",
                      data: {
                              publishername: publishername,
							  publisherlink: publisherlink,
                              publisherdescription: publisherdescription,
                              publishercover: publishercover,
                              publishercover: publishercover,
                              publisherlogo: publisherlogo,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									 $('.success').show();
                                     $(".success").html('Publiser Submited Successfully');
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
		
	});	
		
	//publisher edit	
	jQuery('body').on('click', '.publisher-edit', function() {	
		var publisherid = $('body').find(this).attr("publisher-edit");
		$("#publisher-edit-id").val(publisherid);
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			 user.getIdToken().then(function(idToken) {
				 var encode = idToken;
		$.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/publisher/publisher-get.php",
                      data: {
                              publisherid: publisherid,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									$("#publisher-name-edit").val(msg['name']);
									$("#publisher-link-edit").val(msg['originalSiteLink']);
									$("#publisher-description-edit").val(msg['description']);
									$("#publisher-cover-edit").val(msg['coverurl']);
									$("#publisher-logo-edit").val(msg['logourl']);
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
	
	//publisher-update
	jQuery('body').on('click', '.publisher-submit-edit', function() {		
		//defince variable for get input field data
        var publishername = $("#publisher-name-edit").val();
		var publisherlink = $("#publisher-link-edit").val();
		var publisherdescription = $("#publisher-description-edit").val();
		var publishercover = $("#publisher-cover-edit").val();
		var publisherlogo = $("#publisher-logo-edit").val();
		var publishereditid = $("#publisher-edit-id").val();

			$('.error-edit').hide();
			firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			 user.getIdToken().then(function(idToken) {
				 var encode = idToken;
			$.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/publisher/publisher-ajax-edit.php",
                      data: {
                              publishername: publishername,
							  publisherlink: publisherlink,
                              publisherdescription: publisherdescription,
                              publishercover: publishercover,
                              publishercover: publishercover,
                              publisherlogo: publisherlogo,
							  publishereditid: publishereditid,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									 $('.success-edit').show();
                                     $(".success-edit").html('Publiser Submited Successfully');
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

		
	});	
			
	//rss submission
	jQuery('body').on('click', '.rss-publisher-id', function() {			
		var addrsspublisherid = $('body').find(this).attr("rss-publisher-id");
		$("#rss-publiser-id").val(addrsspublisherid);	
	});
	
	
	//rss submission	
	jQuery('body').on('click', '.rss-submit', function() {		
		//defince variable for get input field data
        var rssname = $("#rss-name").val();
		var rsslink = $("#rss-link").val();
		var rssdescription = $("#rss-description").val();
		var rssalgo = $("#rss-algo").val();
		var rssentities = $("#rss-entities").val();
		if( $("#rss-store-image").is(':checked')) {
            var rssstoreimage = $("#rss-store-image").val();
        }
		else { var rssstoreimage = 'false'; }
		if( $("#rss-entity-extraction").is(':checked')) {
            var rssentityextraction = $("#rss-entity-extraction").val();
        }
		else { var rssentityextraction = 'false'; }
		if( $("#rss-topic-extraction").is(':checked')) {
            var rsstopicextraction = $("#rss-topic-extraction").val();
        }
		else { var rsstopicextraction = 'false'; }
		if( $("#rss-inbuild-topics").is(':checked')) {
            var rssinbuildtopics = $("#rss-inbuild-topics").val();
        }
		else { var rssinbuildtopics = 'false'; }
		if( $("#rss-news-extraction").is(':checked')) {
            var rssnewsextraction = $("#rss-news-extraction").val();
        }
		else { var rssnewsextraction = 'false'; }
		if( $("#rss-wallmag-network").is(':checked')) {
            var rsswallmagnetwork = $("#rss-wallmag-network").val();
        }
		else { var rsswallmagnetwork = 'false'; }
		if( $("#rss-active").is(':checked')) {
            var rssactive = $("#rss-active").val();
        }
		else { var rssactive = 'false'; }
		var rsspublisherid = $("#rss-publiser-id").val();
		
			$('.rss-error').hide();
			firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			 user.getIdToken().then(function(idToken) {
				 var encode = idToken;
			$.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/publisher/rss-ajax.php",
                      data: {
                              rssname: rssname,
							  rsslink: rsslink,
                              rssdescription: rssdescription,
                              rssalgo: rssalgo,
                              rssentities: rssentities,
                              rssstoreimage: rssstoreimage,
							  rssentityextraction: rssentityextraction,
							  rsstopicextraction: rsstopicextraction,
							  rssinbuildtopics: rssinbuildtopics,
							  rssnewsextraction: rssnewsextraction,
							  rsswallmagnetwork: rsswallmagnetwork,
							  rssactive: rssactive,
							  rsspublisherid: rsspublisherid,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									 $('.rss-success').show();
                                     $(".rss-success").html('Publiser Submited Successfully');
								 }
								 else if(msg['fail'] == 'fail') {
									 $('.rss-error').show();
                                     $(".rss-error").html('Please Check Field And Try Again!');
								 }
							 }
				 });
				 });

				 }
		});
		
	});	
	
	//rss edit	
	jQuery('body').on('click', '.edit-rss-source', function() {
		var publisherid = $('body').find(this).attr("publisher-edit");
		var rssid = $('body').find(this).attr("rss-edit");
		alert(rssid);
		$("#rss-publiser-edit-id").val(publisherid);
		$("#rss-source-edit-id").val(rssid);
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			 user.getIdToken().then(function(idToken) {
				 var encode = idToken;
		$.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/publisher/rss-get.php",
                      data: {
                              publisherid: publisherid,
							  rssid: rssid,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									$("#rss-name-edit").val(msg['rssname']);
									$("#rss-link-edit").val(msg['rsslink']);
									$("#rss-description-edit").val(msg['rssdescription']);
									$("#rss-algo-edit").val(msg['rssalgo']);
									var rssentities = msg['rssentities'];
									if (rssentities == null) {
									$('input#rss-entities-edit').tagsinput('removeAll');
									$("input#rss-entities-edit").val('');
									}
									else {
								    $('input#rss-entities-edit').tagsinput('refresh');
									$("input#rss-entities-edit").val(msg['rssentities']);
									$('input#rss-entities-edit').tagsinput('add', msg['rssentities']);
									}
									if(msg['rssstoreimage'] == true) {
										$("#rss-store-image-edit").prop('checked', true);
									}
									else {
										$("#rss-store-image-edit").prop('checked', false);
									}
									if(msg['rssentityextraction'] == true) {
										$("#rss-entity-extraction-edit").prop('checked', true);
									}
									else {
										$("#rss-entity-extraction-edit").prop('checked', false);
									}
									if(msg['rsstopicextraction'] == true) {
										$("#rss-topic-extraction-edit").prop('checked', true);
									}
									else {
										$("#rss-topic-extraction-edit").prop('checked', false);
									}
									if(msg['rssinbuildtopics'] == true) {
										$("#rss-inbuild-topics-edit").prop('checked', true);
									}
									else {
										$("#rss-inbuild-topics-edit").prop('checked', false);
									}
									if(msg['rssnewsextraction'] == true) {
										$("#rss-news-extraction-edit").prop('checked', true);
									}
									else {
										$("#rss-news-extraction-edit").prop('checked', false);
									}
									if(msg['rsswallmagnetwork'] == true) {
										$("#rss-wallmag-network-edit").prop('checked', true);
									}
									else {
										$("#rss-wallmag-network-edit").prop('checked', false);
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
	
	//update submission	
	jQuery('body').on('click', '.rss-submit-edit', function() {		
		//defince variable for get input field data
        var rssname = $("#rss-name-edit").val();
		var rsslink = $("#rss-link-edit").val();
		var rssdescription = $("#rss-description-edit").val();
		var rssalgo = $("#rss-algo-edit").val();
		var rssentities = $("input#rss-entities-edit").val();
		//alert(rssentities);
		if( $("#rss-store-image-edit").is(':checked')) {
            var rssstoreimage = $("#rss-store-image-edit").val();
        }
		else { var rssstoreimage = 'false'; }
		if( $("#rss-entity-extraction-edit").is(':checked')) {
            var rssentityextraction = $("#rss-entity-extraction-edit").val();
        }
		else { var rssentityextraction = 'false'; }
		if( $("#rss-topic-extraction-edit").is(':checked')) {
            var rsstopicextraction = $("#rss-topic-extraction-edit").val();
        }
		else { var rsstopicextraction = 'false'; }
		if( $("#rss-inbuild-topics-edit").is(':checked')) {
            var rssinbuildtopics = $("#rss-inbuild-topics-edit").val();
        }
		else { var rssinbuildtopics = 'false'; }
		if( $("#rss-news-extraction-edit").is(':checked')) {
            var rssnewsextraction = $("#rss-news-extraction-edit").val();
        }
		else { var rssnewsextraction = 'false'; }
		if( $("#rss-wallmag-network-edit").is(':checked')) {
            var rsswallmagnetwork = $("#rss-wallmag-network-edit").val();
        }
		else { var rsswallmagnetwork = 'false'; }
		if( $("#rss-active-edit").is(':checked')) {
            var rssactive = $("#rss-active-edit").val();
        }
		else { var rssactive = 'false'; }
		var rsspublisherid = $("#rss-publiser-edit-id").val();
		var rssid = $("#rss-source-edit-id").val();
		if (!rssname || !rssname.length) {
            $('.rss-error-edit').show();
            $(".rss-error-edit").html('Please enter name');
        }
		else if(!rsslink || !rsslink.length) {
			 $('.rss-error-edit').show();
            $(".rss-error-edit").html('Please enter Link');
		}
		else if(!rssdescription || !rssdescription.length) {
			 $('.rss-error-edit').show();
            $(".rss-error-edit").html('Please enter Description');
		}
		else {
			$('.rss-error-edit').hide();
			firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			 user.getIdToken().then(function(idToken) {
				 var encode = idToken;
			$.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/publisher/rss-ajax-edit.php",
                      data: {
                              rssname: rssname,
							  rsslink: rsslink,
                              rssdescription: rssdescription,
                              rssalgo: rssalgo,
                              rssentities: rssentities,
                              rssstoreimage: rssstoreimage,
							  rssentityextraction: rssentityextraction,
							  rsstopicextraction: rsstopicextraction,
							  rssinbuildtopics: rssinbuildtopics,
							  rssnewsextraction: rssnewsextraction,
							  rsswallmagnetwork: rsswallmagnetwork,
							  rssactive: rssactive,
							  rsspublisherid: rsspublisherid,
							  rssid: rssid,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									 $('.rss-success-edit').show();
                                     $(".rss-success-edit").html('Publiser Submited Successfully');
								 }
								 else if(msg['fail'] == 'fail') {
									 $('.rss-error-edit').show();
                                     $(".rss-error-edit").html('Please Check Field And Try Again!');
								 }
							 }
				 });
				 });

				 }
		});
		}
		
	});	
	
});

//update linked entities
	jQuery('body').on('click', '.updateLinkedEntities', function() {		
		var rsspublisherid = $("#rss-publiser-edit-id").val();
		var rssid = $("#rss-source-edit-id").val();
		var rssentities = $("input#rss-entities-edit").val();
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			 user.getIdToken().then(function(idToken) {
				 var encode = idToken;
		$.ajax({
                    type: "POST",
					dataType: "json",
                    url: weburl+"/admin/ajax/publisher/updateentities-ajax.php",
                      data: {
                              rssentities: rssentities,
							  rsspublisherid: rsspublisherid,
							  rssid: rssid,
							  encode: encode,
                             },
							 success: function(msg) {
								 if(msg['success'] == 'success') {
									 alert('Linked Entites Submited Successfully');
								 }
								 else if(msg['fail'] == 'fail') {
									 alert('Please Check Field And Try Again!');
								 }
							 }
	});
	});

	}
		});
	
});
		
	var linkedentities = new Bloodhound({
	  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('text'),
	  queryTokenizer: Bloodhound.tokenizers.whitespace,
	  prefetch: {
		url: 'https://'+window.location.hostname+'/wallmag/admin/ajax/publisher/get-entity.php',
	  }
	});
	linkedentities.initialize();

	$('#rss-entities').tagsinput({
	  typeaheadjs: {
		name: 'linkedentities',
		displayKey: 'text',
		valueKey: 'value',
		source: linkedentities.ttAdapter()
	  }
	});
	
	$('#rss-entities-edit').tagsinput({
	  typeaheadjs: {
		name: 'linkedentities',
		displayKey: 'text',
		valueKey: 'value',
		source: linkedentities.ttAdapter()
	  }
	});	