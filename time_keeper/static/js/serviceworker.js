var staticCacheName = 'time_record-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        'static/js/idb.js',
        'static/js/idbop_task.js',
        'static/js/idbop_record.js',
        'static/js/functions.js',
        'static/js/index.js',
        'static/js/serviceworker.js',
        'static/css/grid.css',
        'static/css/normalize.css',
        'static/css/stylev6.css',
        'static/fonts/Dosis-Light.ttf',
        'static/fonts/Roboto-Regular.ttf',
        'static/images/sbc_logo.png',
        'static/images/watch-192.png',
        'static/images/watch-512.png',
        'manifest.json',
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.pathname === '/logout' || requestUrl.pathname === '/reset') {
    caches.delete(staticCacheName);
    var dbs = ['record-db'];

    for (i = 0; i < dbs.length; i++) {
      var req = indexedDB.deleteDatabase(dbs[i]);

      req.onsuccess = function () {
          console.log("Deleted database successfully");
      };
      req.onerror = function () {
          console.log("Couldn't delete database");
      };
      req.onblocked = function () {
          console.log("Couldn't delete database due to the operation being blocked");
      };
    }

    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );

});

