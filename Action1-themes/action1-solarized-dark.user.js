// ==UserScript==
// @name         Action1 - Solarized Dark
// @namespace    https://paullopez.local/tampermonkey
// @version      1.0.0
// @description  Recolors the Action1 console to the Solarized Dark palette by overriding its CSS custom properties.
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
    /* core backgrounds */
    --clr-bg-primary-1: #002b36 !important;
    --clr-bg-primary-2: #002b36 !important;
    --clr-bg-primary-3: #073642 !important;
    --clr-bg-primary-4: #073642 !important;
    --clr-bg-primary-5: #0a4552 !important;
    --clr-bg-primary-6: rgba(7,54,66,0.5) !important;
    --clr-bg-primary-7: #001b22 !important;
    --clr-bg-primary-8: rgba(147,161,161,0.06) !important;
    --clr-bg-scrollbar: #073642 !important;
    --clr-bg-scrollbar-thumb: #586e75 !important;
    --clr-bg-scrollbar-thumb-hover: #93a1a1 !important;
    --clr-bg-table-row-active: #073642 !important;
    --clr-bg-table-row-focus: #0a4552 !important;
    --clr-bg-btn-action-dropdown: #073642 !important;
    --clr-bg-btn-pagination: #073642 !important;
    --clr-bg-btn-pagination-selected: #268bd2 !important;
    --clr-bg-btn-passive: #586e75 !important;
    --clr-bg-org-dropdown: #0d3d56 !important;
    --clr-bg-org-dropdown-hover: #052b3d !important;
    --as-modal-body-bg: #073642 !important;
    --as-modal-gray-field-bg: #0a4552 !important;
    --as-modal-gray-input-bg: #002b36 !important;
    --as-modal-gray-input-btn-bg: #073642 !important;
    --as-modal-header-bg: #073642 !important;
    --rgb-bg-chart: #002b36 !important;
    --rgb-bg-chart-active: rgb(7, 54, 66) !important;
    --rgb-bg-primary-1: 131, 148, 150 !important;
    --toastify-color-dark: #002b36 !important;

    /* borders */
    --clr-border-primary-1: #0a4552 !important;
    --clr-border-primary-2: #0a4552 !important;
    --clr-border-primary-3: #586e75 !important;
    --clr-border-primary-4: #073642 !important;
    --clr-border-primary-5: #0a4552 !important;
    --clr-border-primary-6: #0a4552 !important;
    --clr-border-primary-7: rgba(88,110,117,0.3) !important;
    --clr-border-primary-8: rgba(88,110,117,0.3) !important;
    --clr-border-checkbox-or-radio-default: #586e75 !important;
    --clr-border-checkbox-or-radio-checked: #268bd2 !important;
    --clr-border-checkbox-or-radio-tick: #268bd2 !important;
    --rgb-chart-border-primary-1: 88, 110, 117 !important;

    /* text */
    --clr-text-primary-1: #839496 !important;
    --clr-text-btn-pagination: #586e75 !important;
    --clr-aside-menu-item-icon_default: #839496 !important;
    --clr-aside-menu-section-text: #93a1a1 !important;
    --rgb-text-chart-primary-1: 131, 148, 150 !important;

    /* brand/accent -> solarized blue */
    --brand: #268bd2 !important;
    --a1-brand: #268bd2 !important;
    --a1-brand_focus: #268bd2 !important;
    --a1-brand_hover: #2f9fd8 !important;
    --a1-brand_active: #1e6a9c !important;
    --clr-icon-primary-500: #268bd2 !important;
    --clr-icon-primary-500-active: #1e6a9c !important;
    --brand-solid: #268bd2 !important;
    --a1-brand-solid: #268bd2 !important;
    --primary: #268bd2 !important;
    --info: #268bd2 !important;
    --a1-brand-solid_hover: #2f9fd8 !important;
    --a1-brand-solid_active: #1e6a9c !important;
    --a1-brand-solid_focus: #268bd2 !important;
    --brand-solid_hover: #2f9fd8 !important;
    --brand-solid_active: #1e6a9c !important;
    --brand-light: #0d3d56 !important;
    --a1-brand-light: #0d3d56 !important;
    --clr-status-primary-500: #0d3d56 !important;
    --a1-brand-light_hover: #052b3d !important;
    --a1-brand-light_active: #042330 !important;
    --a1-brand-light_focus: #0d3d56 !important;
    --clr-status-primary-500-active: #042330 !important;
    --clr-status-default-500: #0d3d56 !important;
    --clr-text-org-dropdown: #268bd2 !important;
    --clr-text-org-dropdown-disabled: #586e75 !important;

    /* green family -> solarized green/cyan */
    --success: #2aa198 !important;
    --toastify-color-success: #859900 !important;
    --toastify-color-progress-success: #859900 !important;
    --toastify-icon-color-success: #859900 !important;
    --a1-green: #859900 !important;
    --a1-green_hover: #98a900 !important;
    --a1-green_active: #6b7a00 !important;
    --a1-green_focus: #859900 !important;
    --clr-status-success-500: #859900 !important;
    --clr-status-success-500-hover: #98a900 !important;
    --clr-status-success-500-active: #6b7a00 !important;
    --a1-green-light: #253300 !important;
    --a1-green-light_hover: #2e3f00 !important;
    --a1-green-light_active: #1c2600 !important;
    --a1-green-light_focus: #253300 !important;
    --clr-status-success-300: #253300 !important;
    --clr-status-success-300-hover: #2e3f00 !important;
    --clr-status-success-300-active: #1c2600 !important;
    --green: #859900 !important;
    --teal: #2aa198 !important;
    --cyan: #2aa198 !important;

    /* red family */
    --danger: #dc322f !important;
    --a1-red: #dc322f !important;
    --a1-red_hover: #e5534d !important;
    --a1-red_active: #c92e2a !important;
    --a1-red_focus: #dc322f !important;
    --clr-status-error-500: #dc322f !important;
    --clr-status-error-500-hover: #e5534d !important;
    --clr-status-error-500-active: #c92e2a !important;
    --a1-red-light: #3a0d0b !important;
    --a1-red-light_hover: #451512 !important;
    --a1-red-light_active: #2c0a08 !important;
    --a1-red-light_focus: #3a0d0b !important;
    --clr-status-error-300: #3a0d0b !important;
    --clr-status-error-300-hover: #451512 !important;
    --clr-status-error-300-active: #2c0a08 !important;
    --red: #dc322f !important;
    --toastify-color-error: #dc322f !important;
    --toastify-color-progress-error: #dc322f !important;
    --toastify-icon-color-error: #dc322f !important;

    /* yellow/orange/warning family */
    --warning: #b58900 !important;
    --yellow: #b58900 !important;
    --a1-yellow: #b58900 !important;
    --a1-yellow_hover: #cb9b00 !important;
    --a1-yellow_active: #a67a00 !important;
    --a1-yellow_focus: #b58900 !important;
    --clr-status-warning-500: #b58900 !important;
    --clr-status-warning-500-hover: #cb9b00 !important;
    --clr-status-warning-500-active: #a67a00 !important;
    --a1-yellow-light: #4d3d00 !important;
    --a1-yellow-light_hover: #5c4900 !important;
    --a1-yellow-light_active: #3d3100 !important;
    --a1-yellow-light_focus: #4d3d00 !important;
    --clr-status-warning-300: #4d3d00 !important;
    --clr-status-warning-300-hover: #5c4900 !important;
    --clr-status-warning-300-active: #3d3100 !important;
    --orange: #cb4b16 !important;
    --toastify-color-warning: #b58900 !important;
    --toastify-color-progress-warning: #b58900 !important;
    --toastify-icon-color-warning: #b58900 !important;

    /* purple/pink/indigo */
    --pink: #d33682 !important;
    --purple: #6c71c4 !important;
    --indigo: #6c71c4 !important;

    /* info toast */
    --toastify-color-info: #268bd2 !important;
    --toastify-color-progress-info: #268bd2 !important;
    --toastify-icon-color-info: #268bd2 !important;

    /* scrollbar (non-clr vars) */
    --scrollbar-color: #586e75 !important;
    --scrollbar-track-color: #073642 !important;
    --scrollbar-thumb-hover-color: #93a1a1 !important;

    /* gray/dark */
    --gray: #586e75 !important;
    --gray-dark: #073642 !important;
    --dark: #073642 !important;

    /* foreground on colored badges/buttons -> solarized cream */
    --a1-white-foreground: #fdf6e3 !important;
    --a1-black-foreground: #fdf6e3 !important;
    --a1-blue-foreground: #fdf6e3 !important;
    --a1-brand-foreground: #fdf6e3 !important;
    --a1-brand-light-foreground: #fdf6e3 !important;
    --a1-brand-solid-foreground: #fdf6e3 !important;
    --a1-gray-foreground: #fdf6e3 !important;
    --a1-white-alt-foreground: #fdf6e3 !important;
    --a1-white-light-foreground: #fdf6e3 !important;
    --a1-green-light-foreground: #eee8d5 !important;
    --a1-red-light-foreground: #eee8d5 !important;
    --a1-yellow-light-foreground: #eee8d5 !important;
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
