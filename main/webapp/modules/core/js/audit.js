var request = new XMLHttpRequest()
var audits = new Array();
var selectedUser = "";
var aData = null;
var isFilterApplied = false;

var tDate = new Date();
var fDate = new Date(new Date().setDate(new Date().getDate()-90));

var url = "http://1.22.181.55:3002/api/audit/?fromdate="+formatDate(fDate)+"&todate="+formatDate(tDate);

request.open('GET', url, true)
request.onload = function() {
  // Begin accessing JSON data here
  var data = JSON.parse(this.response)

  if (request.status >= 200 && request.status < 400) {
	  console.log(data);
	  aData = data
      updatePage(aData);
  } else {
    console.log('error')
  }
}

document.getElementById('myDropdown').addEventListener('change', function() {
  selectedUser = this.value;
  updatePage(aData)
});

function updatePage(data){
	var c = 1;
		var userOptions = [];
		audits = [];
		
		data.forEach(audit => {
			var audit_time = new Date(audit.added_on).toLocaleString('en-US', { hour12: true });
			if(selectedUser != "" && selectedUser != "All Users"){
				if(selectedUser == audit.user){
					audits.push([audit.project_id, audit.user, audit.activity, audit_time]);
				}
			} else {
				audits.push([audit.project_id, audit.user, audit.activity, audit_time]);
			}
			userOptions.push(audit.user);
			c++;
		});
		
        //Create a HTML Table element.
        var table = document.getElementById("dvTable");
		
        table.border = "1";
		
		//remove the data rows if any
		var tableRows = table.getElementsByTagName('tr');
		var rowCount = tableRows.length;
		while(--rowCount) 
			table.deleteRow(rowCount);
		
        //Get the count of columns.
        var columnCount = audits[0].length;
 
        //Add the data rows.
        for (var i = 0; i < audits.length; i++) {
            row = table.insertRow(-1);
            for (var j = 0; j < columnCount; j++) {
                var cell = row.insertCell(-1);
                cell.innerHTML = audits[i][j];
            }
        }
		
		if(selectedUser == "" && !isFilterApplied){
			var select = document.getElementById("myDropdown");
			const uniqueUserOptions = [...new Set(userOptions)]
			
			for(var i = 0; i < uniqueUserOptions.length; i++) {
				var opt = uniqueUserOptions[i];
				var el = document.createElement("option");
				el.textContent = opt;
				el.value = opt;
				select.appendChild(el);
			}
		}
}

function getFilterData(){
	isFilterApplied = true;
	
	var fromDate = document.getElementById("from_date").value;
	var toDate = document.getElementById("to_date").value;
	
	if(fromDate != '' && toDate != ''){
	var url = "http://1.22.181.55:3002/api/audit/?fromdate="+fromDate+"&todate="+toDate;
	
	var fRequest = new XMLHttpRequest()
	
	fRequest.open('GET', url, true)
	fRequest.onload = function() {
	  // Begin accessing JSON data here
	  var data = JSON.parse(this.response)

	  if (fRequest.status >= 200 && fRequest.status < 400) {
		  console.log(data);
		  
		  aData = data
		  updatePage(aData);
	  } else {
		console.log('error')
	  }
	}

	document.getElementById('myDropdown').addEventListener('change', function() {
	  selectedUser = this.value;
	  updatePage(aData)
	});
	
	fRequest.send()
	} else {
		alert("Please select date");
	}
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}


request.send()
