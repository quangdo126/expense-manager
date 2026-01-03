// Service Worker for push notifications

self.addEventListener('push', function (event) {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body || '',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: data.tag || 'notification',
        data: data.data || {},
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open', title: 'Xem chi tiết' },
            { action: 'close', title: 'Đóng' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Chi Tiêu Gia Đình', options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') return;

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // If app is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin)) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Otherwise open new window
                return clients.openWindow(urlToOpen);
            })
    );
});
