// ==UserScript==
// @name         Action1 - Tokyo Night
// @namespace    https://paullopez.local/tampermonkey
// @version      1.0.0
// @description  Recolors the Action1 console to the Tokyo Night palette by overriding its CSS custom properties.
// @author       Paul Lopez
// @match        https://*.action1.com/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  // The login page reuses the same CSS variable names (e.g. --a1-brand-solid) but as raw
  // HSL components consumed via hsl(var(--x)), while the authenticated app defines them as
  // hex strings consumed directly via var(--x). Our hex overrides are invalid CSS there
  // (hsl(#268bd2) doesn't parse) and break buttons/links, so skip the login route entirely.
  if (/\/login(\/|$)/.test(location.pathname)) {
    return;
  }

  const css = `
  html.dark[data-theme="Dark"], html.dark, :root {
      --clr-bg-primary-1: #1a1b26 !important;
      --clr-bg-primary-2: #1a1b26 !important;
      --clr-bg-primary-3: #24283b !important;
      --clr-bg-primary-4: #24283b !important;
      --clr-bg-primary-5: #2f334d !important;
      --clr-bg-primary-6: rgba(36, 40, 59, 0.5) !important;
      --clr-bg-primary-7: #13141f !important;
      --clr-bg-primary-8: rgba(192, 202, 245, 0.06) !important;
      --clr-bg-scrollbar: #24283b !important;
      --clr-bg-scrollbar-thumb: #565f89 !important;
      --clr-bg-scrollbar-thumb-hover: #c0caf5 !important;
      --clr-bg-table-row-active: #24283b !important;
      --clr-bg-table-row-focus: #2f334d !important;
      --clr-bg-btn-action-dropdown: #24283b !important;
      --clr-bg-btn-pagination: #24283b !important;
      --clr-bg-btn-pagination-selected: #7aa2f7 !important;
      --clr-bg-btn-passive: #565f89 !important;
      --clr-bg-org-dropdown: #354161 !important;
      --clr-bg-org-dropdown-hover: #282f45 !important;
      --as-modal-body-bg: #24283b !important;
      --as-modal-gray-field-bg: #2f334d !important;
      --as-modal-gray-input-bg: #1a1b26 !important;
      --as-modal-gray-input-btn-bg: #24283b !important;
      --as-modal-header-bg: #24283b !important;
      --rgb-bg-chart: #1a1b26 !important;
      --rgb-bg-chart-active: rgb(36, 40, 59) !important;
      --rgb-bg-primary-1: 192, 202, 245 !important;
      --toastify-color-dark: #1a1b26 !important;
      --clr-border-primary-1: #2f334d !important;
      --clr-border-primary-2: #2f334d !important;
      --clr-border-primary-3: #565f89 !important;
      --clr-border-primary-4: #24283b !important;
      --clr-border-primary-5: #2f334d !important;
      --clr-border-primary-6: #2f334d !important;
      --clr-border-primary-7: rgba(86, 95, 137, 0.3) !important;
      --clr-border-primary-8: rgba(86, 95, 137, 0.3) !important;
      --clr-border-checkbox-or-radio-default: #565f89 !important;
      --clr-border-checkbox-or-radio-checked: #7aa2f7 !important;
      --clr-border-checkbox-or-radio-tick: #7aa2f7 !important;
      --rgb-chart-border-primary-1: 86, 95, 137 !important;
      --clr-text-primary-1: #a9b1d6 !important;
      --clr-text-btn-pagination: #565f89 !important;
      --clr-aside-menu-item-icon_default: #a9b1d6 !important;
      --clr-aside-menu-section-text: #c0caf5 !important;
      --rgb-text-chart-primary-1: 169, 177, 214 !important;
      --brand: #7aa2f7 !important;
      --a1-brand: #7aa2f7 !important;
      --a1-brand_focus: #7aa2f7 !important;
      --a1-brand_hover: #8eb0f8 !important;
      --a1-brand_active: #5c7ab9 !important;
      --clr-icon-primary-500: #7aa2f7 !important;
      --clr-icon-primary-500-active: #5c7ab9 !important;
      --brand-solid: #7aa2f7 !important;
      --a1-brand-solid: #7aa2f7 !important;
      --primary: #7aa2f7 !important;
      --info: #7aa2f7 !important;
      --a1-brand-solid_hover: #8eb0f8 !important;
      --a1-brand-solid_active: #5c7ab9 !important;
      --a1-brand-solid_focus: #7aa2f7 !important;
      --brand-solid_hover: #8eb0f8 !important;
      --brand-solid_active: #5c7ab9 !important;
      --brand-light: #354161 !important;
      --a1-brand-light: #354161 !important;
      --clr-status-primary-500: #354161 !important;
      --a1-brand-light_hover: #282f45 !important;
      --a1-brand-light_active: #2d3650 !important;
      --a1-brand-light_focus: #354161 !important;
      --clr-status-primary-500-active: #2d3650 !important;
      --clr-status-default-500: #354161 !important;
      --clr-text-org-dropdown: #7aa2f7 !important;
      --clr-text-org-dropdown-disabled: #565f89 !important;
      --success: #7dcfff !important;
      --toastify-color-success: #9ece6a !important;
      --toastify-color-progress-success: #9ece6a !important;
      --toastify-icon-color-success: #9ece6a !important;
      --a1-green: #9ece6a !important;
      --a1-green_hover: #add580 !important;
      --a1-green_active: #779b50 !important;
      --a1-green_focus: #9ece6a !important;
      --clr-status-success-500: #9ece6a !important;
      --clr-status-success-500-hover: #add580 !important;
      --clr-status-success-500-active: #779b50 !important;
      --a1-green-light: #343f34 !important;
      --a1-green-light_hover: #3f4d39 !important;
      --a1-green-light_active: #2a302e !important;
      --a1-green-light_focus: #343f34 !important;
      --clr-status-success-300: #343f34 !important;
      --clr-status-success-300-hover: #3f4d39 !important;
      --clr-status-success-300-active: #2a302e !important;
      --green: #9ece6a !important;
      --teal: #7dcfff !important;
      --cyan: #7dcfff !important;
      --danger: #f7768e !important;
      --a1-red: #f7768e !important;
      --a1-red_hover: #f88b9f !important;
      --a1-red_active: #b9596b !important;
      --a1-red_focus: #f7768e !important;
      --clr-status-error-500: #f7768e !important;
      --clr-status-error-500-hover: #f88b9f !important;
      --clr-status-error-500-active: #b9596b !important;
      --a1-red-light: #462d3b !important;
      --a1-red-light_hover: #583443 !important;
      --a1-red-light_active: #352632 !important;
      --a1-red-light_focus: #462d3b !important;
      --clr-status-error-300: #462d3b !important;
      --clr-status-error-300-hover: #583443 !important;
      --clr-status-error-300-active: #352632 !important;
      --red: #f7768e !important;
      --toastify-color-error: #f7768e !important;
      --toastify-color-progress-error: #f7768e !important;
      --toastify-icon-color-error: #f7768e !important;
      --warning: #e0af68 !important;
      --yellow: #e0af68 !important;
      --a1-yellow: #e0af68 !important;
      --a1-yellow_hover: #e5bb7f !important;
      --a1-yellow_active: #a8834e !important;
      --a1-yellow_focus: #e0af68 !important;
      --clr-status-warning-500: #e0af68 !important;
      --clr-status-warning-500-hover: #e5bb7f !important;
      --clr-status-warning-500-active: #a8834e !important;
      --a1-yellow-light: #423933 !important;
      --a1-yellow-light_hover: #514438 !important;
      --a1-yellow-light_active: #322d2e !important;
      --a1-yellow-light_focus: #423933 !important;
      --clr-status-warning-300: #423933 !important;
      --clr-status-warning-300-hover: #514438 !important;
      --clr-status-warning-300-active: #322d2e !important;
      --orange: #ff9e64 !important;
      --toastify-color-warning: #e0af68 !important;
      --toastify-color-progress-warning: #e0af68 !important;
      --toastify-icon-color-warning: #e0af68 !important;
      --pink: #bb9af7 !important;
      --purple: #bb9af7 !important;
      --indigo: #bb9af7 !important;
      --toastify-color-info: #7aa2f7 !important;
      --toastify-color-progress-info: #7aa2f7 !important;
      --toastify-icon-color-info: #7aa2f7 !important;
      --scrollbar-color: #565f89 !important;
      --scrollbar-track-color: #24283b !important;
      --scrollbar-thumb-hover-color: #c0caf5 !important;
      --gray: #565f89 !important;
      --gray-dark: #24283b !important;
      --dark: #24283b !important;
      --a1-white-foreground: #c0caf5 !important;
      --a1-black-foreground: #c0caf5 !important;
      --a1-blue-foreground: #c0caf5 !important;
      --a1-brand-foreground: #c0caf5 !important;
      --a1-brand-light-foreground: #c0caf5 !important;
      --a1-brand-solid-foreground: #c0caf5 !important;
      --a1-gray-foreground: #c0caf5 !important;
      --a1-white-alt-foreground: #c0caf5 !important;
      --a1-white-light-foreground: #c0caf5 !important;
      --a1-green-light-foreground: #c0caf5 !important;
      --a1-red-light-foreground: #c0caf5 !important;
      --a1-yellow-light-foreground: #c0caf5 !important;
    }
  `;

  if (typeof GM_addStyle === 'function') {
    GM_addStyle(css);
  } else {
    const tag = document.createElement('style');
    tag.textContent = css;
    document.documentElement.appendChild(tag);
  }
})();
