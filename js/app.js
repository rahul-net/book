/**
 * ==========================================
 * MAIN APPLICATION
 * ==========================================
 */

(function () {

    "use strict";

    class BookLibraryApp {

        constructor() {

            this.books = [];

            this.filteredBooks = [];

            this.currentView = "dashboard";

            this.elements = {};

            this.bookTemplate = null;
        }

        /**
         * ==========================
         * INIT
         * ==========================
         */

        async init() {

            try {

                this.cacheElements();

                this.bindEvents();

                this.restoreTheme();

                this.restoreView();

                await this.loadBooks();

                this.buildClassFilters();

                this.updateStats();

                this.render();

                if (
                    window.viewer &&
                    typeof window.viewer.init ===
                        "function"
                ) {

                    window.viewer.init();
                }

            } catch (error) {

                console.error(
                    "Application initialization failed",
                    error
                );

                this.showError(
                    "Failed to load books."
                );
            }
        }

        /**
         * ==========================
         * ELEMENTS
         * ==========================
         */

        cacheElements() {

            this.elements.booksGrid =
                document.getElementById(
                    "booksGrid"
                );

            this.elements.loading =
                document.getElementById(
                    "loadingState"
                );

            this.elements.empty =
                document.getElementById(
                    "emptyState"
                );

            this.elements.search =
                document.getElementById(
                    "searchInput"
                );

            this.elements.clearSearch =
                document.getElementById(
                    "clearSearch"
                );

            this.elements.classFilter =
                document.getElementById(
                    "classFilter"
                );

            this.elements.sortFilter =
                document.getElementById(
                    "sortFilter"
                );

            this.elements.classList =
                document.getElementById(
                    "classList"
                );

            this.elements.pageTitle =
                document.getElementById(
                    "pageTitle"
                );

            this.elements.pageSubtitle =
                document.getElementById(
                    "pageSubtitle"
                );

            this.elements.menuBtn =
                document.getElementById(
                    "menuBtn"
                );

            this.elements.sidebar =
                document.getElementById(
                    "sidebar"
                );

            this.elements.overlay =
                document.getElementById(
                    "overlay"
                );

            this.elements.closeSidebar =
                document.getElementById(
                    "closeSidebarBtn"
                );

            this.elements.themeToggle =
                document.getElementById(
                    "themeToggle"
                );

            this.bookTemplate =
                document.getElementById(
                    "bookCardTemplate"
                );
        }

        /**
         * ==========================
         * LOAD JSON
         * ==========================
         */

        async loadBooks() {

            this.showLoading(true);

            const response =
                await fetch(
                    "./books.json",
                    {
                        cache: "no-cache"
                    }
                );

            if (
                !response.ok
            ) {

                throw new Error(
                    "books.json not found"
                );
            }

            const data =
                await response.json();

            this.books =
                this.normalizeBooks(
                    data
                );

            searchEngine.setBooks(
                this.books
            );

            this.filteredBooks =
                searchEngine.getResults();

            this.showLoading(false);
        }

        /**
         * ==========================
         * NORMALIZE DATA
         * ==========================
         */

        normalizeBooks(data) {

            const books = [];

            Object.entries(data)
                .forEach(
                    ([classKey, items]) => {

                        Object.entries(items)
                            .forEach(
                                ([
                                    title,
                                    url
                                ]) => {

                                    books.push({
                                        id:
                                            `${classKey}_${title}`
                                                .replaceAll(
                                                    " ",
                                                    "_"
                                                ),

                                        title,

                                        url,

                                        classKey,

                                        className:
                                            this.formatClassName(
                                                classKey
                                            )
                                    });
                                }
                            );
                    }
                );

            return books;
        }

        /**
         * ==========================
         * CLASS LABEL
         * ==========================
         */

        formatClassName(classKey) {

            return classKey
                .replaceAll(
                    "_",
                    " "
                )
                .replace(
                    "class",
                    "Class"
                );
        }

        /**
         * ==========================
         * BUILD FILTERS
         * ==========================
         */

        buildClassFilters() {

            const classes =
                [
                    ...new Set(
                        this.books.map(
                            book =>
                                book.classKey
                        )
                    )
                ];

            classes.forEach(
                classKey => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        classKey;

                    option.textContent =
                        this.formatClassName(
                            classKey
                        );

                    this.elements.classFilter
                        .appendChild(
                            option
                        );

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.className =
                        "class-btn";

                    button.dataset.class =
                        classKey;

                    button.textContent =
                        this.formatClassName(
                            classKey
                        );

                    this.elements.classList
                        .appendChild(
                            button
                        );
                }
            );
        }

        /**
         * ==========================
         * EVENTS
         * ==========================
         */

        bindEvents() {

            document.addEventListener(
                "click",
                event => {

                    const target =
                        event.target;

                    if (
                        target.matches(
                            ".open-book-btn"
                        )
                    ) {

                        const id =
                            target.dataset
                                .id;

                        const book =
                            searchEngine.getBookById(
                                id
                            );

                        viewer.open(
                            book
                        );
                    }

                    if (
                        target.matches(
                            ".favorite-toggle"
                        )
                    ) {

                        const id =
                            target.dataset
                                .id;

                        storage.toggleFavorite(
                            id
                        );

                        this.render();

                        this.updateStats();
                    }

                    if (
                        target.matches(
                            ".class-btn"
                        )
                    ) {

                        document
                            .querySelectorAll(
                                ".class-btn"
                            )
                            .forEach(
                                btn =>
                                    btn.classList.remove(
                                        "active"
                                    )
                            );

                        target.classList.add(
                            "active"
                        );

                        const value =
                            target.dataset
                                .class;

                        this.elements.classFilter.value =
                            value;

                        searchEngine.setClassFilter(
                            value
                        );

                        storage.setLastClass(
                            value
                        );

                        this.render();
                    }

                    if (
                        target.matches(
                            ".nav-item"
                        )
                    ) {

                        this.switchView(
                            target.dataset
                                .view
                        );
                    }
                }
            );

            this.elements.search
                .addEventListener(
                    "input",
                    event => {

                        searchEngine.setSearchQuery(
                            event.target
                                .value
                        );

                        this.render();
                    }
                );

            this.elements.clearSearch
                .addEventListener(
                    "click",
                    () => {

                        this.elements.search.value =
                            "";

                        searchEngine.setSearchQuery(
                            ""
                        );

                        this.render();
                    }
                );

            this.elements.classFilter
                .addEventListener(
                    "change",
                    event => {

                        searchEngine.setClassFilter(
                            event.target
                                .value
                        );

                        storage.setLastClass(
                            event.target
                                .value
                        );

                        this.render();
                    }
                );

            this.elements.sortFilter
                .addEventListener(
                    "change",
                    event => {

                        searchEngine.setSortMode(
                            event.target
                                .value
                        );

                        this.render();
                    }
                );

            this.elements.menuBtn
                .addEventListener(
                    "click",
                    () => {

                        this.openSidebar();
                    }
                );

            this.elements.closeSidebar
                .addEventListener(
                    "click",
                    () => {

                        this.closeSidebar();
                    }
                );

            this.elements.overlay
                .addEventListener(
                    "click",
                    () => {

                        this.closeSidebar();
                    }
                );

            this.elements.themeToggle
                .addEventListener(
                    "click",
                    () => {

                        this.toggleTheme();
                    }
                );

            document.addEventListener(
                "favoriteChanged",
                () => {

                    this.updateStats();

                    this.render();
                }
            );
        }

        /**
         * ==========================
         * VIEWS
         * ==========================
         */

        switchView(view) {

            this.currentView =
                view;

            searchEngine.setView(
                view
            );

            storage.setLastView(
                view
            );

            document
                .querySelectorAll(
                    ".nav-item"
                )
                .forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );

            const active =
                document.querySelector(
                    `[data-view="${view}"]`
                );

            if (active) {

                active.classList.add(
                    "active"
                );
            }

            this.elements.pageTitle.textContent =
                view ===
                "favorites"
                    ? "Favorites"
                    : view ===
                      "recent"
                    ? "Recent Books"
                    : "Dashboard";

            this.render();
        }

        restoreView() {

            const view =
                storage.getLastView();

            this.currentView =
                view;

            searchEngine.setView(
                view
            );
        }

        /**
         * ==========================
         * RENDER
         * ==========================
         */

        render() {

            const books =
                searchEngine.runFilters();

            this.elements.booksGrid.innerHTML =
                "";

            if (
                books.length === 0
            ) {

                this.elements.empty.classList.remove(
                    "hidden"
                );

                return;
            }

            this.elements.empty.classList.add(
                "hidden"
            );

            const fragment =
                document.createDocumentFragment();

            books.forEach(book => {

                const node =
                    this.bookTemplate.content
                        .cloneNode(true);

                node.querySelector(
                    ".book-title"
                ).textContent =
                    book.title;

                node.querySelector(
                    ".book-class"
                ).textContent =
                    book.className;

                const openBtn =
                    node.querySelector(
                        ".open-book-btn"
                    );

                openBtn.dataset.id =
                    book.id;

                const favBtn =
                    node.querySelector(
                        ".favorite-toggle"
                    );

                favBtn.dataset.id =
                    book.id;

                const isFav =
                    storage.isFavorite(
                        book.id
                    );

                favBtn.textContent =
                    isFav
                        ? "★"
                        : "☆";

                if (isFav) {

                    favBtn.classList.add(
                        "active"
                    );
                }

                fragment.appendChild(
                    node
                );
            });

            this.elements.booksGrid.appendChild(
                fragment
            );
        }

        /**
         * ==========================
         * STATS
         * ==========================
         */

        updateStats() {

            document.getElementById(
                "totalBooks"
            ).textContent =
                this.books.length;

            document.getElementById(
                "totalClasses"
            ).textContent =
                new Set(
                    this.books.map(
                        b =>
                            b.classKey
                    )
                ).size;

            document.getElementById(
                "favoriteCount"
            ).textContent =
                storage.getFavorites()
                    .length;

            document.getElementById(
                "recentCount"
            ).textContent =
                storage.getRecents()
                    .length;
        }

        /**
         * ==========================
         * THEME
         * ==========================
         */

        restoreTheme() {

            const theme =
                storage.getTheme();

            if (
                theme === "dark"
            ) {

                document.documentElement.classList.add(
                    "dark"
                );
            }
        }

        toggleTheme() {

            document.documentElement.classList.toggle(
                "dark"
            );

            const dark =
                document.documentElement.classList.contains(
                    "dark"
                );

            storage.setTheme(
                dark
                    ? "dark"
                    : "light"
            );

            this.elements.themeToggle.textContent =
                dark
                    ? "☀️ Light Mode"
                    : "🌙 Dark Mode";
        }

        /**
         * ==========================
         * SIDEBAR
         * ==========================
         */

        openSidebar() {

            this.elements.sidebar.classList.add(
                "active"
            );

            this.elements.overlay.classList.add(
                "active"
            );
        }

        closeSidebar() {

            this.elements.sidebar.classList.remove(
                "active"
            );

            this.elements.overlay.classList.remove(
                "active"
            );
        }

        /**
         * ==========================
         * LOADING
         * ==========================
         */

        showLoading(state) {

            if (
                state
            ) {

                this.elements.loading.classList.remove(
                    "hidden"
                );

            } else {

                this.elements.loading.classList.add(
                    "hidden"
                );
            }
        }

        /**
         * ==========================
         * ERROR
         * ==========================
         */

        showError(message) {

            this.elements.booksGrid.innerHTML =
                `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
                `;
        }
    }

    window.BookLibraryApp =
        BookLibraryApp;

    window.addEventListener(
        "DOMContentLoaded",
        async () => {

            window.app =
                new BookLibraryApp();

            await app.init();
        }
    );

})();