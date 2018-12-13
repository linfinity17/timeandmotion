  //Open new IndexedDB conncetion.

  var dbPromise_task = idb.open('task-db', 5, function(upgradeDb) {
    upgradeDb.createObjectStore('tasks',{keyPath:'pk'});
  });

  //collect latest post from server and store in idb.
  fetch('/get_task').then(function(response){
    return response.json();
  }).then(function(jsondata){
    dbPromise_task.then(function(db){
      var tx = db.transaction('tasks', 'readwrite');
        var tasksStore = tx.objectStore('tasks');
        for(var key in jsondata){
          if (jsondata.hasOwnProperty(key)) {
            tasksStore.put(jsondata[key]);
          }
        }
    });
  });


