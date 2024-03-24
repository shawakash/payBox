// service-worker.js

let globalPay = {};

self.addEventListener('install', function (event) {
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
    console.log('Received a push message', event.data);

    if (event.data) {
        const payload = event.data.json();
        globalPay = payload.payload;
        event.waitUntil(
            self.registration.showNotification(payload.title, {
                body: payload.body,
                icon: payload.image,
                icon: payload.image,
                tag: payload.tag,
                data: {
                    href: payload.href,
                },
                tag: payload.tag,
                actions: payload.actions || [],
                vibrate: payload.vibrate || [],
            })
        );
    } else {
        console.log('Push event but no data');
    }
});

self.addEventListener('notificationclick', async function (event) {
    console.log('On notification click: ', event.notification.tag);

    event.notification.close();
    if (event.action === "accept") {
        if(globalPay.friendshipId) {
            clients.openWindow(`/chat?id=${globalPay.friendshipId}`)
        }
        console.log("accepted");
    } else {
        clients.openWindow("/");
    }
}, false);