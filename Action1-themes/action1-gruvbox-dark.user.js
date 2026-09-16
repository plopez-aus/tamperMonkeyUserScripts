// ==UserScript==
// @name         Action1 - Gruvbox Dark
// @namespace    https://paullopez.local/tampermonkey
// @version      1.0.0
// @description  Recolors the Action1 console to the Gruvbox Dark palette by overriding its CSS custom properties.
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
      --clr-bg-primary-1: #282828 !important;
      --clr-bg-primary-2: #282828 !important;
      --clr-bg-primary-3: #3c3836 !important;
      --clr-bg-primary-4: #3c3836 !important;
      --clr-bg-primary-5: #504945 !important;
      --clr-bg-primary-6: rgba(60, 56, 54, 0.5) !important;
      --clr-bg-primary-7: #1d2021 !important;
      --clr-bg-primary-8: rgba(251, 241, 199, 0.06) !important;
      --clr-bg-scrollbar: #3c3836 !important;
      --clr-bg-scrollbar-thumb: #a89984 !important;
      --clr-bg-scrollbar-thumb-hover: #fbf1c7 !important;
      --clr-bg-table-row-active: #3c3836 !important;
      --clr-bg-table-row-focus: #504945 !important;
      --clr-bg-btn-action-dropdown: #3c3836 !important;
      --clr-bg-btn-pagination: #3c3836 !important;
      --clr-bg-btn-pagination-selected: #458588 !important;
      --clr-bg-btn-passive: #a89984 !important;
      --clr-bg-org-dropdown: #304243 !important;
      --clr-bg-org-dropdown-hover: #2c3636 !important;
      --as-modal-body-bg: #3c3836 !important;
      --as-modal-gray-field-bg: #504945 !important;
      --as-modal-gray-input-bg: #282828 !important;
      --as-modal-gray-input-btn-bg: #3c3836 !important;
      --as-modal-header-bg: #3c3836 !important;
      --rgb-bg-chart: #282828 !important;
      --rgb-bg-chart-active: rgb(60, 56, 54) !important;
      --rgb-bg-primary-1: 251, 241, 199 !important;
      --toastify-color-dark: #282828 !important;
      --clr-border-primary-1: #504945 !important;
      --clr-border-primary-2: #504945 !important;
      --clr-border-primary-3: #a89984 !important;
      --clr-border-primary-4: #3c3836 !important;
      --clr-border-primary-5: #504945 !important;
      --clr-border-primary-6: #504945 !important;
      --clr-border-primary-7: rgba(168, 153, 132, 0.3) !important;
      --clr-border-primary-8: rgba(168, 153, 132, 0.3) !important;
      --clr-border-checkbox-or-radio-default: #a89984 !important;
      --clr-border-checkbox-or-radio-checked: #458588 !important;
      --clr-border-checkbox-or-radio-tick: #458588 !important;
      --rgb-chart-border-primary-1: 168, 153, 132 !important;
      --clr-text-primary-1: #ebdbb2 !important;
      --clr-text-btn-pagination: #a89984 !important;
      --clr-aside-menu-item-icon_default: #ebdbb2 !important;
      --clr-aside-menu-section-text: #fbf1c7 !important;
      --rgb-text-chart-primary-1: 235, 219, 178 !important;
      --brand: #458588 !important;
      --a1-brand: #458588 !important;
      --a1-brand_focus: #458588 !important;
      --a1-brand_hover: #61979a !important;
      --a1-brand_active: #346466 !important;
      --clr-icon-primary-500: #458588 !important;
      --clr-icon-primary-500-active: #346466 !important;
      --brand-solid: #458588 !important;
      --a1-brand-solid: #458588 !important;
      --primary: #458588 !important;
      --info: #458588 !important;
      --a1-brand-solid_hover: #61979a !important;
      --a1-brand-solid_active: #346466 !important;
      --a1-brand-solid_focus: #458588 !important;
      --brand-solid_hover: #61979a !important;
      --brand-solid_active: #346466 !important;
      --brand-light: #304243 !important;
      --a1-brand-light: #304243 !important;
      --clr-status-primary-500: #304243 !important;
      --a1-brand-light_hover: #2c3636 !important;
      --a1-brand-light_active: #2e3b3b !important;
      --a1-brand-light_focus: #304243 !important;
      --clr-status-primary-500-active: #2e3b3b !important;
      --clr-status-default-500: #304243 !important;
      --clr-text-org-dropdown: #458588 !important;
      --clr-text-org-dropdown-disabled: #a89984 !important;
      --success: #689d6a !important;
      --toastify-color-success: #98971a !important;
      --toastify-color-progress-success: #98971a !important;
      --toastify-icon-color-success: #98971a !important;
      --a1-green: #98971a !important;
      --a1-green_hover: #a7a73c !important;
      --a1-green_active: #727114 !important;
      --a1-green_focus: #98971a !important;
      --clr-status-success-500: #98971a !important;
      --clr-status-success-500-hover: #a7a73c !important;
      --clr-status-success-500-active: #727114 !important;
      --a1-green-light: #3e3e25 !important;
      --a1-green-light_hover: #474724 !important;
      --a1-green-light_active: #353526 !important;
      --a1-green-light_focus: #3e3e25 !important;
      --clr-status-success-300: #3e3e25 !important;
      --clr-status-success-300-hover: #474724 !important;
      --clr-status-success-300-active: #353526 !important;
      --green: #98971a !important;
      --teal: #689d6a !important;
      --cyan: #689d6a !important;
      --danger: #cc241d !important;
      --a1-red: #cc241d !important;
      --a1-red_hover: #d4453f !important;
      --a1-red_active: #991b16 !important;
      --a1-red_focus: #cc241d !important;
      --clr-status-error-500: #cc241d !important;
      --clr-status-error-500-hover: #d4453f !important;
      --clr-status-error-500-active: #991b16 !important;
      --a1-red-light: #492726 !important;
      --a1-red-light_hover: #562725 !important;
      --a1-red-light_active: #3c2827 !important;
      --a1-red-light_focus: #492726 !important;
      --clr-status-error-300: #492726 !important;
      --clr-status-error-300-hover: #562725 !important;
      --clr-status-error-300-active: #3c2827 !important;
      --red: #cc241d !important;
      --toastify-color-error: #cc241d !important;
      --toastify-color-progress-error: #cc241d !important;
      --toastify-icon-color-error: #cc241d !important;
      --warning: #d79921 !important;
      --yellow: #d79921 !important;
      --a1-yellow: #d79921 !important;
      --a1-yellow_hover: #dda842 !important;
      --a1-yellow_active: #a17319 !important;
      --a1-yellow_focus: #d79921 !important;
      --clr-status-warning-500: #d79921 !important;
      --clr-status-warning-500-hover: #dda842 !important;
      --clr-status-warning-500-active: #a17319 !important;
      --a1-yellow-light: #4b3f27 !important;
      --a1-yellow-light_hover: #594826 !important;
      --a1-yellow-light_active: #3d3627 !important;
      --a1-yellow-light_focus: #4b3f27 !important;
      --clr-status-warning-300: #4b3f27 !important;
      --clr-status-warning-300-hover: #594826 !important;
      --clr-status-warning-300-active: #3d3627 !important;
      --orange: #d65d0e !important;
      --toastify-color-warning: #d79921 !important;
      --toastify-color-progress-warning: #d79921 !important;
      --toastify-icon-color-warning: #d79921 !important;
      --pink: #b16286 !important;
      --purple: #b16286 !important;
      --indigo: #b16286 !important;
      --toastify-color-info: #458588 !important;
      --toastify-color-progress-info: #458588 !important;
      --toastify-icon-color-info: #458588 !important;
      --scrollbar-color: #a89984 !important;
      --scrollbar-track-color: #3c3836 !important;
      --scrollbar-thumb-hover-color: #fbf1c7 !important;
      --gray: #a89984 !important;
      --gray-dark: #3c3836 !important;
      --dark: #3c3836 !important;
      --a1-white-foreground: #fbf1c7 !important;
      --a1-black-foreground: #fbf1c7 !important;
      --a1-blue-foreground: #fbf1c7 !important;
      --a1-brand-foreground: #fbf1c7 !important;
      --a1-brand-light-foreground: #fbf1c7 !important;
      --a1-brand-solid-foreground: #fbf1c7 !important;
      --a1-gray-foreground: #fbf1c7 !important;
      --a1-white-alt-foreground: #fbf1c7 !important;
      --a1-white-light-foreground: #fbf1c7 !important;
      --a1-green-light-foreground: #ebdbb2 !important;
      --a1-red-light-foreground: #ebdbb2 !important;
      --a1-yellow-light-foreground: #ebdbb2 !important;
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
