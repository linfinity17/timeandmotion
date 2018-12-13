var time_arr = [];
var start_flag;
var end_flag;
var case_ref;
var clicked;

var taskList;
var unfinished_cases;

Promise.resolve()
.then(getTaskList)
.then(function(tasks) {
	taskList = tasks;
})
.then(function(){
	change_sub_task(taskList.primary_task_list,taskList.sub_task_list);
})
.then(getUnfinishedCases)
.then(function(cases){
	unfinished_cases = cases;
	populateUnfinishedCases(cases);	
});

clock();


document.querySelector('#start').addEventListener('click', function() {
	var start_time = new Date();
	var time_i = time_arr.length;
	time_arr[time_i] = start_time;
	document.querySelector('#stop').style.display = 'inline';
	document.querySelector('#start').style.display = 'none';
    document.querySelector("#start_time").innerHTML = start_time.toLocaleTimeString();
	time_i = time_i + 1;
	start_flag = 1;
	end_flag = 0;
});

document.querySelector('#stop').addEventListener('click', function() {
	var end_time = new Date();
	var time_i = time_arr.length;
	document.querySelector('#stop').style.display = 'none';
	document.querySelector('#submit').style.display = 'inline';
    document.querySelector("#stop_time").innerHTML = end_time.toLocaleTimeString();
    time_arr[time_i] = end_time;
    time_i = time_i + 1;
    end_flag = 1;
});

document.querySelector('#submit').addEventListener('click', function() {
	if (!clicked) {
		document.querySelector("#id_button").value = 'submit';
		var task_type = document.querySelector("#task_type").value;
		var p_task = document.querySelector('#primary_task').value;
		var s_task = document.querySelector('#sub_task').value;
		var completed = document.querySelector("#completed").value;
		var no_of_transactions = parseInt(document.querySelector('#no_of_transactions').value);
		var time_stamps = time_arr;

		//Error validation

		if ((p_task == "" || s_task == "") && task_type != 'continued') {
			alert("Please populate tasks");
			return;
		}

		else if (isNaN(no_of_transactions)) {
			alert("Please fill out number of transactions.");
			return;
		}

		else if (!task_type) {
			alert("Please indicate task type.");
			return;
		}

		else if (!completed) {
			alert("Please indicate if task has been closed or not.");
			return;
		}

		else if (start_flag != 1) {
			alert("Timer has not been activated.");
			return;
		}

			else if (end_flag != 1) {
			alert("Timer has not been stopped.");
			return;
		}

		else {
			//save record to database
			//tag as clicked if pass error validation
			//different info if "new" or "continued"

			clicked = true;

			if (task_type != 'continued'){
				var primary_task_value = taskList.primary_task_list[p_task].name;
				var sub_task_value = taskList.sub_task_list[s_task].name;
				var reference = '';
			}

			else {
				var time_stamps_json = JSON.parse(unfinished_cases[case_ref].fields.pause_stamps.replace(/'/g, '"'))
				var time_stamps = [];
				time_stamps_json.forEach( (item) => { time_stamps.push(new Date(item)) });
				time_stamps = time_stamps.concat(time_arr);
				var primary_task_value = unfinished_cases[case_ref].fields.primary_task;
				var sub_task_value = unfinished_cases[case_ref].fields.sub_task;
				var reference = unfinished_cases[case_ref].pk;
			}
			//save data to indexedDB
			saveToDB(task_type,
				document.querySelector("#username").innerHTML,
				primary_task_value,
				sub_task_value,
				time_stamps,
				no_of_transactions,
				document.querySelector("#remarks").value,
				Boolean(parseInt(completed)),
				reference
			);	
			if (navigator.onLine) {
				setTimeout(updateData, 500);
				setTimeout(() => {document.querySelector('#submit_form').submit();}, 750);
			}
			else {
				location.reload();
			}

		}
	}
});


document.querySelector('#save_button').addEventListener('click', function() {
	document.querySelector("#id_button").value = 'save';
	setTimeout(updateData, 500);
	setTimeout(() => {document.querySelector('#submit_form').submit();}, 750);
})

document.querySelector('#primary_task').addEventListener('change', function() {
	change_sub_task(taskList.primary_task_list,taskList.sub_task_list);
});

document.querySelector('#task_type').addEventListener('change', function() {
	if (this.value == 'continued') {
		document.querySelector('#primary_task_row').hidden = true;
		document.querySelector('#sub_task_row').hidden = true;
		document.querySelector('#previous_task_row').hidden = false;
	}
	else {
		document.querySelector('#primary_task_row').hidden = false;
		document.querySelector('#sub_task_row').hidden = false;	
		document.querySelector('#previous_task_row').hidden = true;
	}
});

document.querySelector('#previous_task').addEventListener('change', function() {
	case_ref = this.value;
	if (case_ref) {
		document.querySelector('#remarks').value = unfinished_cases[case_ref].fields.remarks;
		document.querySelector('#no_of_transactions').value = unfinished_cases[case_ref].fields.no_of_transactions;
	}
});


document.querySelector('#previous_task_row').hidden = true;
document.querySelector('#stop').style.display = 'none';
document.querySelector('#submit').style.display = 'none';

if (navigator.onLine) {
	document.querySelector("#save_button").style.visibility = 'visible';
}
else{
	document.querySelector("#save_button").style.visibility = 'hidden';
}


