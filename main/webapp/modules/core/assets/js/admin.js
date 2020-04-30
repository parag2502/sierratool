window.onload = function() {
	document.getElementById("login_as").innerHTML = "Login as: "+localStorage.getItem("creator");
	
	if (localStorage.getItem("creator") == "") {
		window.location = window.location.origin+'/login.html';
	}
};

function logout(){
	localStorage.setItem("creator", "");
  window.location = window.location.origin+'/login.html';
}

