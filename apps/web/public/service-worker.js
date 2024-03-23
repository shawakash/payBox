// service-worker.js

self.addEventListener('install', function(event) {
    // event.waitUntil(
    //   caches.open('my-cache-v1').then(function(cache) {
    //     return cache.addAll([
    //         '/',
    //         '/.next/app-build-manifest.json',
    //         '/.next/build-manifest.json',
    //     ]);
    //   })
    // );
  });

self.addEventListener('activate', function (event) {
    // var cacheWhitelist = ['my-cache-v1'];

    // event.waitUntil(
    //     caches.keys().then(function (cacheNames) {
    //         return Promise.all(
    //             cacheNames.map(function (cacheName) {
    //                 if (cacheWhitelist.indexOf(cacheName) === -1) {
    //                     return caches.delete(cacheName);
    //                 }
    //             })
    //         );
    //     })
    // );
});

self.addEventListener('fetch', function (event) {
    // event.respondWith(
    //     caches.match(event.request)
    //         .then(function (response) {
    //             // Cache hit - return response
    //             if (response) {
    //                 return response;
    //             }
    //             return fetch(event.request);
    //         }
    //         )
    // );
});

self.addEventListener('push', function (event) {
    console.log('Received a push message', event);

    if (event.data) {
        const payload = event.data.json();

        const title = payload.title || 'Yay a message.';
        const body = payload.body || 'We have received a push message.';
        const icon = payload.image || '/images/icon.png';
        const tag = payload.tag || 'simple-push-demo-tag';
        const href = payload.href || '/';

        event.waitUntil(
            self.registration.showNotification(title, {
                body: body,
                icon: icon,
                tag: tag,
                data: {
                    href: href
                }
            })
        );
    } else {
        console.log('Push event but no data');
    }
});