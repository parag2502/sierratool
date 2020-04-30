window.onload = function() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			window.location = window.location.origin; 
		} else {
		}
	});
};

jQuery(document).ready(function($) {

	function toggleSignIn(email,password) {
		  if (firebase.auth().currentUser) {
			// [START signout]
			window.location = window.location.origin;
			// [END signout]
		  } else {
	
			// Sign in with email and pass.
			// [START authwithemail]
			firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
			  // Handle Errors here.
			  var errorCode = error.code;
			  var errorMessage = error.message;
			  // [START_EXCLUDE]
			  if (errorCode === 'auth/wrong-password') {
				alert('Wrong password.');
			  } else {
				alert(errorMessage);
			  }
			  //console.log(error);
			  // [END_EXCLUDE]
			});
			// [END authwithemail]
		  }
	}
	
	jQuery('.loginnow').on('click', function() {
			var email = $(".email").val();
			var password = $(".password").val();
			 var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
			if (!email || !email.length) {
				$('.error').show();
				$(".error").html('Please enter email address');
	
			}
			else if (!testEmail.test(email)) {
				$('.error').show();
				$(".error").html('Email address is not valid!');
			}
			else if (!password || !password.length) {
				$('.error').show();
				$(".error").html('Please enter email address');
	
			}
			else {
				localStorage.setItem("creator", email);
				toggleSignIn(email,password);
			}
	});
	
	jQuery('.logoutnow').on('click', function() {
			firebase.auth().signOut()
			  .then(function() {
				$.removeCookie('login', { path: '/' });
				window.location = window.location.origin+"/login.html"; 
			  })
			  .catch(function(error) {
				alert('Please reload page and try signout again!');
			  });
	});
	
	jQuery('.syncnow').on('click', function() {
			
	});
	
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
		   var lid = user._lat;
		  $.cookie('login', 'true', { expires: 1, path: '/' });
	  } else {
		// No user is signed in.
	  }
	});

});