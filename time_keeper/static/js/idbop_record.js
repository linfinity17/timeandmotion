  var dbPromise_record = idb.open('record-db', 5, function(upgradeDb) {
    upgradeDb.createObjectStore('records',{keyPath:'pk'});
  });

  if (window.location.pathname == "/logged_in" || (window.location.pathname == "/timer" && navigator.onLine)) {
    var username = document.getElementById('username').innerHTML;
    var url = "/get_record/" + username;

    fetch(url).then(function(response){
      return response.json();
    }).then(function(jsondata){
      dbPromise_record.then(function(db){
        var tx = db.transaction('records', 'readwrite');
          var recordsStore = tx.objectStore('records');
          for(var key in jsondata){
            if (jsondata.hasOwnProperty(key)) {
              recordsStore.put(jsondata[key]);
            }
          }
      });
    });
  }

  //retrive data from idb and display on page.

  if (window.location.pathname == "/post_data") {
    var post="<tr><th class='data-col-1'>Start Time</th><th class='data-col-2'>End Time</th><th class='data-col-3'>Primary Task</th><th class='data-col-4'>Sub Task</th><th class='data-col-5'>Remarks</th><th class='data-col-6'>Not Done?</th></tr>";
    dbPromise_record.then(function(db){
      var tx = db.transaction('records', 'readonly');
        var recordsStore = tx.objectStore('records');
        return recordsStore.openCursor();
    }).then(function logItems(cursor) {
        if (!cursor) {
          //if true means we are done cursoring over all records in records.
          document.getElementById('offline_data').innerHTML=post;
          return;
        }
        for (var field in cursor.value) {
            if(cursor.value.model == "time_keeper.TimeRecord"){
              if(field=='fields'){
                recordsData=cursor.value[field];
                for(var key in recordsData){
                  //   alert(recordsData[key]);
                  if(key =='start_time'){
                    var start_time = "<td class='data-col-1'>"+new Date(recordsData[key]).toLocaleDateString() + ' - ' + new Date(recordsData[key]).toLocaleTimeString()+'</td>';
                  }
                  if(key =='end_time'){
                    var end_time = "<td class='data-col-2'>"+new Date(recordsData[key]).toLocaleDateString() + ' - ' + new Date(recordsData[key]).toLocaleTimeString()+'</td>';
                  }
                  if(key =='primary_task'){
                    var primary_task = "<td class='data-col-3'>"+recordsData[key]+'</td>';
                  }
                  if(key =='sub_task'){
                    var sub_task = "<td class='data-col-4'>"+recordsData[key]+'</td>';
                  }
                  if(key =='remarks'){
                    var remarks = "<td class='data-col-5'>"+recordsData[key]+'</td>';
                  }
                  if(key =='completed'){
                    if (!recordsData[key]) {
                      var completed = "<td class='data-col-6'>"+ "NOT DONE" +'</td>';
                    }
                    else {
                     var completed = "<td class='data-col-6'>"+ '</td>'; 
                    }
                    }

                }
                post=post+'<tr>'+start_time+end_time+primary_task+sub_task+remarks+completed+'</tr>';
              }
            }
          }
        return cursor.continue().then(logItems);
      });
  }
