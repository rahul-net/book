/**
 * ==========================================
 * SEARCH ENGINE
 * ==========================================
 */

(function () {

    "use strict";

    class SearchEngine {

        constructor() {

            this.books = [];

            this.filteredBooks = [];

            this.searchQuery = "";

            this.classFilter = "all";

            this.sortMode = "name";

            this.currentView = "dashboard";
        }

        /**
         * ==========================
         * DATA SETTER
         * ==========================
         */

        setBooks(books) {

            if (!Array.isArray(books)) {

                this.books = [];

                this.filteredBooks = [];

                return;
            }

            this.books = [...books];

            this.filteredBooks = [...books];
        }

        /**
         * ==========================
         * SEARCH QUERY
         * ==========================
         */

        setSearchQuery(query) {

            this.searchQuery =
                String(query || "")
                    .trim()
                    .toLowerCase();

            return this.runFilters();
        }

        /**
         * ==========================
         * CLASS FILTER
         * ==========================
         */

        setClassFilter(className) {

            this.classFilter =
                className || "all";

            return this.runFilters();
        }

        /**
         * ==========================
         * SORT
         * ==========================
         */

        setSortMode(mode) {

            this.sortMode =
                mode || "name";

            return this.runFilters();
        }

        /**
         * ==========================
         * VIEW
         * ==========================
         */

        setView(view) {

            this.currentView =
                view || "dashboard";

            return this.runFilters();
        }

        /**
         * ==========================
         * RESET
         * ==========================
         */

        reset() {

            this.searchQuery = "";

            this.classFilter = "all";

            this.sortMode = "name";

            this.filteredBooks =
                [...this.books];

            return this.filteredBooks;
        }

        /**
         * ==========================
         * SEARCH
         * ==========================
         */

        searchBooks(list) {

            if (!this.searchQuery) {

                return [...list];
            }

            const query =
                this.searchQuery;

            return list.filter(book => {

                const title =
                    String(book.title || "")
                        .toLowerCase();

                const className =
                    String(book.className || "")
                        .toLowerCase();

                const id =
                    String(book.id || "")
                        .toLowerCase();

                const combined =
                    `${title} ${className} ${id}`;

                return combined.includes(
                    query
                );
            });
        }

        /**
         * ==========================
         * CLASS FILTER
         * ==========================
         */

        filterByClass(list) {

            if (
                this.classFilter === "all"
            ) {

                return [...list];
            }

            return list.filter(book => {

                return (
                    book.classKey ===
                    this.classFilter
                );
            });
        }

        /**
         * ==========================
         * FAVORITES VIEW
         * ==========================
         */

        filterFavorites(list) {

            const favorites =
                window.storage
                    ?.getFavorites?.() || [];

            return list.filter(book =>

                favorites.includes(
                    book.id
                )

            );
        }

        /**
         * ==========================
         * RECENTS VIEW
         * ==========================
         */

        filterRecents() {

            const recents =
                window.storage
                    ?.getRecents?.() || [];

            const recentIds =
                recents.map(
                    item => item.id
                );

            const books =
                this.books.filter(book =>

                    recentIds.includes(
                        book.id
                    )

                );

            books.sort((a, b) => {

                const aItem =
                    recents.find(
                        r => r.id === a.id
                    );

                const bItem =
                    recents.find(
                        r => r.id === b.id
                    );

                const aTime =
                    aItem?.openedAt || 0;

                const bTime =
                    bItem?.openedAt || 0;

                return bTime - aTime;
            });

            return books;
        }

        /**
         * ==========================
         * SORT
         * ==========================
         */

        sortBooks(list) {

            const sorted =
                [...list];

            switch (
                this.sortMode
            ) {

                case "class":

                    sorted.sort(
                        (a, b) => {

                            return String(
                                a.className
                            ).localeCompare(
                                String(
                                    b.className
                                ),
                                "bn"
                            );
                        }
                    );

                    break;

                case "name":

                default:

                    sorted.sort(
                        (a, b) => {

                            return String(
                                a.title
                            ).localeCompare(
                                String(
                                    b.title
                                ),
                                "bn"
                            );
                        }
                    );

                    break;
            }

            return sorted;
        }

        /**
         * ==========================
         * RUN ALL FILTERS
         * ==========================
         */

        runFilters() {

            let result = [];

            switch (
                this.currentView
            ) {

                case "favorites":

                    result =
                        this.filterFavorites(
                            this.books
                        );

                    break;

                case "recent":

                    result =
                        this.filterRecents();

                    break;

                default:

                    result =
                        [...this.books];

                    break;
            }

            result =
                this.filterByClass(
                    result
                );

            result =
                this.searchBooks(
                    result
                );

            result =
                this.sortBooks(
                    result
                );

            this.filteredBooks =
                result;

            return result;
        }

        /**
         * ==========================
         * GET RESULTS
         * ==========================
         */

        getResults() {

            return [
                ...this.filteredBooks
            ];
        }

        /**
         * ==========================
         * COUNTS
         * ==========================
         */

        getTotalBooks() {

            return this.books.length;
        }

        getFilteredCount() {

            return this.filteredBooks
                .length;
        }

        /**
         * ==========================
         * CLASSES
         * ==========================
         */

        getClasses() {

            const unique =
                new Set();

            this.books.forEach(book => {

                if (
                    book.classKey
                ) {

                    unique.add(
                        book.classKey
                    );
                }
            });

            return Array.from(unique)
                .sort();
        }

        /**
         * ==========================
         * BOOK BY ID
         * ==========================
         */

        getBookById(id) {

            return this.books.find(
                book =>
                    book.id === id
            ) || null;
        }

        /**
         * ==========================
         * STATS
         * ==========================
         */

        getStats() {

            return {

                totalBooks:
                    this.books.length,

                filteredBooks:
                    this.filteredBooks
                        .length,

                searchQuery:
                    this.searchQuery,

                classFilter:
                    this.classFilter,

                sortMode:
                    this.sortMode,

                view:
                    this.currentView
            };
        }
    }

    window.SearchEngine =
        SearchEngine;

    window.searchEngine =
        new SearchEngine();

})();