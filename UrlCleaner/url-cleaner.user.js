// ==UserScript==
// @name         URL Cleaner
// @namespace    url-cleaner.local
// @version      1.0
// @description  Remove tracking parameters (utm_*, fbclid, gclid, etc.) and easily copy clean URLs
// @author       URL Cleaner Port
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/plopez-aus/tamperMonkeyUserScripts/main/UrlCleaner/url-cleaner.user.js
// @downloadURL  https://raw.githubusercontent.com/plopez-aus/tamperMonkeyUserScripts/main/UrlCleaner/url-cleaner.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Tracking parameters extracted from Chrome extension background.js
  const TRACKING_PARAMS = new Set([
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
    'utm_name',
    'fbclid',
    'gclid',
    'gclsrc',
    'dclid',
    'msclkid',
    'yclid',
    'mc_cid',
    'mc_eid',
    'igshid',
    '_ga',
    '_gl'
  ]);

  // Regex for utm_* prefix pattern used in extension rule filter
  const UTM_PREFIX_REGEX = /^utm_/i;

  function isTrackingParam(key) {
    return TRACKING_PARAMS.has(key.toLowerCase()) || UTM_PREFIX_REGEX.test(key);
  }

  // Strip tracking parameters from a URL object or string
  function cleanTrackingParams(urlStr) {
    try {
      const url = new URL(urlStr, window.location.href);
      let changed = false;

      const keysToRemove = [];
      for (const key of url.searchParams.keys()) {
        if (isTrackingParam(key)) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        url.searchParams.delete(key);
        changed = true;
      }

      return { cleanedUrl: url.toString(), changed };
    } catch {
      return { cleanedUrl: urlStr, changed: false };
    }
  }

  // Fully stripped URL (no query parameters, no hash) matching extension popup.js behavior
  function stripAllParams(urlStr) {
    try {
      const url = new URL(urlStr, window.location.href);
      url.search = '';
      url.hash = '';
      return url.toString();
    } catch {
      return urlStr;
    }
  }

  // 1. Clean current page URL on load without reloading
  function cleanCurrentPageUrl() {
    if (window.location.search) {
      const { cleanedUrl, changed } = cleanTrackingParams(window.location.href);
      if (changed) {
        window.history.replaceState(window.history.state, document.title, cleanedUrl);
      }
    }
  }

  // 2. Clean links on click before navigation
  function handleLinkClick(event) {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    const { cleanedUrl, changed } = cleanTrackingParams(anchor.href);
    if (changed) {
      anchor.href = cleanedUrl;
    }
  }

  // Execute immediate URL cleanup
  cleanCurrentPageUrl();

  // Attach click listener for in-page links
  document.addEventListener('click', handleLinkClick, { capture: true, passive: true });

  // 3. Tampermonkey Menu Commands (Extension Popup functionality)
  if (typeof GM_registerMenuCommand === 'function' && typeof GM_setClipboard === 'function') {
    // Copy URL stripped of tracking parameters
    GM_registerMenuCommand('Copy URL (without tracking)', () => {
      const { cleanedUrl } = cleanTrackingParams(window.location.href);
      GM_setClipboard(cleanedUrl, 'text');
    });

    // Copy Base URL completely stripped of query & hash (matches popup.js)
    GM_registerMenuCommand('Copy Base URL (no params/hash)', () => {
      const baseCleanUrl = stripAllParams(window.location.href);
      GM_setClipboard(baseCleanUrl, 'text');
    });
  }

  // 4. Keyboard Shortcut: Option/Alt + C to copy clean URL
  window.addEventListener('keydown', (e) => {
    if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyC') {
      const { cleanedUrl } = cleanTrackingParams(window.location.href);
      if (typeof GM_setClipboard === 'function') {
        GM_setClipboard(cleanedUrl, 'text');
      } else {
        navigator.clipboard.writeText(cleanedUrl);
      }
    }
  });
})();
