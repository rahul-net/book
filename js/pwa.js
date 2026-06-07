/**
 * ==========================================
 * PWA MANAGER
 * ==========================================
 */

(function () {

    "use strict";

    class PWAManager {

        constructor() {

            this.deferredPrompt = null;

            this.installButton = null;

            this.isInstalled = false;
        }

        /**
         * ==========================
         * INIT
         * ==========================
         */

        init() {

            this.installButton =
                document.getElementById(
                    "installBtn"
                );

            this.detectInstallation();

            this.registerEvents();

            this.registerServiceWorker();
        }

        /**
         * ==========================
         * INSTALL DETECTION
         * ==========================
         */

        detectInstallation() {

            const standalone =
                window.matchMedia(
                    "(display-mode: standalone)"
                ).matches;

            const navigatorStandalone =
                window.navigator.standalone === true;

            this.isInstalled =
                standalone ||
                navigatorStandalone;

            if (
                this.isInstalled &&
                this.installButton
            ) {

                this.installButton.classList.add(
                    "hidden"
                );
            }
        }

        /**
         * ==========================
         * EVENTS
         * ==========================
         */

        registerEvents() {

            window.addEventListener(
                "beforeinstallprompt",
                event => {

                    event.preventDefault();

                    this.deferredPrompt =
                        event;

                    this.showInstallButton();
                }
            );

            window.addEventListener(
                "appinstalled",
                () => {

                    this.isInstalled =
                        true;

                    this.hideInstallButton();

                    this.deferredPrompt =
                        null;

                    console.info(
                        "PWA Installed"
                    );
                }
            );

            if (
                this.installButton
            ) {

                this.installButton
                    .addEventListener(
                        "click",
                        () => {

                            this.installApp();
                        }
                    );
            }

            document.addEventListener(
                "visibilitychange",
                () => {

                    if (
                        document.visibilityState ===
                        "visible"
                    ) {

                        this.checkForUpdates();
                    }
                }
            );

            window.addEventListener(
                "online",
                () => {

                    console.info(
                        "Online"
                    );

                    this.showConnectionStatus(
                        true
                    );
                }
            );

            window.addEventListener(
                "offline",
                () => {

                    console.warn(
                        "Offline"
                    );

                    this.showConnectionStatus(
                        false
                    );
                }
            );
        }

        /**
         * ==========================
         * INSTALL
         * ==========================
         */

        async installApp() {

            if (
                !this.deferredPrompt
            ) {

                return;
            }

            try {

                await this.deferredPrompt.prompt();

                const result =
                    await this.deferredPrompt.userChoice;

                if (
                    result.outcome ===
                    "accepted"
                ) {

                    console.info(
                        "Install accepted"
                    );
                }

                this.deferredPrompt =
                    null;

                this.hideInstallButton();

            } catch (error) {

                console.error(
                    "Install failed",
                    error
                );
            }
        }

        /**
         * ==========================
         * INSTALL BUTTON
         * ==========================
         */

        showInstallButton() {

            if (
                !this.installButton
            ) {

                return;
            }

            this.installButton.classList.remove(
                "hidden"
            );
        }

        hideInstallButton() {

            if (
                !this.installButton
            ) {

                return;
            }

            this.installButton.classList.add(
                "hidden"
            );
        }

        /**
         * ==========================
         * SERVICE WORKER
         * ==========================
         */

        async registerServiceWorker() {

            if (
                !(
                    "serviceWorker" in
                    navigator
                )
            ) {

                return;
            }

            try {

                const registration =
                    await navigator
                        .serviceWorker
                        .register(
                            "./sw.js",
                            {
                                scope: "./"
                            }
                        );

                console.info(
                    "SW Registered",
                    registration.scope
                );

                registration.addEventListener(
                    "updatefound",
                    () => {

                        const worker =
                            registration.installing;

                        if (!worker) {

                            return;
                        }

                        worker.addEventListener(
                            "statechange",
                            () => {

                                if (
                                    worker.state ===
                                    "installed"
                                ) {

                                    if (
                                        navigator.serviceWorker.controller
                                    ) {

                                        this.notifyUpdateAvailable();
                                    }
                                }
                            }
                        );
                    }
                );

            } catch (error) {

                console.error(
                    "SW Registration Failed",
                    error
                );
            }
        }

        /**
         * ==========================
         * UPDATE CHECK
         * ==========================
         */

        async checkForUpdates() {

            try {

                const registrations =
                    await navigator
                        .serviceWorker
                        .getRegistrations();

                for (
                    const registration
                    of registrations
                ) {

                    registration.update();
                }

            } catch (error) {

                console.error(
                    "Update check failed",
                    error
                );
            }
        }

        /**
         * ==========================
         * UPDATE NOTICE
         * ==========================
         */

        notifyUpdateAvailable() {

            const banner =
                document.createElement(
                    "div"
                );

            banner.className =
                "pwa-update-banner";

            banner.innerHTML =
                `
                <div class="pwa-update-content">
                    <span>
                        New version available
                    </span>

                    <button id="reloadAppBtn">
                        Refresh
                    </button>
                </div>
                `;

            document.body.appendChild(
                banner
            );

            const reloadBtn =
                document.getElementById(
                    "reloadAppBtn"
                );

            if (
                reloadBtn
            ) {

                reloadBtn.addEventListener(
                    "click",
                    () => {

                        window.location.reload();
                    }
                );
            }
        }

        /**
         * ==========================
         * NETWORK STATUS
         * ==========================
         */

        showConnectionStatus(
            online
        ) {

            const existing =
                document.getElementById(
                    "network-status-banner"
                );

            if (
                existing
            ) {

                existing.remove();
            }

            const banner =
                document.createElement(
                    "div"
                );

            banner.id =
                "network-status-banner";

            banner.style.position =
                "fixed";

            banner.style.bottom =
                "20px";

            banner.style.right =
                "20px";

            banner.style.zIndex =
                "9999";

            banner.style.padding =
                "12px 18px";

            banner.style.borderRadius =
                "12px";

            banner.style.color =
                "#ffffff";

            banner.style.fontWeight =
                "600";

            banner.style.boxShadow =
                "0 8px 20px rgba(0,0,0,.2)";

            banner.style.background =
                online
                    ? "#10b981"
                    : "#ef4444";

            banner.textContent =
                online
                    ? "Back Online"
                    : "You are Offline";

            document.body.appendChild(
                banner
            );

            setTimeout(
                () => {

                    banner.remove();

                },
                3000
            );
        }

        /**
         * ==========================
         * STATUS
         * ==========================
         */

        getStatus() {

            return {

                installed:
                    this.isInstalled,

                installPromptAvailable:
                    Boolean(
                        this.deferredPrompt
                    ),

                online:
                    navigator.onLine
            };
        }
    }

    window.PWAManager =
        PWAManager;

    window.addEventListener(
        "DOMContentLoaded",
        () => {

            window.pwa =
                new PWAManager();

            window.pwa.init();
        }
    );

})();