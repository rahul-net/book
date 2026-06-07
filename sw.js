/**
 * ==========================================
 * SERVICE WORKER
 * National Textbook Library
 * ==========================================
 */

"use strict";

const CACHE_VERSION = "v1.0.0";

const STATIC_CACHE =
    `static-${CACHE_VERSION}`;

const DYNAMIC_CACHE =
    `dynamic-${CACHE_VERSION}`;

const OFFLINE_URL =
    "./";

const STATIC_ASSETS = [

    "./",

    "./index.html",

    "./style.css",

    "./responsive.css",

    "./darkmode.css",

    "./storage.js",

    "./search.js",

    "./viewer.js",

    "./app.js",

    "./pwa.js",

    "./manifest.webmanifest",

    "./books.json"
];

/**
 * ==========================================
 * INSTALL
 * ==========================================
 */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(
                STATIC_CACHE
            )
            .then(cache => {

                return cache.addAll(
                    STATIC_ASSETS
                );
            })
            .then(() => {

                return self.skipWaiting();
            })
            .catch(error => {

                console.error(
                    "SW Install Error",
                    error
                );
            })
        );
    }
);

/**
 * ==========================================
 * ACTIVATE
 * ==========================================
 */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        const validCache =

                            key === STATIC_CACHE ||
                            key === DYNAMIC_CACHE;

                        if (!validCache) {

                            return caches.delete(
                                key
                            );
                        }

                        return null;
                    })
                );
            })
            .then(() => {

                return self.clients.claim();
            })
        );
    }
);

/**
 * ==========================================
 * FETCH
 * ==========================================
 */

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;

        if (
            request.method !== "GET"
        ) {

            return;
        }

        const url =
            new URL(
                request.url
            );

        /**
         * Google Drive
         */

        if (
            url.hostname.includes(
                "google.com"
            ) ||
            url.hostname.includes(
                "googleusercontent.com"
            )
        ) {

            event.respondWith(

                fetch(request)
                .catch(() => {

                    return caches.match(
                        OFFLINE_URL
                    );
                })
            );

            return;
        }

        /**
         * HTML
         */

        if (
            request.headers.get(
                "accept"
            )?.includes(
                "text/html"
            )
        ) {

            event.respondWith(

                networkFirst(
                    request
                )
            );

            return;
        }

        /**
         * JSON
         */

        if (
            request.url.endsWith(
                ".json"
            )
        ) {

            event.respondWith(

                staleWhileRevalidate(
                    request
                )
            );

            return;
        }

        /**
         * CSS JS IMG
         */

        event.respondWith(

            cacheFirst(
                request
            )
        );
    }
);

/**
 * ==========================================
 * CACHE FIRST
 * ==========================================
 */

async function cacheFirst(
    request
) {

    const cached =
        await caches.match(
            request
        );

    if (cached) {

        return cached;
    }

    try {

        const response =
            await fetch(
                request
            );

        const cache =
            await caches.open(
                DYNAMIC_CACHE
            );

        cache.put(
            request,
            response.clone()
        );

        return response;

    } catch {

        return new Response(
            "Offline",
            {
                status: 503,
                statusText:
                    "Offline"
            }
        );
    }
}

/**
 * ==========================================
 * NETWORK FIRST
 * ==========================================
 */

async function networkFirst(
    request
) {

    try {

        const response =
            await fetch(
                request
            );

        const cache =
            await caches.open(
                DYNAMIC_CACHE
            );

        cache.put(
            request,
            response.clone()
        );

        return response;

    } catch {

        const cached =
            await caches.match(
                request
            );

        if (cached) {

            return cached;
        }

        return caches.match(
            OFFLINE_URL
        );
    }
}

/**
 * ==========================================
 * STALE WHILE REVALIDATE
 * ==========================================
 */

async function staleWhileRevalidate(
    request
) {

    const cache =
        await caches.open(
            DYNAMIC_CACHE
        );

    const cached =
        await cache.match(
            request
        );

    const networkFetch =
        fetch(request)
        .then(response => {

            cache.put(
                request,
                response.clone()
            );

            return response;
        })
        .catch(() => {

            return cached;
        });

    return cached ||
        networkFetch;
}

/**
 * ==========================================
 * MESSAGE
 * ==========================================
 */

self.addEventListener(
    "message",
    event => {

        if (
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();
        }
    }
);

/**
 * ==========================================
 * PUSH
 * ==========================================
 */

self.addEventListener(
    "push",
    event => {

        const data =
            event.data
                ? event.data.json()
                : {};

        const title =
            data.title ||
            "National Textbook Library";

        const options = {

            body:
                data.body ||
                "New content available",

            icon:
                "./icons/icon-192.png",

            badge:
                "./icons/icon-192.png",

            vibrate:
                [100, 50, 100],

            data: {

                url:
                    data.url || "./"
            }
        };

        event.waitUntil(

            self.registration.showNotification(
                title,
                options
            )
        );
    }
);

/**
 * ==========================================
 * NOTIFICATION CLICK
 * ==========================================
 */

self.addEventListener(
    "notificationclick",
    event => {

        event.notification.close();

        const targetUrl =
            event.notification.data?.url ||
            "./";

        event.waitUntil(

            clients.matchAll({
                type: "window"
            })
            .then(clientsList => {

                for (
                    const client
                    of clientsList
                ) {

                    if (
                        client.url === targetUrl &&
                        "focus" in client
                    ) {

                        return client.focus();
                    }
                }

                if (
                    clients.openWindow
                ) {

                    return clients.openWindow(
                        targetUrl
                    );
                }
            })
        );
    }
);