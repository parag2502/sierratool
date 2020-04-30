jQuery(document).ready(function($) {
	function toggleSignIn(email,password) {
			// Sign in with email and pass.
			var data = JSON.stringify({"email":email,"password":password});
			var xhr = new XMLHttpRequest();

			xhr.addEventListener("readystatechange", function() {
			  if(this.readyState === 4 && this.status === 200) {
				window.location = window.location.origin;
			  } else if(this.readyState === 4 && this.status === 500) {
				console.log("login"+this.responseText);
				alert('Invalid Username / Password.');
			  }
			});

			xhr.open("POST", "http://1.22.181.55:3002/api/user/login", true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(data);
	}
	
	jQuery('.loginnow').on('click', function() {
			var email = $(".email").val();
			var password = $(".password").val();
			 var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
			if (!email || !email.length) {
				$('.error').show();
				$(".error").html('Please enter email address!');
			}
			else if (!testEmail.test(email)) {
				$('.error').show();
				$(".error").html('Email address is not valid!');
			}
			else if (!password || !password.length) {
				$('.error').show();
				$(".error").html('Please enter valid password!');
	
			}
			else {
				localStorage.setItem("creator", email);
				toggleSignIn(email,password);
			}
	});
	
	jQuery('.logoutnow').on('click', function() {
		window.location = window.location.origin+"/login.html"; 
	});
	
	jQuery('.syncnow').on('click', function() {
			
	});
});