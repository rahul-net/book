/**
 * ==========================================
 * STORAGE MANAGER
 * ==========================================
 */

(function () {
    "use strict";

    const STORAGE_KEYS = {

        FAVORITES: "nctb_favorites",

        RECENTS: "nctb_recent_books",

        THEME: "nctb_theme",

        LAST_CLASS: "nctb_last_class",

        LAST_VIEW: "nctb_last_view"

    };

    class StorageManager {

        constructor() {

            this.supported = this.checkSupport();
        }

        checkSupport() {

            try {

                const key = "__storage_test__";

                localStorage.setItem(key, key);

                localStorage.removeItem(key);

                return true;

            } catch (error) {

                console.error(
                    "LocalStorage unavailable",
                    error
                );

                return false;
            }
        }

        get(key, fallback = null) {

            if (!this.supported) {

                return fallback;
            }

            try {

                const value =
                    localStorage.getItem(key);

                if (value === null) {

                    return fallback;
                }

                return JSON.parse(value);

            } catch (error) {

                console.error(
                    "Storage read error",
                    error
                );

                return fallback;
            }
        }

        set(key, value) {

            if (!this.supported) {

                return false;
            }

            try {

                localStorage.setItem(
                    key,
                    JSON.stringify(value)
                );

                return true;

            } catch (error) {

                console.error(
                    "Storage write error",
                    error
                );

                return false;
            }
        }

        remove(key) {

            if (!this.supported) {

                return false;
            }

            try {

                localStorage.removeItem(key);

                return true;

            } catch (error) {

                console.error(
                    "Storage remove error",
                    error
                );

                return false;
            }
        }

        clear() {

            if (!this.supported) {

                return false;
            }

            try {

                localStorage.clear();

                return true;

            } catch (error) {

                console.error(
                    "Storage clear error",
                    error
                );

                return false;
            }
        }

        /* ==========================
           FAVORITES
        ========================== */

        getFavorites() {

            const favorites =
                this.get(
                    STORAGE_KEYS.FAVORITES,
                    []
                );

            return Array.isArray(favorites)
                ? favorites
                : [];
        }

        saveFavorites(favorites) {

            return this.set(
                STORAGE_KEYS.FAVORITES,
                favorites
            );
        }

        isFavorite(bookId) {

            return this
                .getFavorites()
                .includes(bookId);
        }

        addFavorite(bookId) {

            const favorites =
                this.getFavorites();

            if (
                !favorites.includes(bookId)
            ) {

                favorites.push(bookId);

                this.saveFavorites(
                    favorites
                );
            }

            return favorites;
        }

        removeFavorite(bookId) {

            const favorites =
                this.getFavorites()
                    .filter(
                        id =>
                            id !== bookId
                    );

            this.saveFavorites(
                favorites
            );

            return favorites;
        }

        toggleFavorite(bookId) {

            if (
                this.isFavorite(bookId)
            ) {

                this.removeFavorite(
                    bookId
                );

                return false;
            }

            this.addFavorite(
                bookId
            );

            return true;
        }

        /* ==========================
           RECENTS
        ========================== */

        getRecents() {

            const recents =
                this.get(
                    STORAGE_KEYS.RECENTS,
                    []
                );

            return Array.isArray(recents)
                ? recents
                : [];
        }

        saveRecents(recents) {

            return this.set(
                STORAGE_KEYS.RECENTS,
                recents
            );
        }

        addRecent(book) {

            const recents =
                this.getRecents();

            const filtered =
                recents.filter(
                    item =>
                        item.id !== book.id
                );

            filtered.unshift({
                ...book,
                openedAt:
                    Date.now()
            });

            const limited =
                filtered.slice(0, 30);

            this.saveRecents(
                limited
            );

            return limited;
        }

        removeRecent(bookId) {

            const recents =
                this.getRecents()
                    .filter(
                        item =>
                            item.id !==
                            bookId
                    );

            this.saveRecents(
                recents
            );

            return recents;
        }

        clearRecents() {

            this.saveRecents([]);
        }

        /* ==========================
           THEME
        ========================== */

        getTheme() {

            return this.get(
                STORAGE_KEYS.THEME,
                "light"
            );
        }

        setTheme(theme) {

            return this.set(
                STORAGE_KEYS.THEME,
                theme
            );
        }

        /* ==========================
           LAST CLASS
        ========================== */

        getLastClass() {

            return this.get(
                STORAGE_KEYS.LAST_CLASS,
                "all"
            );
        }

        setLastClass(className) {

            return this.set(
                STORAGE_KEYS.LAST_CLASS,
                className
            );
        }

        /* ==========================
           LAST VIEW
        ========================== */

        getLastView() {

            return this.get(
                STORAGE_KEYS.LAST_VIEW,
                "dashboard"
            );
        }

        setLastView(viewName) {

            return this.set(
                STORAGE_KEYS.LAST_VIEW,
                viewName
            );
        }

        /* ==========================
           EXPORT
        ========================== */

        exportData() {

            return {

                favorites:
                    this.getFavorites(),

                recents:
                    this.getRecents(),

                theme:
                    this.getTheme(),

                exportedAt:
                    new Date()
                        .toISOString()
            };
        }

        importData(data) {

            try {

                if (
                    data.favorites &&
                    Array.isArray(
                        data.favorites
                    )
                ) {

                    this.saveFavorites(
                        data.favorites
                    );
                }

                if (
                    data.recents &&
                    Array.isArray(
                        data.recents
                    )
                ) {

                    this.saveRecents(
                        data.recents
                    );
                }

                if (
                    data.theme
                ) {

                    this.setTheme(
                        data.theme
                    );
                }

                return true;

            } catch (error) {

                console.error(
                    "Import failed",
                    error
                );

                return false;
            }
        }

        /* ==========================
           STATS
        ========================== */

        getStats() {

            return {

                favorites:
                    this.getFavorites()
                        .length,

                recents:
                    this.getRecents()
                        .length,

                theme:
                    this.getTheme(),

                support:
                    this.supported
            };
        }
    }

    window.StorageManager =
        StorageManager;

    window.storage =
        new StorageManager();

})();