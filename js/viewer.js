/**
 * ==========================================
 * PDF VIEWER MANAGER
 * ==========================================
 */

(function () {

    "use strict";

    class ViewerManager {

        constructor() {

            this.currentBook = null;

            this.currentUrl = null;

            this.elements = {};

            this.isFullscreen = false;
        }

        /**
         * ==========================
         * INIT
         * ==========================
         */

        init() {

            this.cacheElements();

            this.bindEvents();
        }

        /**
         * ==========================
         * ELEMENTS
         * ==========================
         */

        cacheElements() {

            this.elements.modal =
                document.getElementById(
                    "viewerModal"
                );

            this.elements.frame =
                document.getElementById(
                    "pdfFrame"
                );

            this.elements.title =
                document.getElementById(
                    "viewerBookTitle"
                );

            this.elements.closeBtn =
                document.getElementById(
                    "closeViewerBtn"
                );

            this.elements.fullscreenBtn =
                document.getElementById(
                    "fullscreenBtn"
                );

            this.elements.openNewTabBtn =
                document.getElementById(
                    "openNewTabBtn"
                );

            this.elements.favoriteBtn =
                document.getElementById(
                    "favoriteBtn"
                );
        }

        /**
         * ==========================
         * EVENTS
         * ==========================
         */

        bindEvents() {

            if (
                this.elements.closeBtn
            ) {

                this.elements.closeBtn
                    .addEventListener(
                        "click",
                        () => {

                            this.close();
                        }
                    );
            }

            if (
                this.elements.fullscreenBtn
            ) {

                this.elements.fullscreenBtn
                    .addEventListener(
                        "click",
                        () => {

                            this.toggleFullscreen();
                        }
                    );
            }

            if (
                this.elements.openNewTabBtn
            ) {

                this.elements.openNewTabBtn
                    .addEventListener(
                        "click",
                        () => {

                            this.openNewTab();
                        }
                    );
            }

            if (
                this.elements.favoriteBtn
            ) {

                this.elements.favoriteBtn
                    .addEventListener(
                        "click",
                        () => {

                            this.toggleFavorite();
                        }
                    );
            }

            document.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        this.close();
                    }
                }
            );

            document.addEventListener(
                "fullscreenchange",
                () => {

                    this.updateFullscreenState();
                }
            );
        }

        /**
         * ==========================
         * OPEN BOOK
         * ==========================
         */

        open(book) {

            if (!book) {

                return;
            }

            this.currentBook = book;

            this.currentUrl =
                book.url;

            if (
                this.elements.title
            ) {

                this.elements.title.textContent =
                    book.title;
            }

            if (
                this.elements.frame
            ) {

                this.elements.frame.src =
                    book.url;
            }

            if (
                this.elements.modal
            ) {

                this.elements.modal
                    .classList.add(
                        "active"
                    );
            }

            document.body.style
                .overflow = "hidden";

            this.saveRecentBook();

            this.updateFavoriteButton();

            this.trackOpen();
        }

        /**
         * ==========================
         * CLOSE
         * ==========================
         */

        close() {

            if (
                this.elements.modal
            ) {

                this.elements.modal
                    .classList.remove(
                        "active"
                    );
            }

            if (
                this.elements.frame
            ) {

                this.elements.frame.src =
                    "about:blank";
            }

            document.body.style
                .overflow = "";

            this.currentBook = null;

            this.currentUrl = null;
        }

        /**
         * ==========================
         * FAVORITE
         * ==========================
         */

        toggleFavorite() {

            if (
                !this.currentBook
            ) {

                return;
            }

            const state =
                window.storage
                    .toggleFavorite(
                        this.currentBook.id
                    );

            this.updateFavoriteButton();

            document.dispatchEvent(
                new CustomEvent(
                    "favoriteChanged",
                    {
                        detail: {
                            book:
                                this.currentBook,
                            state
                        }
                    }
                )
            );
        }

        updateFavoriteButton() {

            if (
                !this.elements.favoriteBtn
            ) {

                return;
            }

            if (
                !this.currentBook
            ) {

                this.elements.favoriteBtn.textContent =
                    "☆";

                return;
            }

            const favorite =
                window.storage
                    .isFavorite(
                        this.currentBook.id
                    );

            this.elements.favoriteBtn.textContent =
                favorite
                    ? "★"
                    : "☆";
        }

        /**
         * ==========================
         * RECENTS
         * ==========================
         */

        saveRecentBook() {

            if (
                !this.currentBook
            ) {

                return;
            }

            window.storage
                .addRecent({
                    id:
                        this.currentBook.id,

                    title:
                        this.currentBook.title,

                    className:
                        this.currentBook.className,

                    url:
                        this.currentBook.url
                });
        }

        /**
         * ==========================
         * NEW TAB
         * ==========================
         */

        openNewTab() {

            if (
                !this.currentUrl
            ) {

                return;
            }

            window.open(
                this.currentUrl,
                "_blank",
                "noopener,noreferrer"
            );
        }

        /**
         * ==========================
         * FULLSCREEN
         * ==========================
         */

        async toggleFullscreen() {

            try {

                const container =
                    this.elements.modal;

                if (
                    !document.fullscreenElement
                ) {

                    await container
                        .requestFullscreen();

                } else {

                    await document
                        .exitFullscreen();
                }

            } catch (error) {

                console.error(
                    "Fullscreen error",
                    error
                );
            }
        }

        updateFullscreenState() {

            this.isFullscreen =
                Boolean(
                    document
                        .fullscreenElement
                );

            if (
                this.elements
                    .fullscreenBtn
            ) {

                this.elements
                    .fullscreenBtn
                    .textContent =
                    this.isFullscreen
                        ? "🡼"
                        : "⛶";
            }
        }

        /**
         * ==========================
         * ANALYTICS
         * ==========================
         */

        trackOpen() {

            if (
                !this.currentBook
            ) {

                return;
            }

            console.info(
                "Book opened:",
                {
                    id:
                        this.currentBook.id,

                    title:
                        this.currentBook.title,

                    class:
                        this.currentBook.className
                }
            );
        }

        /**
         * ==========================
         * HELPERS
         * ==========================
         */

        getCurrentBook() {

            return this.currentBook;
        }

        getCurrentUrl() {

            return this.currentUrl;
        }

        isOpen() {

            return (
                this.elements.modal
                    ?.classList.contains(
                        "active"
                    ) || false
            );
        }
    }

    window.ViewerManager =
        ViewerManager;

    window.viewer =
        new ViewerManager();

})();