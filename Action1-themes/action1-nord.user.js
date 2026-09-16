// ==UserScript==
// @name         Action1 - Nord
// @namespace    https://paullopez.local/tampermonkey
// @version      1.0.0
// @description  Recolors the Action1 console to the Nord palette by overriding its CSS custom properties.
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
      --clr-bg-primary-1: #2e3440 !important;
      --clr-bg-primary-2: #2e3440 !important;
      --clr-bg-primary-3: #3b4252 !important;
      --clr-bg-primary-4: #3b4252 !important;
      --clr-bg-primary-5: #434c5e !important;
      --clr-bg-primary-6: rgba(59, 66, 82, 0.5) !important;
      --clr-bg-primary-7: #242933 !important;
      --clr-bg-primary-8: rgba(229, 233, 240, 0.06) !important;
      --clr-bg-scrollbar: #3b4252 !important;
      --clr-bg-scrollbar-thumb: #4c566a !important;
      --clr-bg-scrollbar-thumb-hover: #e5e9f0 !important;
      --clr-bg-table-row-active: #3b4252 !important;
      --clr-bg-table-row-focus: #434c5e !important;
      --clr-bg-btn-action-dropdown: #3b4252 !important;
      --clr-bg-btn-pagination: #3b4252 !important;
      --clr-bg-btn-pagination-selected: #81a1c1 !important;
      --clr-bg-btn-passive: #4c566a !important;
      --clr-bg-org-dropdown: #455364 !important;
      --clr-bg-org-dropdown-hover: #3a4453 !important;
      --as-modal-body-bg: #3b4252 !important;
      --as-modal-gray-field-bg: #434c5e !important;
      --as-modal-gray-input-bg: #2e3440 !important;
      --as-modal-gray-input-btn-bg: #3b4252 !important;
      --as-modal-header-bg: #3b4252 !important;
      --rgb-bg-chart: #2e3440 !important;
      --rgb-bg-chart-active: rgb(59, 66, 82) !important;
      --rgb-bg-primary-1: 229, 233, 240 !important;
      --toastify-color-dark: #2e3440 !important;
      --clr-border-primary-1: #434c5e !important;
      --clr-border-primary-2: #434c5e !important;
      --clr-border-primary-3: #4c566a !important;
      --clr-border-primary-4: #3b4252 !important;
      --clr-border-primary-5: #434c5e !important;
      --clr-border-primary-6: #434c5e !important;
      --clr-border-primary-7: rgba(76, 86, 106, 0.3) !important;
      --clr-border-primary-8: rgba(76, 86, 106, 0.3) !important;
      --clr-border-checkbox-or-radio-default: #4c566a !important;
      --clr-border-checkbox-or-radio-checked: #81a1c1 !important;
      --clr-border-checkbox-or-radio-tick: #81a1c1 !important;
      --rgb-chart-border-primary-1: 76, 86, 106 !important;
      --clr-text-primary-1: #d8dee9 !important;
      --clr-text-btn-pagination: #4c566a !important;
      --clr-aside-menu-item-icon_default: #d8dee9 !important;
      --clr-aside-menu-section-text: #e5e9f0 !important;
      --rgb-text-chart-primary-1: 216, 222, 233 !important;
      --brand: #81a1c1 !important;
      --a1-brand: #81a1c1 !important;
      --a1-brand_focus: #81a1c1 !important;
      --a1-brand_hover: #94afca !important;
      --a1-brand_active: #617991 !important;
      --clr-icon-primary-500: #81a1c1 !important;
      --clr-icon-primary-500-active: #617991 !important;
      --brand-solid: #81a1c1 !important;
      --a1-brand-solid: #81a1c1 !important;
      --primary: #81a1c1 !important;
      --info: #81a1c1 !important;
      --a1-brand-solid_hover: #94afca !important;
      --a1-brand-solid_active: #617991 !important;
      --a1-brand-solid_focus: #81a1c1 !important;
      --brand-solid_hover: #94afca !important;
      --brand-solid_active: #617991 !important;
      --brand-light: #455364 !important;
      --a1-brand-light: #455364 !important;
      --clr-status-primary-500: #455364 !important;
      --a1-brand-light_hover: #3a4453 !important;
      --a1-brand-light_active: #3f4a5a !important;
      --a1-brand-light_focus: #455364 !important;
      --clr-status-primary-500-active: #3f4a5a !important;
      --clr-status-default-500: #455364 !important;
      --clr-text-org-dropdown: #81a1c1 !important;
      --clr-text-org-dropdown-disabled: #4c566a !important;
      --success: #8fbcbb !important;
      --toastify-color-success: #a3be8c !important;
      --toastify-color-progress-success: #a3be8c !important;
      --toastify-icon-color-success: #a3be8c !important;
      --a1-green: #a3be8c !important;
      --a1-green_hover: #b1c89d !important;
      --a1-green_active: #7a8f69 !important;
      --a1-green_focus: #a3be8c !important;
      --clr-status-success-500: #a3be8c !important;
      --clr-status-success-500-hover: #b1c89d !important;
      --clr-status-success-500-active: #7a8f69 !important;
      --a1-green-light: #45504f !important;
      --a1-green-light_hover: #4f5b55 !important;
      --a1-green-light_active: #3c4549 !important;
      --a1-green-light_focus: #45504f !important;
      --clr-status-success-300: #45504f !important;
      --clr-status-success-300-hover: #4f5b55 !important;
      --clr-status-success-300-active: #3c4549 !important;
      --green: #a3be8c !important;
      --teal: #8fbcbb !important;
      --cyan: #8fbcbb !important;
      --danger: #bf616a !important;
      --a1-red: #bf616a !important;
      --a1-red_hover: #c97980 !important;
      --a1-red_active: #8f4950 !important;
      --a1-red_focus: #bf616a !important;
      --clr-status-error-500: #bf616a !important;
      --clr-status-error-500-hover: #c97980 !important;
      --clr-status-error-500-active: #8f4950 !important;
      --a1-red-light: #4b3d48 !important;
      --a1-red-light_hover: #57414c !important;
      --a1-red-light_active: #3f3945 !important;
      --a1-red-light_focus: #4b3d48 !important;
      --clr-status-error-300: #4b3d48 !important;
      --clr-status-error-300-hover: #57414c !important;
      --clr-status-error-300-active: #3f3945 !important;
      --red: #bf616a !important;
      --toastify-color-error: #bf616a !important;
      --toastify-color-progress-error: #bf616a !important;
      --toastify-icon-color-error: #bf616a !important;
      --warning: #ebcb8b !important;
      --yellow: #ebcb8b !important;
      --a1-yellow: #ebcb8b !important;
      --a1-yellow_hover: #eed39c !important;
      --a1-yellow_active: #b09868 !important;
      --a1-yellow_focus: #ebcb8b !important;
      --clr-status-warning-500: #ebcb8b !important;
      --clr-status-warning-500-hover: #eed39c !important;
      --clr-status-warning-500-active: #b09868 !important;
      --a1-yellow-light: #54524f !important;
      --a1-yellow-light_hover: #635e55 !important;
      --a1-yellow-light_active: #454649 !important;
      --a1-yellow-light_focus: #54524f !important;
      --clr-status-warning-300: #54524f !important;
      --clr-status-warning-300-hover: #635e55 !important;
      --clr-status-warning-300-active: #454649 !important;
      --orange: #d08770 !important;
      --toastify-color-warning: #ebcb8b !important;
      --toastify-color-progress-warning: #ebcb8b !important;
      --toastify-icon-color-warning: #ebcb8b !important;
      --pink: #b48ead !important;
      --purple: #b48ead !important;
      --indigo: #b48ead !important;
      --toastify-color-info: #81a1c1 !important;
      --toastify-color-progress-info: #81a1c1 !important;
      --toastify-icon-color-info: #81a1c1 !important;
      --scrollbar-color: #4c566a !important;
      --scrollbar-track-color: #3b4252 !important;
      --scrollbar-thumb-hover-color: #e5e9f0 !important;
      --gray: #4c566a !important;
      --gray-dark: #3b4252 !important;
      --dark: #3b4252 !important;
      --a1-white-foreground: #eceff4 !important;
      --a1-black-foreground: #eceff4 !important;
      --a1-blue-foreground: #eceff4 !important;
      --a1-brand-foreground: #eceff4 !important;
      --a1-brand-light-foreground: #eceff4 !important;
      --a1-brand-solid-foreground: #eceff4 !important;
      --a1-gray-foreground: #eceff4 !important;
      --a1-white-alt-foreground: #eceff4 !important;
      --a1-white-light-foreground: #eceff4 !important;
      --a1-green-light-foreground: #e5e9f0 !important;
      --a1-red-light-foreground: #e5e9f0 !important;
      --a1-yellow-light-foreground: #e5e9f0 !important;
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
