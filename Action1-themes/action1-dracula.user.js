// ==UserScript==
// @name         Action1 - Dracula
// @namespace    https://paullopez.local/tampermonkey
// @version      1.0.0
// @description  Recolors the Action1 console to the Dracula palette by overriding its CSS custom properties.
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
      --clr-bg-primary-1: #282a36 !important;
      --clr-bg-primary-2: #282a36 !important;
      --clr-bg-primary-3: #343746 !important;
      --clr-bg-primary-4: #343746 !important;
      --clr-bg-primary-5: #44475a !important;
      --clr-bg-primary-6: rgba(52, 55, 70, 0.5) !important;
      --clr-bg-primary-7: #1e1f29 !important;
      --clr-bg-primary-8: rgba(248, 248, 242, 0.06) !important;
      --clr-bg-scrollbar: #343746 !important;
      --clr-bg-scrollbar-thumb: #6272a4 !important;
      --clr-bg-scrollbar-thumb-hover: #f8f8f2 !important;
      --clr-bg-table-row-active: #343746 !important;
      --clr-bg-table-row-focus: #44475a !important;
      --clr-bg-btn-action-dropdown: #343746 !important;
      --clr-bg-btn-pagination: #343746 !important;
      --clr-bg-btn-pagination-selected: #bd93f9 !important;
      --clr-bg-btn-passive: #6272a4 !important;
      --clr-bg-org-dropdown: #52476d !important;
      --clr-bg-org-dropdown-hover: #3e3a53 !important;
      --as-modal-body-bg: #343746 !important;
      --as-modal-gray-field-bg: #44475a !important;
      --as-modal-gray-input-bg: #282a36 !important;
      --as-modal-gray-input-btn-bg: #343746 !important;
      --as-modal-header-bg: #343746 !important;
      --rgb-bg-chart: #282a36 !important;
      --rgb-bg-chart-active: rgb(52, 55, 70) !important;
      --rgb-bg-primary-1: 248, 248, 242 !important;
      --toastify-color-dark: #282a36 !important;
      --clr-border-primary-1: #44475a !important;
      --clr-border-primary-2: #44475a !important;
      --clr-border-primary-3: #6272a4 !important;
      --clr-border-primary-4: #343746 !important;
      --clr-border-primary-5: #44475a !important;
      --clr-border-primary-6: #44475a !important;
      --clr-border-primary-7: rgba(98, 114, 164, 0.3) !important;
      --clr-border-primary-8: rgba(98, 114, 164, 0.3) !important;
      --clr-border-checkbox-or-radio-default: #6272a4 !important;
      --clr-border-checkbox-or-radio-checked: #bd93f9 !important;
      --clr-border-checkbox-or-radio-tick: #bd93f9 !important;
      --rgb-chart-border-primary-1: 98, 114, 164 !important;
      --clr-text-primary-1: #f8f8f2 !important;
      --clr-text-btn-pagination: #6272a4 !important;
      --clr-aside-menu-item-icon_default: #f8f8f2 !important;
      --clr-aside-menu-section-text: #f8f8f2 !important;
      --rgb-text-chart-primary-1: 248, 248, 242 !important;
      --brand: #bd93f9 !important;
      --a1-brand: #bd93f9 !important;
      --a1-brand_focus: #bd93f9 !important;
      --a1-brand_hover: #c7a3fa !important;
      --a1-brand_active: #8e6ebb !important;
      --clr-icon-primary-500: #bd93f9 !important;
      --clr-icon-primary-500-active: #8e6ebb !important;
      --brand-solid: #bd93f9 !important;
      --a1-brand-solid: #bd93f9 !important;
      --primary: #bd93f9 !important;
      --info: #bd93f9 !important;
      --a1-brand-solid_hover: #c7a3fa !important;
      --a1-brand-solid_active: #8e6ebb !important;
      --a1-brand-solid_focus: #bd93f9 !important;
      --brand-solid_hover: #c7a3fa !important;
      --brand-solid_active: #8e6ebb !important;
      --brand-light: #52476d !important;
      --a1-brand-light: #52476d !important;
      --clr-status-primary-500: #52476d !important;
      --a1-brand-light_hover: #3e3a53 !important;
      --a1-brand-light_active: #463f5d !important;
      --a1-brand-light_focus: #52476d !important;
      --clr-status-primary-500-active: #463f5d !important;
      --clr-status-default-500: #52476d !important;
      --clr-text-org-dropdown: #bd93f9 !important;
      --clr-text-org-dropdown-disabled: #6272a4 !important;
      --success: #8be9fd !important;
      --toastify-color-success: #50fa7b !important;
      --toastify-color-progress-success: #50fa7b !important;
      --toastify-icon-color-success: #50fa7b !important;
      --a1-green: #50fa7b !important;
      --a1-green_hover: #6afb8f !important;
      --a1-green_active: #3cbc5c !important;
      --a1-green_focus: #50fa7b !important;
      --clr-status-success-500: #50fa7b !important;
      --clr-status-success-500-hover: #6afb8f !important;
      --clr-status-success-500-active: #3cbc5c !important;
      --a1-green-light: #305444 !important;
      --a1-green-light_hover: #336449 !important;
      --a1-green-light_active: #2d433e !important;
      --a1-green-light_focus: #305444 !important;
      --clr-status-success-300: #305444 !important;
      --clr-status-success-300-hover: #336449 !important;
      --clr-status-success-300-active: #2d433e !important;
      --green: #50fa7b !important;
      --teal: #8be9fd !important;
      --cyan: #8be9fd !important;
      --danger: #ff5555 !important;
      --a1-red: #ff5555 !important;
      --a1-red_hover: #ff6f6f !important;
      --a1-red_active: #bf4040 !important;
      --a1-red_focus: #ff5555 !important;
      --clr-status-error-500: #ff5555 !important;
      --clr-status-error-500-hover: #ff6f6f !important;
      --clr-status-error-500-active: #bf4040 !important;
      --a1-red-light: #53333c !important;
      --a1-red-light_hover: #64363f !important;
      --a1-red-light_active: #422f3a !important;
      --a1-red-light_focus: #53333c !important;
      --clr-status-error-300: #53333c !important;
      --clr-status-error-300-hover: #64363f !important;
      --clr-status-error-300-active: #422f3a !important;
      --red: #ff5555 !important;
      --toastify-color-error: #ff5555 !important;
      --toastify-color-progress-error: #ff5555 !important;
      --toastify-icon-color-error: #ff5555 !important;
      --warning: #f1fa8c !important;
      --yellow: #f1fa8c !important;
      --a1-yellow: #f1fa8c !important;
      --a1-yellow_hover: #f3fb9d !important;
      --a1-yellow_active: #b5bc69 !important;
      --a1-yellow_focus: #f1fa8c !important;
      --clr-status-warning-500: #f1fa8c !important;
      --clr-status-warning-500-hover: #f3fb9d !important;
      --clr-status-warning-500-active: #b5bc69 !important;
      --a1-yellow-light: #505447 !important;
      --a1-yellow-light_hover: #60644e !important;
      --a1-yellow-light_active: #404340 !important;
      --a1-yellow-light_focus: #505447 !important;
      --clr-status-warning-300: #505447 !important;
      --clr-status-warning-300-hover: #60644e !important;
      --clr-status-warning-300-active: #404340 !important;
      --orange: #ffb86c !important;
      --toastify-color-warning: #f1fa8c !important;
      --toastify-color-progress-warning: #f1fa8c !important;
      --toastify-icon-color-warning: #f1fa8c !important;
      --pink: #ff79c6 !important;
      --purple: #bd93f9 !important;
      --indigo: #bd93f9 !important;
      --toastify-color-info: #bd93f9 !important;
      --toastify-color-progress-info: #bd93f9 !important;
      --toastify-icon-color-info: #bd93f9 !important;
      --scrollbar-color: #6272a4 !important;
      --scrollbar-track-color: #343746 !important;
      --scrollbar-thumb-hover-color: #f8f8f2 !important;
      --gray: #6272a4 !important;
      --gray-dark: #343746 !important;
      --dark: #343746 !important;
      --a1-white-foreground: #f8f8f2 !important;
      --a1-black-foreground: #f8f8f2 !important;
      --a1-blue-foreground: #f8f8f2 !important;
      --a1-brand-foreground: #f8f8f2 !important;
      --a1-brand-light-foreground: #f8f8f2 !important;
      --a1-brand-solid-foreground: #f8f8f2 !important;
      --a1-gray-foreground: #f8f8f2 !important;
      --a1-white-alt-foreground: #f8f8f2 !important;
      --a1-white-light-foreground: #f8f8f2 !important;
      --a1-green-light-foreground: #f8f8f2 !important;
      --a1-red-light-foreground: #f8f8f2 !important;
      --a1-yellow-light-foreground: #f8f8f2 !important;
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
