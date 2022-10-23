/* CALENDAR functions */

function resetCalendar() {
	// Set calendar for the current date    
    var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
	var yyyy = today.getFullYear();
	today = yyyy + "-" + mm + "-" + dd;
	
    document.getElementById("calendar").value = today;
}

function onCalendarChange() {
	showHistory();
}

function stepUpCalendar() {
	document.getElementById("calendar").stepUp();
	onCalendarChange();
}

function stepDownCalendar() {
	document.getElementById("calendar").stepDown();
	onCalendarChange();
}

/* WORKOUT LOG functions */

function showHistory() {
	refreshExerciseOptions();
	
	let date = document.getElementById("calendar").value;
	
	let url = "/user/history/" + date;	
	let xhr = new XMLHttpRequest();	
	xhr.open("GET", url);
	xhr.send();
	
	xhr.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE) {
			if (this.status == 200) {
				// SUCCESS
				let data = JSON.parse(this.responseText);
				
				let tbody = document.getElementById("history-table").getElementsByTagName("tbody")[0];
								
				while (tbody.firstChild) {
					tbody.removeChild(tbody.firstChild);
				}
				
				let add = "";
				
				for (let i = 0; i < data.length; i++) {
					let historyId = data[i].id;
					let weightId = "history-weight-" + historyId;
					let repsId = "history-reps-" + historyId;
					let actionsId = "history-actions-" + historyId;
					add += "<tr><th>" + (i+1) + "</th>" +
						"<td>" + data[i].exerciseName + "</td>" + 
						"<td id='" + weightId + "'>" + data[i].weight + "</td>" +
						"<td id='" + repsId + "'>" + data[i].reps + "</td>" +
						"<td id='" + actionsId + "'>" +
						"<input type='button' value='Edit' onclick=editHistory('" + historyId + "')>" +					
						"<input type='button' value='Delete' onclick=deleteHistory('" + historyId + "')></td></tr>";											 
				}
				
				tbody.innerHTML += add;
				
			} else {
				// ERROR				
				console.log("ERROR: " + this.responseText);
			}
		}        
    };
}

function refreshExerciseOptions() {
	let url = "/user/exercises";	
    let xhr = new XMLHttpRequest();
	xhr.open("GET", url);
    xhr.send();
    
    xhr.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE) {
			if (this.status == 200) {
				// SUCCESS
				let data = JSON.parse(this.responseText);
				
				let exerciseSelect = document.getElementById("exercise-select");
				
				while(exerciseSelect.firstChild) {
					exerciseSelect.removeChild(exerciseSelect.firstChild);
				}	
				
				let add = "";		
				
				for (let i = 0; i < data.length; i++) {
					add += "<option value='" + data[i].id + "'>" + data[i].name + "</option>"; 
				}
				
				exerciseSelect.innerHTML += add;			
			} else {
				// ERROR				
				console.log("ERROR: " + this.responseText);
			}
		}        
    };
}

function deleteHistory(historyId) {
	let url = "/user/history/" + historyId;	
    let xhr = new XMLHttpRequest();
	xhr.open("DELETE", url);
	xhr.send();    
    
    xhr.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			if (this.status == 200) {
				// SUCCESS				
				console.log("OK: " + this.responseText);				
			} else {
				// ERROR
				console.log("ERROR: " + this.responseText);
			}
			//showStatus(this.responseText);
			showHistory();
		}		
	}	
}

function onAddHistory() {
	let exerciseId = document.getElementById("exercise-select").value;
	let weight = document.forms["new-history-form"]["weight"].value;
	let reps = document.forms["new-history-form"]["reps"].value;	
	let createdOn = document.getElementById("calendar").value;	
	
	exerciseId = exerciseId.trim();
	weight = weight.trim();
	reps = reps.trim();
	createdOn = createdOn.trim();
	
	let data = { 	"exerciseId" : exerciseId,
					"weight" : weight,
					"reps" : reps,
					"createdOn" : createdOn };	
	
	let url = "/user/history";
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url);
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
	xhr.send(JSON.stringify(data));
	
	xhr.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			if (this.status == 200) {
				// SUCCESS				
				console.log("OK: " + this.responseText);				
			} else {
				// ERROR
				console.log("ERROR: " + this.responseText);
			}
			//showStatus(this.responseText);
			showHistory();
		}		
	}			
	
	document.forms["new-history-form"]["weight"].value = "";
	document.forms["new-history-form"]["reps"].value = "";	
}

function editHistory(historyId) {
	let weightElement = document.getElementById("history-weight-" + historyId);
	let repsElement = document.getElementById("history-reps-" + historyId);
	let actionsElement = document.getElementById("history-actions-" + historyId);	
	// read weight and reps
	let weight = weightElement.innerHTML;
	let reps = repsElement.innerHTML;	
	// add input field
	weightElement.innerHTML = "<input type='text' value='" + weight + "' size='4'>";
	repsElement.innerHTML = "<input type='text' value='" + reps + "' size='4'>";
	// remove edit button	
	actionsElement.removeChild(actionsElement.firstChild);
	// add save button
	actionsElement.innerHTML = 	"<input type='button' value='Save' onclick=saveHistory('" + historyId + "')>" +
								actionsElement.innerHTML;
}

function saveHistory(historyId) {
	// read fields
	let weightElement = document.getElementById("history-weight-" + historyId);
	let repsElement = document.getElementById("history-reps-" + historyId);
	let weight = weightElement.firstChild.value;
	let reps = repsElement.firstChild.value;	
	// remove input field and add text
	weightElement.innerHTML = weight;
	repsElement.innerHTML = reps;	
	// remove save button
	let actionsElement = document.getElementById("history-actions-" + historyId);
	actionsElement.removeChild(actionsElement.firstChild);
	// add edit button
	actionsElement.innerHTML = 	"<input type='button' value='Edit' onclick=editHistory('" + historyId + "')>" + 
								actionsElement.innerHTML;
	// get date								
	let createdOn = document.getElementById("calendar").value;
	
	weight = weight.trim();
	reps = reps.trim();
	createdOn = createdOn.trim();
								
	let data = {	"weight" : weight,
					"reps" : reps,
					"createdOn" : createdOn };
					
	let url = "/user/history/" + historyId;	
	let xhr = new XMLHttpRequest();	
	xhr.open("PUT", url);	
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
	xhr.send(JSON.stringify(data));
	
	xhr.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			if (this.status == 200) {
				// SUCCESS				
				console.log("OK: " + this.responseText);				
			} else {
				// ERROR
				console.log("ERROR: " + this.responseText);
			}
			//showStatus(this.responseText);
			showHistory();
		}		
	}
}