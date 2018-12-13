function clock() {
    var today = new Date();
    var timestamp = today.toLocaleTimeString();
    document.querySelector("#clock").innerHTML = timestamp;
    var t = setTimeout(clock, 500);
}

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

function saveToDB(type,
	user,
	primary_task_value,
	sub_task_value,
	time_arr,
	no_of_transactions,
	remarks,
	completed,
	case_ref) {
	var latest_key = 0;
	var time_i = time_arr.length;

	//write data into the indexed database

	var dbPromise_record = idb.open('record-db', 5, function(upgradeDb) {
		upgradeDb.createObjectStore('records',{keyPath:'pk'});
	});

	dbPromise_record
	.then(function(db) {
		var tx = db.transaction('records', 'readonly');
		var recordsStore = tx.objectStore('records');
		return recordsStore.getAll();
	})
	.then(function(arr) {
		latest_key = arr.length;
	})
	.then(function() {
		return dbPromise_record;
	})
	.then(function(db) {
		var tx = db.transaction('records', 'readwrite');
		var recordsStore = tx.objectStore('records');
		var item = {
		model: "time_keeper.TimeRecord",
	    pk: latest_key + 1,
		fields: {user: user,
				primary_task: primary_task_value,
				sub_task: sub_task_value,
				time_length: msToTime(time_arr[time_i - 1] - time_arr[0]),
				start_time: time_arr[0],
				end_time: time_arr[time_i - 1],
				pause_stamps: time_arr,
				task_date: time_arr[0],
				no_of_transactions: no_of_transactions,
				remarks: remarks,
				completed: completed
				}
	  };
	  	if (type == 'continued') {
			item = {
				model: "time_keeper.TimeRecord",
			    pk: case_ref,
				fields: {user: user,
						primary_task: primary_task_value,
						sub_task: sub_task_value,
						time_length: msToTime(time_arr[time_i - 1] - time_arr[0]),
						start_time: time_arr[0],
						end_time: time_arr[time_i - 1],
						pause_stamps: time_arr,
						task_date: time_arr[0],
						no_of_transactions: no_of_transactions,
						remarks: remarks,
						completed: completed
				}
			  };
		}

	  if (type == 'continued') {
		  recordsStore.put(item);
		  return tx.complete;
	  }
	  else {
	  	recordsStore.add(item);
	  	return tx.complete;
	  }
	})
	.then(function() {
	    alert('Item has been added to the records');
	})
}

function updateData() {
	var rawData = [];
	var i = 0;
	var jsonData;
	var recordIndex = 1;

	var dbPromise_record = idb.open('record-db', 5, function(upgradeDb) {
		upgradeDb.createObjectStore('records',{keyPath:'pk'});
	});

	dbPromise_record
	.then(function(db) {
		var tx = db.transaction('records', 'readonly');
		var recordsStore = tx.objectStore('records');
		return recordsStore.openCursor();
	})
	.then(function logItems(cursor) {
		if (!cursor) {
		  return;
		}
		if (cursor.value.model =="time_keeper.TimeRecord"){
			latest_key = cursor.key;
			rawData[i] = cursor.value;
			rawData[i].pk = recordIndex;
			i = i + 1;
			recordIndex = recordIndex + 1;
		}
		return cursor.continue()
	.then(logItems);
	})
	.then(function(){
			jsonData = JSON.stringify(rawData);
			inputVal = document.querySelector('#id_data');
			inputVal.value = jsonData;
		});
}

function getUnfinishedCases() {
	var unfinished_cases = [];
	var dbPromise_record = idb.open('record-db', 5, function(upgradeDb) {
		upgradeDb.createObjectStore('records',{keyPath:'pk'});
	});

	return dbPromise_record
	.then(function(db) {
		var tx = db.transaction('records', 'readonly');
		var recordsStore = tx.objectStore('records');
		return recordsStore.openCursor();
		})
	.then(function logItems(cursor) {
		if (!cursor) {
		  return;
		}
		if (cursor.value.fields.completed ==false){
			unfinished_cases.push(cursor.value);
		}
		return cursor.continue()
	.then(logItems);
	})
	.then(function(){
		return unfinished_cases;
	});
}

function change_sub_task(primary_task_list,sub_task_list) {
	var sub_list_values = [];
	var sub_list_names = [];
	var k = 0;
	var selected_primary_task = document.querySelector("#primary_task");
	var selected_sub_task = document.querySelector("#sub_task");

	for (i = 1; i < sub_task_list.length; i++) {
		if(typeof(sub_task_list[i]) != "undefined"){
			if(sub_task_list[i].primary_task == selected_primary_task.value) {
				sub_list_values[k] = i;
				sub_list_names[k] = sub_task_list[i].name;
				k = k + 1;
			}
		}
	}

	selected_sub_task.length = 0;
	null_opt = document.createElement("option");
	null_opt.textContent = "Select Sub-Task";
	null_opt.value = "";
	selected_sub_task.appendChild(null_opt);

	for(i = 0; i < sub_list_names.length; i++) {
	 	var opt = sub_list_names[i];
	 	var val = sub_list_values[i];
		var el = document.createElement("option");
	    el.textContent = opt;
	    el.value = val;
		selected_sub_task.appendChild(el);
	}
}

function populateUnfinishedCases(unfinished_cases) {
      var post = document.querySelector("#previous_task").innerHTML;
      for (var item in unfinished_cases){
	    var datestamp = new Date(unfinished_cases[item].fields.start_time).toLocaleString();
        post = post + '<option value=' + item + '>' + datestamp + ' - ' + unfinished_cases[item].fields.primary_task + '</option>';
      }
      document.getElementById("previous_task").innerHTML=post;
      return;
  }

function getTaskList() {
    var primary_task_list= [];
    var sub_task_list = [];
    var list_index;
    var primary_start_index = "";
    var sub_start_index = "";

    var dbPromise_task = idb.open('task-db', 5, function(upgradeDb) {
    	upgradeDb.createObjectStore('tasks',{keyPath:'pk'});
		});

    return dbPromise_task.then(function(db){
      var tx = db.transaction('tasks', 'readonly');
        var tasksStore = tx.objectStore('tasks');
        return tasksStore.openCursor();
    }).then(function logItems(cursor) {
        if (!cursor) {
          //if true means we are done cursoring over all records in records.
          var post = document.getElementById("primary_task").innerHTML;
          for (var item in primary_task_list){
            post = post + '<option value=' + item + '>' + primary_task_list[item].name + '</option>';
          }
          document.getElementById("primary_task").innerHTML=post;
          return;
        }

        for (var field in cursor.value) {
            if(cursor.value.model == "time_keeper.PrimaryTask"){
              if(field=='fields'){
                tasksData=cursor.value[field];
                list_index = tasksData['id'];
                primary_task_list[list_index] = {};
                for(var key in tasksData){
                  if(key =='name'){
                    primary_task_list[list_index].name = tasksData[key];
                  }
                }
              }
            }
            if(cursor.value.model == "time_keeper.SubTask"){
              if(field=='fields'){
                tasksData=cursor.value[field];
                list_index = tasksData['id'];
                sub_task_list[list_index] = {};
                for(var key in tasksData){
                  if(key =='name'){
                    sub_task_list[list_index].name = tasksData[key];
                  }
                  if(key =='primary_task'){
                    sub_task_list[list_index].primary_task = tasksData[key];
                  }
                }
                //arrange object by primary task
              }
            }
          }
        return cursor.continue().then(logItems);
      }).then(function(){
      	return {primary_task_list:primary_task_list,sub_task_list:sub_task_list};
      });
    
}

