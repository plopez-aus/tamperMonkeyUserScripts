// ==UserScript==
// @name         Action1 - Theme Switcher
// @namespace    https://paullopez.local/tampermonkey
// @version      1.0.0
// @description  Adds a floating theme switcher to the Action1 console (Solarized Dark, Nord, Dracula, Tokyo Night, Gruvbox Dark) by overriding its CSS custom properties.
// @author       Paul Lopez
// @match        https://*.action1.com/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'a1_theme_choice';
  const STYLE_ID = '__a1_theme_style__';

  // The login page defines the same CSS variable names (e.g. --a1-brand-solid) as raw
  // HSL components consumed via hsl(var(--x)), while the authenticated app defines them
  // as hex strings consumed directly via var(--x). Applying our hex overrides there
  // produces invalid CSS (hsl(#268bd2) is not a valid color) and breaks buttons/links.
  // Action1 is a multi-page app (login is a separate full page load, not client-routed),
  // so a simple path check at load time is enough to skip it entirely.
  if (/\/login(\/|$)/.test(location.pathname)) {
    return;
  }

  // ---------- color helpers ----------
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function rgbToHex(r, g, b) {
    const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${c(r)}${c(g)}${c(b)}`;
  }
  function shade(hex, percent) {
    const [r, g, b] = hexToRgb(hex);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent);
    return rgbToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
  }
  function mix(hexA, hexB, t) {
    const [ar, ag, ab] = hexToRgb(hexA);
    const [br, bg, bb] = hexToRgb(hexB);
    return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
  }
  function rgbStr(hex) {
    return hexToRgb(hex).join(', ');
  }
  function rgba(hex, alpha) {
    return `rgba(${rgbStr(hex)}, ${alpha})`;
  }

  // ---------- programmatic theme builder (used for Nord/Dracula/Tokyo Night/Gruvbox) ----------
  function buildVars(s) {
    const V = {};
    V['--clr-bg-primary-1'] = s.bg;
    V['--clr-bg-primary-2'] = s.bg;
    V['--clr-bg-primary-3'] = s.bgAlt;
    V['--clr-bg-primary-4'] = s.bgAlt;
    V['--clr-bg-primary-5'] = s.bgHover;
    V['--clr-bg-primary-6'] = rgba(s.bgAlt, 0.5);
    V['--clr-bg-primary-7'] = s.bgDeep;
    V['--clr-bg-primary-8'] = rgba(s.textBright, 0.06);
    V['--clr-bg-scrollbar'] = s.bgAlt;
    V['--clr-bg-scrollbar-thumb'] = s.textMuted;
    V['--clr-bg-scrollbar-thumb-hover'] = s.textBright;
    V['--clr-bg-table-row-active'] = s.bgAlt;
    V['--clr-bg-table-row-focus'] = s.bgHover;
    V['--clr-bg-btn-action-dropdown'] = s.bgAlt;
    V['--clr-bg-btn-pagination'] = s.bgAlt;
    V['--clr-bg-btn-pagination-selected'] = s.blue;
    V['--clr-bg-btn-passive'] = s.textMuted;

    const brandLight = mix(s.blue, s.bg, 0.72);
    const brandLightHover = mix(s.blue, s.bg, 0.85);
    const brandLightActive = mix(s.blue, s.bg, 0.80);
    V['--clr-bg-org-dropdown'] = brandLight;
    V['--clr-bg-org-dropdown-hover'] = brandLightHover;
    V['--as-modal-body-bg'] = s.bgAlt;
    V['--as-modal-gray-field-bg'] = s.bgHover;
    V['--as-modal-gray-input-bg'] = s.bg;
    V['--as-modal-gray-input-btn-bg'] = s.bgAlt;
    V['--as-modal-header-bg'] = s.bgAlt;
    V['--rgb-bg-chart'] = s.bg;
    V['--rgb-bg-chart-active'] = `rgb(${rgbStr(s.bgAlt)})`;
    V['--rgb-bg-primary-1'] = rgbStr(s.textBright);
    V['--toastify-color-dark'] = s.bg;

    V['--clr-border-primary-1'] = s.bgHover;
    V['--clr-border-primary-2'] = s.bgHover;
    V['--clr-border-primary-3'] = s.textMuted;
    V['--clr-border-primary-4'] = s.bgAlt;
    V['--clr-border-primary-5'] = s.bgHover;
    V['--clr-border-primary-6'] = s.bgHover;
    V['--clr-border-primary-7'] = rgba(s.textMuted, 0.3);
    V['--clr-border-primary-8'] = rgba(s.textMuted, 0.3);
    V['--clr-border-checkbox-or-radio-default'] = s.textMuted;
    V['--clr-border-checkbox-or-radio-checked'] = s.blue;
    V['--clr-border-checkbox-or-radio-tick'] = s.blue;
    V['--rgb-chart-border-primary-1'] = rgbStr(s.textMuted);

    V['--clr-text-primary-1'] = s.text;
    V['--clr-text-btn-pagination'] = s.textMuted;
    V['--clr-aside-menu-item-icon_default'] = s.text;
    V['--clr-aside-menu-section-text'] = s.textBright;
    V['--rgb-text-chart-primary-1'] = rgbStr(s.text);

    const blueHover = shade(s.blue, 0.15), blueActive = shade(s.blue, -0.25);
    V['--brand'] = s.blue; V['--a1-brand'] = s.blue; V['--a1-brand_focus'] = s.blue;
    V['--a1-brand_hover'] = blueHover; V['--a1-brand_active'] = blueActive;
    V['--clr-icon-primary-500'] = s.blue; V['--clr-icon-primary-500-active'] = blueActive;
    V['--brand-solid'] = s.blue; V['--a1-brand-solid'] = s.blue; V['--primary'] = s.blue; V['--info'] = s.blue;
    V['--a1-brand-solid_hover'] = blueHover; V['--a1-brand-solid_active'] = blueActive; V['--a1-brand-solid_focus'] = s.blue;
    V['--brand-solid_hover'] = blueHover; V['--brand-solid_active'] = blueActive;
    V['--brand-light'] = brandLight; V['--a1-brand-light'] = brandLight; V['--clr-status-primary-500'] = brandLight;
    V['--a1-brand-light_hover'] = brandLightHover; V['--a1-brand-light_active'] = brandLightActive; V['--a1-brand-light_focus'] = brandLight;
    V['--clr-status-primary-500-active'] = brandLightActive; V['--clr-status-default-500'] = brandLight;
    V['--clr-text-org-dropdown'] = s.blue; V['--clr-text-org-dropdown-disabled'] = s.textMuted;

    const greenHover = shade(s.green, 0.15), greenActive = shade(s.green, -0.25);
    const greenLight = mix(s.green, s.bg, 0.80), greenLightHover = mix(s.green, s.bg, 0.72), greenLightActive = mix(s.green, s.bg, 0.88);
    V['--success'] = s.cyan; V['--toastify-color-success'] = s.green; V['--toastify-color-progress-success'] = s.green; V['--toastify-icon-color-success'] = s.green;
    V['--a1-green'] = s.green; V['--a1-green_hover'] = greenHover; V['--a1-green_active'] = greenActive; V['--a1-green_focus'] = s.green;
    V['--clr-status-success-500'] = s.green; V['--clr-status-success-500-hover'] = greenHover; V['--clr-status-success-500-active'] = greenActive;
    V['--a1-green-light'] = greenLight; V['--a1-green-light_hover'] = greenLightHover; V['--a1-green-light_active'] = greenLightActive; V['--a1-green-light_focus'] = greenLight;
    V['--clr-status-success-300'] = greenLight; V['--clr-status-success-300-hover'] = greenLightHover; V['--clr-status-success-300-active'] = greenLightActive;
    V['--green'] = s.green; V['--teal'] = s.cyan; V['--cyan'] = s.cyan;

    const redHover = shade(s.red, 0.15), redActive = shade(s.red, -0.25);
    const redLight = mix(s.red, s.bg, 0.80), redLightHover = mix(s.red, s.bg, 0.72), redLightActive = mix(s.red, s.bg, 0.88);
    V['--danger'] = s.red; V['--a1-red'] = s.red; V['--a1-red_hover'] = redHover; V['--a1-red_active'] = redActive; V['--a1-red_focus'] = s.red;
    V['--clr-status-error-500'] = s.red; V['--clr-status-error-500-hover'] = redHover; V['--clr-status-error-500-active'] = redActive;
    V['--a1-red-light'] = redLight; V['--a1-red-light_hover'] = redLightHover; V['--a1-red-light_active'] = redLightActive; V['--a1-red-light_focus'] = redLight;
    V['--clr-status-error-300'] = redLight; V['--clr-status-error-300-hover'] = redLightHover; V['--clr-status-error-300-active'] = redLightActive;
    V['--red'] = s.red; V['--toastify-color-error'] = s.red; V['--toastify-color-progress-error'] = s.red; V['--toastify-icon-color-error'] = s.red;

    const yellowHover = shade(s.yellow, 0.15), yellowActive = shade(s.yellow, -0.25);
    const yellowLight = mix(s.yellow, s.bg, 0.80), yellowLightHover = mix(s.yellow, s.bg, 0.72), yellowLightActive = mix(s.yellow, s.bg, 0.88);
    V['--warning'] = s.yellow; V['--yellow'] = s.yellow; V['--a1-yellow'] = s.yellow; V['--a1-yellow_hover'] = yellowHover; V['--a1-yellow_active'] = yellowActive; V['--a1-yellow_focus'] = s.yellow;
    V['--clr-status-warning-500'] = s.yellow; V['--clr-status-warning-500-hover'] = yellowHover; V['--clr-status-warning-500-active'] = yellowActive;
    V['--a1-yellow-light'] = yellowLight; V['--a1-yellow-light_hover'] = yellowLightHover; V['--a1-yellow-light_active'] = yellowLightActive; V['--a1-yellow-light_focus'] = yellowLight;
    V['--clr-status-warning-300'] = yellowLight; V['--clr-status-warning-300-hover'] = yellowLightHover; V['--clr-status-warning-300-active'] = yellowLightActive;
    V['--orange'] = s.orange;
    V['--toastify-color-warning'] = s.yellow; V['--toastify-color-progress-warning'] = s.yellow; V['--toastify-icon-color-warning'] = s.yellow;

    V['--pink'] = s.magenta; V['--purple'] = s.violet; V['--indigo'] = s.violet;

    V['--toastify-color-info'] = s.blue; V['--toastify-color-progress-info'] = s.blue; V['--toastify-icon-color-info'] = s.blue;

    V['--scrollbar-color'] = s.textMuted; V['--scrollbar-track-color'] = s.bgAlt; V['--scrollbar-thumb-hover-color'] = s.textBright;

    V['--gray'] = s.textMuted; V['--gray-dark'] = s.bgAlt; V['--dark'] = s.bgAlt;

    V['--a1-white-foreground'] = s.fgOnAccent; V['--a1-black-foreground'] = s.fgOnAccent; V['--a1-blue-foreground'] = s.fgOnAccent;
    V['--a1-brand-foreground'] = s.fgOnAccent; V['--a1-brand-light-foreground'] = s.fgOnAccent; V['--a1-brand-solid-foreground'] = s.fgOnAccent;
    V['--a1-gray-foreground'] = s.fgOnAccent; V['--a1-white-alt-foreground'] = s.fgOnAccent; V['--a1-white-light-foreground'] = s.fgOnAccent;
    V['--a1-green-light-foreground'] = s.fgOnAccentAlt; V['--a1-red-light-foreground'] = s.fgOnAccentAlt; V['--a1-yellow-light-foreground'] = s.fgOnAccentAlt;

    return V;
  }

  function varsToCssBlock(vars) {
    const lines = Object.entries(vars).map(([k, v]) => `    ${k}: ${v} !important;`).join('\n');
    return `html.dark[data-theme="Dark"], html.dark, :root {\n${lines}\n  }`;
  }

  // ---------- theme definitions ----------
  const SOLARIZED_CSS = `
  html.dark[data-theme="Dark"], html.dark, :root {
    --clr-bg-primary-1: #002b36 !important; --clr-bg-primary-2: #002b36 !important; --clr-bg-primary-3: #073642 !important;
    --clr-bg-primary-4: #073642 !important; --clr-bg-primary-5: #0a4552 !important; --clr-bg-primary-6: rgba(7,54,66,0.5) !important;
    --clr-bg-primary-7: #001b22 !important; --clr-bg-primary-8: rgba(147,161,161,0.06) !important;
    --clr-bg-scrollbar: #073642 !important; --clr-bg-scrollbar-thumb: #586e75 !important; --clr-bg-scrollbar-thumb-hover: #93a1a1 !important;
    --clr-bg-table-row-active: #073642 !important; --clr-bg-table-row-focus: #0a4552 !important;
    --clr-bg-btn-action-dropdown: #073642 !important; --clr-bg-btn-pagination: #073642 !important; --clr-bg-btn-pagination-selected: #268bd2 !important;
    --clr-bg-btn-passive: #586e75 !important; --clr-bg-org-dropdown: #0d3d56 !important; --clr-bg-org-dropdown-hover: #052b3d !important;
    --as-modal-body-bg: #073642 !important; --as-modal-gray-field-bg: #0a4552 !important; --as-modal-gray-input-bg: #002b36 !important;
    --as-modal-gray-input-btn-bg: #073642 !important; --as-modal-header-bg: #073642 !important;
    --rgb-bg-chart: #002b36 !important; --rgb-bg-chart-active: rgb(7, 54, 66) !important; --rgb-bg-primary-1: 131, 148, 150 !important;
    --toastify-color-dark: #002b36 !important;
    --clr-border-primary-1: #0a4552 !important; --clr-border-primary-2: #0a4552 !important; --clr-border-primary-3: #586e75 !important;
    --clr-border-primary-4: #073642 !important; --clr-border-primary-5: #0a4552 !important; --clr-border-primary-6: #0a4552 !important;
    --clr-border-primary-7: rgba(88,110,117,0.3) !important; --clr-border-primary-8: rgba(88,110,117,0.3) !important;
    --clr-border-checkbox-or-radio-default: #586e75 !important; --clr-border-checkbox-or-radio-checked: #268bd2 !important;
    --clr-border-checkbox-or-radio-tick: #268bd2 !important; --rgb-chart-border-primary-1: 88, 110, 117 !important;
    --clr-text-primary-1: #839496 !important; --clr-text-btn-pagination: #586e75 !important;
    --clr-aside-menu-item-icon_default: #839496 !important; --clr-aside-menu-section-text: #93a1a1 !important;
    --rgb-text-chart-primary-1: 131, 148, 150 !important;
    --brand: #268bd2 !important; --a1-brand: #268bd2 !important; --a1-brand_focus: #268bd2 !important;
    --a1-brand_hover: #2f9fd8 !important; --a1-brand_active: #1e6a9c !important;
    --clr-icon-primary-500: #268bd2 !important; --clr-icon-primary-500-active: #1e6a9c !important;
    --brand-solid: #268bd2 !important; --a1-brand-solid: #268bd2 !important; --primary: #268bd2 !important; --info: #268bd2 !important;
    --a1-brand-solid_hover: #2f9fd8 !important; --a1-brand-solid_active: #1e6a9c !important; --a1-brand-solid_focus: #268bd2 !important;
    --brand-solid_hover: #2f9fd8 !important; --brand-solid_active: #1e6a9c !important;
    --brand-light: #0d3d56 !important; --a1-brand-light: #0d3d56 !important; --clr-status-primary-500: #0d3d56 !important;
    --a1-brand-light_hover: #052b3d !important; --a1-brand-light_active: #042330 !important; --a1-brand-light_focus: #0d3d56 !important;
    --clr-status-primary-500-active: #042330 !important; --clr-status-default-500: #0d3d56 !important;
    --clr-text-org-dropdown: #268bd2 !important; --clr-text-org-dropdown-disabled: #586e75 !important;
    --success: #2aa198 !important; --toastify-color-success: #859900 !important; --toastify-color-progress-success: #859900 !important;
    --toastify-icon-color-success: #859900 !important; --a1-green: #859900 !important; --a1-green_hover: #98a900 !important;
    --a1-green_active: #6b7a00 !important; --a1-green_focus: #859900 !important; --clr-status-success-500: #859900 !important;
    --clr-status-success-500-hover: #98a900 !important; --clr-status-success-500-active: #6b7a00 !important;
    --a1-green-light: #253300 !important; --a1-green-light_hover: #2e3f00 !important; --a1-green-light_active: #1c2600 !important;
    --a1-green-light_focus: #253300 !important; --clr-status-success-300: #253300 !important; --clr-status-success-300-hover: #2e3f00 !important;
    --clr-status-success-300-active: #1c2600 !important; --green: #859900 !important; --teal: #2aa198 !important; --cyan: #2aa198 !important;
    --danger: #dc322f !important; --a1-red: #dc322f !important; --a1-red_hover: #e5534d !important; --a1-red_active: #c92e2a !important;
    --a1-red_focus: #dc322f !important; --clr-status-error-500: #dc322f !important; --clr-status-error-500-hover: #e5534d !important;
    --clr-status-error-500-active: #c92e2a !important; --a1-red-light: #3a0d0b !important; --a1-red-light_hover: #451512 !important;
    --a1-red-light_active: #2c0a08 !important; --a1-red-light_focus: #3a0d0b !important; --clr-status-error-300: #3a0d0b !important;
    --clr-status-error-300-hover: #451512 !important; --clr-status-error-300-active: #2c0a08 !important; --red: #dc322f !important;
    --toastify-color-error: #dc322f !important; --toastify-color-progress-error: #dc322f !important; --toastify-icon-color-error: #dc322f !important;
    --warning: #b58900 !important; --yellow: #b58900 !important; --a1-yellow: #b58900 !important; --a1-yellow_hover: #cb9b00 !important;
    --a1-yellow_active: #a67a00 !important; --a1-yellow_focus: #b58900 !important; --clr-status-warning-500: #b58900 !important;
    --clr-status-warning-500-hover: #cb9b00 !important; --clr-status-warning-500-active: #a67a00 !important;
    --a1-yellow-light: #4d3d00 !important; --a1-yellow-light_hover: #5c4900 !important; --a1-yellow-light_active: #3d3100 !important;
    --a1-yellow-light_focus: #4d3d00 !important; --clr-status-warning-300: #4d3d00 !important; --clr-status-warning-300-hover: #5c4900 !important;
    --clr-status-warning-300-active: #3d3100 !important; --orange: #cb4b16 !important;
    --toastify-color-warning: #b58900 !important; --toastify-color-progress-warning: #b58900 !important; --toastify-icon-color-warning: #b58900 !important;
    --pink: #d33682 !important; --purple: #6c71c4 !important; --indigo: #6c71c4 !important;
    --toastify-color-info: #268bd2 !important; --toastify-color-progress-info: #268bd2 !important; --toastify-icon-color-info: #268bd2 !important;
    --scrollbar-color: #586e75 !important; --scrollbar-track-color: #073642 !important; --scrollbar-thumb-hover-color: #93a1a1 !important;
    --gray: #586e75 !important; --gray-dark: #073642 !important; --dark: #073642 !important;
    --a1-white-foreground: #fdf6e3 !important; --a1-black-foreground: #fdf6e3 !important; --a1-blue-foreground: #fdf6e3 !important;
    --a1-brand-foreground: #fdf6e3 !important; --a1-brand-light-foreground: #fdf6e3 !important; --a1-brand-solid-foreground: #fdf6e3 !important;
    --a1-gray-foreground: #fdf6e3 !important; --a1-white-alt-foreground: #fdf6e3 !important; --a1-white-light-foreground: #fdf6e3 !important;
    --a1-green-light-foreground: #eee8d5 !important; --a1-red-light-foreground: #eee8d5 !important; --a1-yellow-light-foreground: #eee8d5 !important;
  }`;

  const SPECS = {
    nord: {
      label: 'Nord', swatch: ['#2e3440', '#88c0d0', '#a3be8c'],
      bg: '#2e3440', bgAlt: '#3b4252', bgHover: '#434c5e', bgDeep: '#242933',
      text: '#d8dee9', textMuted: '#4c566a', textBright: '#e5e9f0',
      fgOnAccent: '#eceff4', fgOnAccentAlt: '#e5e9f0',
      blue: '#81a1c1', cyan: '#8fbcbb', green: '#a3be8c', red: '#bf616a',
      yellow: '#ebcb8b', orange: '#d08770', magenta: '#b48ead', violet: '#b48ead',
    },
    dracula: {
      label: 'Dracula', swatch: ['#282a36', '#bd93f9', '#50fa7b'],
      bg: '#282a36', bgAlt: '#343746', bgHover: '#44475a', bgDeep: '#1e1f29',
      text: '#f8f8f2', textMuted: '#6272a4', textBright: '#f8f8f2',
      fgOnAccent: '#f8f8f2', fgOnAccentAlt: '#f8f8f2',
      blue: '#bd93f9', cyan: '#8be9fd', green: '#50fa7b', red: '#ff5555',
      yellow: '#f1fa8c', orange: '#ffb86c', magenta: '#ff79c6', violet: '#bd93f9',
    },
    tokyoNight: {
      label: 'Tokyo Night', swatch: ['#1a1b26', '#7aa2f7', '#9ece6a'],
      bg: '#1a1b26', bgAlt: '#24283b', bgHover: '#2f334d', bgDeep: '#13141f',
      text: '#a9b1d6', textMuted: '#565f89', textBright: '#c0caf5',
      fgOnAccent: '#c0caf5', fgOnAccentAlt: '#c0caf5',
      blue: '#7aa2f7', cyan: '#7dcfff', green: '#9ece6a', red: '#f7768e',
      yellow: '#e0af68', orange: '#ff9e64', magenta: '#bb9af7', violet: '#bb9af7',
    },
    gruvbox: {
      label: 'Gruvbox Dark', swatch: ['#282828', '#458588', '#b8bb26'],
      bg: '#282828', bgAlt: '#3c3836', bgHover: '#504945', bgDeep: '#1d2021',
      text: '#ebdbb2', textMuted: '#a89984', textBright: '#fbf1c7',
      fgOnAccent: '#fbf1c7', fgOnAccentAlt: '#ebdbb2',
      blue: '#458588', cyan: '#689d6a', green: '#98971a', red: '#cc241d',
      yellow: '#d79921', orange: '#d65d0e', magenta: '#b16286', violet: '#b16286',
    },
  };

  const THEMES = {
    default: { label: 'Default (native)', css: '', swatch: ['#090a0b', '#5c9aff', '#0abb87'] },
    solarized: { label: 'Solarized Dark', css: SOLARIZED_CSS, swatch: ['#002b36', '#268bd2', '#859900'] },
    nord: { label: SPECS.nord.label, css: varsToCssBlock(buildVars(SPECS.nord)), swatch: SPECS.nord.swatch },
    dracula: { label: SPECS.dracula.label, css: varsToCssBlock(buildVars(SPECS.dracula)), swatch: SPECS.dracula.swatch },
    tokyoNight: { label: SPECS.tokyoNight.label, css: varsToCssBlock(buildVars(SPECS.tokyoNight)), swatch: SPECS.tokyoNight.swatch },
    gruvbox: { label: SPECS.gruvbox.label, css: varsToCssBlock(buildVars(SPECS.gruvbox)), swatch: SPECS.gruvbox.swatch },
  };

  // ---------- persistence ----------
  function loadChoice() {
    try {
      if (typeof GM_getValue === 'function') return GM_getValue(STORAGE_KEY, 'solarized');
    } catch (e) {}
    try { return localStorage.getItem(STORAGE_KEY) || 'solarized'; } catch (e) { return 'solarized'; }
  }
  function saveChoice(key) {
    try {
      if (typeof GM_setValue === 'function') { GM_setValue(STORAGE_KEY, key); return; }
    } catch (e) {}
    try { localStorage.setItem(STORAGE_KEY, key); } catch (e) {}
  }

  // ---------- apply ----------
  function applyTheme(key) {
    let tag = document.getElementById(STYLE_ID);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(tag);
    }
    tag.textContent = THEMES[key] ? THEMES[key].css : '';
  }

  applyTheme(loadChoice());

  // ---------- floating widget ----------
  function injectWidget() {
    if (document.getElementById('__a1_theme_fab__')) return;

    const wrap = document.createElement('div');
    wrap.id = '__a1_theme_fab__';
    wrap.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const btn = document.createElement('button');
    btn.textContent = '🎨';
    btn.title = 'Switch theme';
    btn.style.cssText = `
      width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15);
      background: #1b1b1d; color: #f7f7f7; font-size: 20px; cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
    `;

    const menu = document.createElement('div');
    menu.style.cssText = `
      display: none; position: absolute; bottom: 52px; right: 0; min-width: 190px;
      background: #1b1b1d; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5); overflow: hidden; padding: 4px;
    `;

    function renderMenu() {
      menu.innerHTML = '';
      const current = loadChoice();
      Object.entries(THEMES).forEach(([key, theme]) => {
        const item = document.createElement('div');
        item.style.cssText = `
          display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px;
          cursor: pointer; color: #f7f7f7; font-size: 13px;
          background: ${key === current ? 'rgba(255,255,255,0.08)' : 'transparent'};
        `;
        const swatchWrap = document.createElement('div');
        swatchWrap.style.cssText = 'display:flex; gap:2px;';
        theme.swatch.forEach((c) => {
          const dot = document.createElement('span');
          dot.style.cssText = `width:10px; height:10px; border-radius:50%; background:${c}; display:inline-block; border:1px solid rgba(255,255,255,0.2);`;
          swatchWrap.appendChild(dot);
        });
        const label = document.createElement('span');
        label.textContent = theme.label;
        item.appendChild(swatchWrap);
        item.appendChild(label);
        item.addEventListener('mouseenter', () => { item.style.background = 'rgba(255,255,255,0.12)'; });
        item.addEventListener('mouseleave', () => { item.style.background = key === loadChoice() ? 'rgba(255,255,255,0.08)' : 'transparent'; });
        item.addEventListener('click', () => {
          applyTheme(key);
          saveChoice(key);
          menu.style.display = 'none';
          renderMenu();
        });
        menu.appendChild(item);
      });
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display === 'block';
      if (!isOpen) renderMenu();
      menu.style.display = isOpen ? 'none' : 'block';
    });
    document.addEventListener('click', () => { menu.style.display = 'none'; });

    wrap.appendChild(menu);
    wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }
})();
