// ==UserScript==
// @name         AfterDark
// @namespace    afterdark.local
// @version      1.0.1
// @description  Dark mode for every site: global On/Off/Auto default with selectable theme, plus an independent per-site override with the same options.
// @author       you
// @match        *://*/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @updateURL    https://raw.githubusercontent.com/plopez-aus/tamperMonkeyUserScripts/main/AfterDark/afterdark.user.js
// @downloadURL  https://raw.githubusercontent.com/plopez-aus/tamperMonkeyUserScripts/main/AfterDark/afterdark.user.js
// ==/UserScript==

(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Storage keys / helpers
  // ---------------------------------------------------------------------
  const KEY_DEFAULT = 'afterdark:defaultMode';   // 'on' | 'off' | 'auto'
  const KEY_THEME = 'afterdark:defaultTheme';    // one of THEME_KEYS
  const KEY_SITES = 'afterdark:sites';           // JSON: { hostname: { mode, theme } }
  const KEY_COLORIZE = 'afterdark:colorizeMedia'; // 'true' | 'false', defaults to 'false'
  const KEY_INTENSITY = 'afterdark:intensity';     // 0-100, defaults to 100
  const KEY_GRAYSCALE = 'afterdark:grayscale';     // 0-100, defaults to 0
  const KEY_SEPIA_EXTRA = 'afterdark:sepiaExtra';  // 0-100, defaults to 0

  const MODES = ['on', 'off', 'auto'];
  const SITE_MODES = ['default', 'on', 'off', 'auto'];

  // Each preset is a full CSS filter value, built on the same invert+
  // hue-rotate base (so media re-inversion below still cancels it out)
  // with extra adjustments layered on for a different visual mood. The
  // named palettes (Dracula/Nord/Gruvbox/Solarized/Tokyo Night) are
  // filter-tinted *approximations* of those color schemes, not literal
  // hex reproductions -- unlike a site-specific userstyle that overrides
  // known CSS variables with exact colors, a universal filter has no
  // idea what variables any given site uses, so it can only nudge hue/
  // saturation/warmth toward each palette's signature accent color.
  const THEME_CONFIGS = {
    standard:   { contrast: 0.82, brightness: 0.95, sepia: 0,    hue: 0,   sat: 1.0 },
    dimmed:     { contrast: 0.76, brightness: 0.88, sepia: 0,    hue: 0,   sat: 0.95 },
    sepia:      { contrast: 0.80, brightness: 0.95, sepia: 0.35, hue: 0,   sat: 1.0 },
    contrast:   { contrast: 1.05, brightness: 0.98, sepia: 0,    hue: 0,   sat: 1.0 },
    dracula:    { contrast: 0.80, brightness: 0.95, sepia: 0.40, hue: 220, sat: 1.4 },
    nord:       { contrast: 0.80, brightness: 0.95, sepia: 0.30, hue: 190, sat: 0.85 },
    gruvbox:    { contrast: 0.80, brightness: 0.95, sepia: 0.50, hue: 0,   sat: 1.15 },
    solarized:  { contrast: 0.78, brightness: 0.92, sepia: 0.35, hue: 150, sat: 1.1 },
    tokyoNight: { contrast: 0.80, brightness: 0.92, sepia: 0.45, hue: 230, sat: 1.3 },
  };
  const THEMES = THEME_CONFIGS;
  const THEME_LABELS = {
    standard: 'Standard',
    dimmed: 'Dimmed',
    sepia: 'Sepia',
    contrast: 'Contrast',
    dracula: 'Dracula',
    nord: 'Nord',
    gruvbox: 'Gruvbox Dark',
    solarized: 'Solarized Dark',
    tokyoNight: 'Tokyo Night',
  };
  const THEME_KEYS = Object.keys(THEMES);
  const SITE_THEME_KEYS = ['default', ...THEME_KEYS];

  // ---------------------------------------------------------------------
  // Settings & Storage
  // ---------------------------------------------------------------------
  function getDefaultMode() {
    const v = GM_getValue(KEY_DEFAULT, 'auto');
    return MODES.includes(v) ? v : 'auto';
  }

  function setDefaultMode(mode) {
    GM_setValue(KEY_DEFAULT, mode);
  }

  function getDefaultTheme() {
    const v = GM_getValue(KEY_THEME, 'standard');
    return THEME_KEYS.includes(v) ? v : 'standard';
  }

  function setDefaultTheme(theme) {
    GM_setValue(KEY_THEME, theme);
  }

  function getColorizeMedia() {
    return GM_getValue(KEY_COLORIZE, 'false') === 'true';
  }

  function setColorizeMedia(value) {
    GM_setValue(KEY_COLORIZE, value ? 'true' : 'false');
  }

  function clampPercent(v, fallback) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
  }

  function getIntensity() {
    return clampPercent(GM_getValue(KEY_INTENSITY, '100'), 100);
  }

  function setIntensity(value) {
    GM_setValue(KEY_INTENSITY, String(clampPercent(value, 100)));
  }

  function getGrayscale() {
    return clampPercent(GM_getValue(KEY_GRAYSCALE, '0'), 0);
  }

  function setGrayscale(value) {
    GM_setValue(KEY_GRAYSCALE, String(clampPercent(value, 0)));
  }

  function getExtraSepia() {
    return clampPercent(GM_getValue(KEY_SEPIA_EXTRA, '0'), 0);
  }

  function setExtraSepia(value) {
    GM_setValue(KEY_SEPIA_EXTRA, String(clampPercent(value, 0)));
  }

  function getSites() {
    try {
      const parsed = JSON.parse(GM_getValue(KEY_SITES, '{}')) || {};
      // Normalize: older versions stored a bare mode string per host
      // instead of { mode, theme }.
      Object.keys(parsed).forEach((host) => {
        if (typeof parsed[host] === 'string') {
          parsed[host] = { mode: parsed[host], theme: 'default' };
        }
      });
      return parsed;
    } catch (e) {
      return {};
    }
  }

  function getSiteEntry(host) {
    const entry = getSites()[host];
    return {
      mode: entry && SITE_MODES.includes(entry.mode) ? entry.mode : 'default',
      theme: entry && SITE_THEME_KEYS.includes(entry.theme) ? entry.theme : 'default',
    };
  }

  function getSiteMode(host) {
    return getSiteEntry(host).mode;
  }

  function getSiteTheme(host) {
    return getSiteEntry(host).theme;
  }

  function setSiteEntry(host, patch) {
    const sites = getSites();
    const next = { ...getSiteEntry(host), ...patch };
    if (next.mode === 'default' && next.theme === 'default') {
      delete sites[host];
    } else {
      sites[host] = next;
    }
    GM_setValue(KEY_SITES, JSON.stringify(sites));
  }

  function setSiteMode(host, mode) {
    setSiteEntry(host, { mode });
  }

  function setSiteTheme(host, theme) {
    setSiteEntry(host, { theme });
  }

  function getHost() {
    try {
      // Treat the top document's host as "the site", even from inside an iframe.
      return window.top.location.hostname || location.hostname;
    } catch (e) {
      // Cross-origin iframe: fall back to our own frame's host.
      return location.hostname;
    }
  }

  // Referenced by updateWidget(), which applyTheme() calls immediately
  // below — must be declared before that first call or it's a TDZ error.
  let widgetRefs = null;

  // ---------------------------------------------------------------------
  // Effective theme computation
  // ---------------------------------------------------------------------
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function systemPrefersDark() {
    return !!(media && media.matches);
  }

  function computeEnabled() {
    if (getIntensity() === 0) return false;
    const site = getSiteMode(getHost());
    const mode = site === 'default' ? getDefaultMode() : site;
    if (mode === 'on') return true;
    if (mode === 'off') return false;
    return systemPrefersDark();
  }

  function computeThemeKey() {
    const site = getSiteTheme(getHost());
    return site === 'default' ? getDefaultTheme() : site;
  }

  // ---------------------------------------------------------------------
  // CSS injection (invert + hue-rotate technique; re-invert media so
  // images/video/canvas keep their natural colors)
  // ---------------------------------------------------------------------
  const CSS = `
html.afterdark-enabled {
  filter: var(--afterdark-filter, invert(1) hue-rotate(180deg)) !important;
  background: #fff !important;
  /* Deliberately NOT setting color-scheme: dark here: it makes the
     browser's own automatic-dark-mode heuristic repaint default black
     text as white before our filter runs, and our invert() then flips
     that white back to black -- landing black text on an (also inverted)
     black background, i.e. invisible. Leaving color-scheme alone keeps
     text at its normal authored color, which invert() then correctly
     flips to white. */
}
html.afterdark-enabled img,
html.afterdark-enabled video,
html.afterdark-enabled canvas,
html.afterdark-enabled embed,
html.afterdark-enabled object,
html.afterdark-enabled svg image {
  /* Use CSS shorthand filter via custom property: fully hardware-accelerated
     across all browsers and immune to Chrome's GPU compositor bug where
     SVG reference filters (filter: url(#...)) are silently dropped on <video>
     elements, leaving them as photo negatives. */
  filter: var(--afterdark-media-filter, invert(1) hue-rotate(180deg)) !important;
}
/* Only counter-invert the widget when it couldn't be promoted to the
   top layer (no Popover API support) and is therefore still visually
   affected by the ancestor filter above. */
html.afterdark-enabled .afterdark-widget-host.afterdark-no-popover {
  filter: var(--afterdark-media-filter, invert(1) hue-rotate(180deg)) !important;
}
`;

  function injectStyle() {
    const style = document.createElement('style');
    style.id = 'afterdark-style';
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  // Inject as early as possible; documentElement always exists at document-start.
  if (document.documentElement) {
    injectStyle();
  } else {
    new MutationObserver((_, obs) => {
      if (document.documentElement) {
        injectStyle();
        obs.disconnect();
      }
    }).observe(document, { childList: true, subtree: true });
  }

  function buildThemeFilter(themeKey, intensityFraction, grayscaleAmt, sepiaAmt) {
    const cfg = THEME_CONFIGS[themeKey] || THEME_CONFIGS.standard;
    const p = Math.max(0.01, intensityFraction);

    // Intensity controls theme depth and darkness without flattening contrast:
    // Brightness gently lifts at lower intensity for a softer dark mode;
    // Contrast is preserved so text is crisp and readable, never flat gray.
    const b_val = (cfg.brightness + (1.0 - p) * 0.20).toFixed(2);
    const c_val = (cfg.contrast * (0.95 + 0.05 * p)).toFixed(2);
    const s_val = (cfg.sepia * p).toFixed(2);
    const h_val = cfg.hue;
    const sat_val = (1.0 + (cfg.sat - 1.0) * p).toFixed(2);

    const parts = ['invert(1)', 'hue-rotate(180deg)'];
    parts.push(`contrast(${c_val})`);
    if (parseFloat(s_val) > 0.01) parts.push(`sepia(${s_val})`);
    if (h_val !== 0) parts.push(`hue-rotate(${h_val}deg)`);
    if (Math.abs(parseFloat(sat_val) - 1.0) > 0.01) parts.push(`saturate(${sat_val})`);
    parts.push(`brightness(${b_val})`);

    // Sepia slider (0-100%): scales to max 0.60 so 100% is a warm, comfortable amber
    // reading tone (cutting blue light) without turning the page into unreadable brown mud.
    const extraSepiaScaled = ((sepiaAmt / 100) * 0.60).toFixed(2);
    if (parseFloat(extraSepiaScaled) > 0.01) parts.push(`sepia(${extraSepiaScaled})`);

    // Grayscale slider (0-100%): smoothly desaturates the page, reaching clean monochrome at 100%.
    if (grayscaleAmt > 0) parts.push(`grayscale(${grayscaleAmt}%)`);

    return parts.join(' ');
  }

  function applyTheme() {
    const enabled = computeEnabled();
    document.documentElement.classList.toggle('afterdark-enabled', enabled);

    if (!enabled) {
      document.documentElement.style.removeProperty('--afterdark-filter');
      document.documentElement.style.removeProperty('--afterdark-media-filter');
      updateWidget();
      return;
    }

    const themeKey = computeThemeKey();
    const intensityFraction = getIntensity() / 100;
    const grayscaleAmt = getGrayscale();
    const sepiaAmt = getExtraSepia();

    const finalFilter = buildThemeFilter(themeKey, intensityFraction, grayscaleAmt, sepiaAmt);
    document.documentElement.style.setProperty('--afterdark-filter', finalFilter);

    // Compute media counter-filter in native CSS shorthand:
    // This is 100% hardware accelerated across all browsers (Chrome, Safari, Firefox)
    // and eliminates the Chrome GPU compositor bug where SVG reference filters
    // (filter: url(#...)) are silently dropped on <video> elements, leaving them as photo negatives!
    const cfg = THEME_CONFIGS[themeKey] || THEME_CONFIGS.standard;
    const p = Math.max(0.01, intensityFraction);
    const b_val = (cfg.brightness + (1.0 - p) * 0.20).toFixed(2);
    const c_val = (cfg.contrast * (0.95 + 0.05 * p)).toFixed(2);
    const h_val = cfg.hue;
    const sat_val = (1.0 + (cfg.sat - 1.0) * p).toFixed(2);

    let mediaFilter;
    if (getColorizeMedia()) {
      // Colourise media: only invert the base dark flip so media subtly picks up
      // the theme, warmth, and grayscale like the rest of the page.
      mediaFilter = 'invert(1) hue-rotate(180deg)';
    } else {
      // Keep media in natural colors: exact inverse of the base flip and theme adjustments.
      const inv_b = (1.0 / parseFloat(b_val)).toFixed(3);
      const inv_c = (1.0 / parseFloat(c_val)).toFixed(3);
      const parts = [`brightness(${inv_b})`];
      if (Math.abs(parseFloat(sat_val) - 1.0) > 0.01) {
        const inv_sat = (1.0 / parseFloat(sat_val)).toFixed(3);
        parts.push(`saturate(${inv_sat})`);
      }
      if (h_val !== 0) {
        parts.push(`hue-rotate(${-h_val}deg)`);
      }
      parts.push(`contrast(${inv_c})`, 'hue-rotate(180deg)', 'invert(1)');
      mediaFilter = parts.join(' ');
    }
    document.documentElement.style.setProperty('--afterdark-media-filter', mediaFilter);

    updateWidget();
  }

  // Apply immediately and again once the DOM is ready (in case class got
  // reset or something upstream touched documentElement).
  applyTheme();
  document.addEventListener('DOMContentLoaded', applyTheme);

  // React to system theme changes while in "auto".
  if (media) {
    const onChange = () => applyTheme();
    if (media.addEventListener) media.addEventListener('change', onChange);
    else if (media.addListener) media.addListener(onChange);
  }

  // React to settings changed in another tab.
  if (typeof GM_addValueChangeListener === 'function') {
    GM_addValueChangeListener(KEY_DEFAULT, () => applyTheme());
    GM_addValueChangeListener(KEY_THEME, () => applyTheme());
    GM_addValueChangeListener(KEY_SITES, () => applyTheme());
    GM_addValueChangeListener(KEY_COLORIZE, () => applyTheme());
    GM_addValueChangeListener(KEY_INTENSITY, () => applyTheme());
    GM_addValueChangeListener(KEY_GRAYSCALE, () => applyTheme());
    GM_addValueChangeListener(KEY_SEPIA_EXTRA, () => applyTheme());
  }

  // ---------------------------------------------------------------------
  // Tampermonkey menu commands (quick cycle, no UI needed)
  // ---------------------------------------------------------------------
  function cycle(list, current) {
    return list[(list.indexOf(current) + 1) % list.length];
  }

  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('AfterDark: cycle default (' + getDefaultMode() + ')', () => {
      setDefaultMode(cycle(MODES, getDefaultMode()));
      applyTheme();
    });
    GM_registerMenuCommand('AfterDark: cycle this site (' + getSiteMode(getHost()) + ')', () => {
      setSiteMode(getHost(), cycle(SITE_MODES, getSiteMode(getHost())));
      applyTheme();
    });
    GM_registerMenuCommand('AfterDark: cycle default theme (' + getDefaultTheme() + ')', () => {
      setDefaultTheme(cycle(THEME_KEYS, getDefaultTheme()));
      applyTheme();
    });
    GM_registerMenuCommand('AfterDark: cycle this site theme (' + getSiteTheme(getHost()) + ')', () => {
      setSiteTheme(getHost(), cycle(SITE_THEME_KEYS, getSiteTheme(getHost())));
      applyTheme();
    });
    GM_registerMenuCommand(
      'AfterDark: colourise media (' + (getColorizeMedia() ? 'on' : 'off') + ')',
      () => {
        setColorizeMedia(!getColorizeMedia());
        applyTheme();
      }
    );
  }

  // ---------------------------------------------------------------------
  // Floating widget (top frame only)
  // ---------------------------------------------------------------------
  function buildWidget() {
    if (window.self !== window.top) return; // only show in the top document
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', buildWidget, { once: true });
      return;
    }

    const host = document.createElement('div');
    host.className = 'afterdark-widget-host';
    // Use the Popover API's top layer so the widget is immune to any
    // ancestor `filter` (our own dark-mode filter on <html> included) —
    // a CSS filter on an ancestor otherwise turns it into the containing
    // block for position:fixed descendants, which would anchor the
    // widget to the bottom of the whole scrollable page instead of the
    // viewport. Top-layer elements escape that entirely.
    const supportsPopover = typeof host.showPopover === 'function';
    if (supportsPopover) {
      host.setAttribute('popover', 'manual');
    } else {
      host.classList.add('afterdark-no-popover');
    }
    host.style.cssText =
      'position:fixed !important;top:50% !important;right:0 !important;' +
      'bottom:auto !important;left:auto !important;inset:50% 0 auto auto !important;' +
      'transform:translateY(-50%) !important;' +
      'margin:0 !important;padding:0 !important;border:none !important;' +
      'background:transparent !important;z-index:2147483647 !important;';
    const shadow = host.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .btn {
          width: 26px; height: 88px; border: none;
          border-radius: 10px 0 0 10px;
          background: #24272b; color: #f2c94c; font-size: 16px; cursor: pointer;
          box-shadow: -2px 2px 8px rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center;
        }
        .panel {
          display: none; position: absolute; top: 50%; right: 100%;
          transform: translateY(-50%); margin-right: 8px;
          width: 220px; background: #1f2226; color: #eee; border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0,0,0,.4); padding: 12px; font-size: 12px;
        }
        .panel.open { display: block; }
        .row { margin-bottom: 10px; }
        .row:last-child { margin-bottom: 0; }
        .label { opacity: .7; margin-bottom: 6px; text-transform: uppercase; font-size: 10px; letter-spacing: .04em; }
        .seg { display: flex; border-radius: 6px; overflow: hidden; border: 1px solid #3a3f45; }
        .seg button {
          flex: 1; background: #2a2e33; color: #ccc; border: none; padding: 6px 4px;
          cursor: pointer; font-size: 11px; border-left: 1px solid #3a3f45;
        }
        .seg button:first-child { border-left: none; }
        .seg button.active { background: #f2c94c; color: #1f2226; font-weight: 600; }
        select {
          width: 100%; background: #2a2e33; color: #eee; border: 1px solid #3a3f45;
          border-radius: 6px; padding: 5px 4px; font-size: 11px; margin-top: 6px;
        }
        .site { opacity: .6; font-size: 10px; margin-top: 6px; word-break: break-all; }
        .checkbox-row { display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; }
        .checkbox-row input { margin: 0; }
        .slider-label { display: flex; justify-content: space-between; }
        .slider-label span:last-child { opacity: .6; }
        input[type="range"] {
          width: 100%; margin: 4px 0 0; accent-color: #f2c94c;
        }
      </style>
      <button class="btn" title="AfterDark">\u{1F311}</button>
      <div class="panel">
        <div class="row">
          <div class="label">Default</div>
          <div class="seg" data-group="default">
            <button data-val="on">On</button>
            <button data-val="off">Off</button>
            <button data-val="auto">Auto</button>
          </div>
          <select data-theme-group="default"></select>
        </div>
        <div class="row">
          <div class="label">This site</div>
          <div class="seg" data-group="site">
            <button data-val="default">Default</button>
            <button data-val="on">On</button>
            <button data-val="off">Off</button>
            <button data-val="auto">Auto</button>
          </div>
          <select data-theme-group="site"></select>
          <div class="site"></div>
        </div>
        <div class="row">
          <div class="slider-label"><span>Intensity</span><span data-intensity-val></span></div>
          <input type="range" min="0" max="100" data-intensity />
        </div>
        <div class="row">
          <div class="slider-label"><span>Grayscale</span><span data-grayscale-val></span></div>
          <input type="range" min="0" max="100" data-grayscale />
        </div>
        <div class="row">
          <div class="slider-label"><span>Sepia</span><span data-sepia-val></span></div>
          <input type="range" min="0" max="100" data-sepia />
        </div>
        <div class="row">
          <label class="checkbox-row">
            <input type="checkbox" data-colorize />
            Colourise media
          </label>
        </div>
      </div>
    `;

    // Built here rather than as static <option> markup so THEMES stays
    // the single source of truth for which presets exist.
    const defaultThemeOptionsHtml = THEME_KEYS.map(
      (key) => `<option value="${key}">${THEME_LABELS[key]}</option>`
    ).join('');
    const siteThemeOptionsHtml =
      '<option value="default">Theme: Default</option>' + defaultThemeOptionsHtml;
    shadow.querySelector('[data-theme-group="default"]').innerHTML = defaultThemeOptionsHtml;
    shadow.querySelector('[data-theme-group="site"]').innerHTML = siteThemeOptionsHtml;

    document.documentElement.appendChild(host);
    if (supportsPopover) {
      try {
        host.showPopover();
      } catch (e) {
        // Ignore — worst case it renders as a normal fixed element.
      }
    }

    const btn = shadow.querySelector('.btn');
    const panel = shadow.querySelector('.panel');
    const siteLabel = shadow.querySelector('.site');
    const defaultSeg = shadow.querySelector('[data-group="default"]');
    const siteSeg = shadow.querySelector('[data-group="site"]');
    const defaultThemeSelect = shadow.querySelector('[data-theme-group="default"]');
    const siteThemeSelect = shadow.querySelector('[data-theme-group="site"]');
    const colorizeCheckbox = shadow.querySelector('[data-colorize]');
    const intensitySlider = shadow.querySelector('[data-intensity]');
    const grayscaleSlider = shadow.querySelector('[data-grayscale]');
    const sepiaSlider = shadow.querySelector('[data-sepia]');
    const intensityVal = shadow.querySelector('[data-intensity-val]');
    const grayscaleVal = shadow.querySelector('[data-grayscale-val]');
    const sepiaVal = shadow.querySelector('[data-sepia-val]');

    btn.addEventListener('click', () => panel.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      // Node.contains() does not cross shadow-DOM boundaries, so checking
      // it against `host` would always be false for clicks on our own
      // shadow content (closing the panel the instant it opens). Walk
      // the composed path instead, which does include shadow-internal
      // nodes.
      if (!e.composedPath().includes(host)) panel.classList.remove('open');
    });

    defaultSeg.addEventListener('click', (e) => {
      const val = e.target.getAttribute('data-val');
      if (!val) return;
      setDefaultMode(val);
      applyTheme();
    });

    siteSeg.addEventListener('click', (e) => {
      const val = e.target.getAttribute('data-val');
      if (!val) return;
      setSiteMode(getHost(), val);
      applyTheme();
    });

    defaultThemeSelect.addEventListener('change', () => {
      setDefaultTheme(defaultThemeSelect.value);
      applyTheme();
    });

    siteThemeSelect.addEventListener('change', () => {
      setSiteTheme(getHost(), siteThemeSelect.value);
      applyTheme();
    });

    colorizeCheckbox.addEventListener('change', () => {
      setColorizeMedia(colorizeCheckbox.checked);
      applyTheme();
    });

    intensitySlider.addEventListener('input', () => {
      setIntensity(intensitySlider.value);
      applyTheme();
    });

    grayscaleSlider.addEventListener('input', () => {
      setGrayscale(grayscaleSlider.value);
      applyTheme();
    });

    sepiaSlider.addEventListener('input', () => {
      setExtraSepia(sepiaSlider.value);
      applyTheme();
    });

    siteLabel.textContent = getHost();

    widgetRefs = {
      btn, defaultSeg, siteSeg, defaultThemeSelect, siteThemeSelect, colorizeCheckbox,
      intensitySlider, grayscaleSlider, sepiaSlider, intensityVal, grayscaleVal, sepiaVal,
    };
    updateWidget();
  }

  function updateWidget() {
    if (!widgetRefs) return;
    const dMode = getDefaultMode();
    const sMode = getSiteMode(getHost());
    const dTheme = getDefaultTheme();
    const sTheme = getSiteTheme(getHost());
    const enabled = computeEnabled();
    const intensity = getIntensity();
    const grayscaleAmt = getGrayscale();
    const sepiaAmt = getExtraSepia();

    widgetRefs.btn.textContent = enabled ? '\u{1F311}' : '☀️';
    widgetRefs.defaultSeg.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-val') === dMode);
    });
    widgetRefs.siteSeg.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-val') === sMode);
    });
    widgetRefs.defaultThemeSelect.value = dTheme;
    widgetRefs.siteThemeSelect.value = sTheme;
    widgetRefs.colorizeCheckbox.checked = getColorizeMedia();
    widgetRefs.intensitySlider.value = intensity;
    widgetRefs.grayscaleSlider.value = grayscaleAmt;
    widgetRefs.sepiaSlider.value = sepiaAmt;
    widgetRefs.intensityVal.textContent = intensity + '%';
    widgetRefs.grayscaleVal.textContent = grayscaleAmt + '%';
    widgetRefs.sepiaVal.textContent = sepiaAmt + '%';
  }

  buildWidget();
})();
