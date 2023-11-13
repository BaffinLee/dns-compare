/**
 * getUrlQuery
 * @param {string} name
 * @returns {string | null}
 */
export function getUrlQuery(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

/**
 * setUrlQuery
 * @param {string} name
 * @param {string} value
 */
export function setUrlQuery(name, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url.toString());
}
