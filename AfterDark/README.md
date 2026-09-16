# AfterDark

A Tampermonkey userscript that darkens every site, similar to Dark Reader / Dark Night, using the CSS `invert()` + `hue-rotate()` technique (images/video/canvas are re-inverted so they keep natural colors).

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Open the Tampermonkey dashboard → **Utilities** (or **+**) → **Create a new script**.
3. Delete the placeholder content and paste in the contents of [`afterdark.user.js`](afterdark.user.js).
4. Save (`Ctrl/Cmd+S`). It runs on every site (`@match *://*/*`).

## Features

1. **Default toggle: On / Off / Auto** — the global fallback. "Auto" follows the OS/browser `prefers-color-scheme`, live-updating if you change your system theme.
2. **Per-site toggle: Default / On / Off / Auto** — independent of the global default. Stored per-hostname in Tampermonkey's script storage (`GM_setValue`/`GM_getValue`), not a cookie, so it isn't cleared when you clear site data and it's shared across tabs. "Default" (the default per-site option) means "fall back to the global toggle."
3. Per-site uses the **same three modes** as the default toggle (On/Off/Auto), plus "Default" to explicitly inherit.
4. **Theme presets**, selectable both as a global default and as an independent per-site override (same "Default / preset" pattern as the mode toggle):
   - **Standard** — plain invert + hue-rotate.
   - **Dimmed** — softer/lower-contrast, easier on the eyes.
   - **Sepia** — warm dark tone.
   - **Contrast** — punchier, higher-contrast dark mode.
   - **Dracula**, **Nord**, **Gruvbox Dark**, **Solarized Dark**, **Tokyo Night** — filter-tinted *approximations* of these popular color schemes (hue-rotate/sepia/saturate nudged toward each palette's signature accent color). These are not literal hex reproductions: a universal filter has no way to know what CSS variables any given site uses, unlike a site-specific userstyle that overrides known variables with exact colors (see [`../Action1-themes`](../Action1-themes) for an example of that approach, built for Action1's console specifically).

   Whichever theme is active, images/video/canvas are still corrected back to natural color first — the theme's extra brightness/contrast/sepia/hue adjustment then applies on top of that correction, so pictures subtly pick up the theme's mood instead of looking untouched or fully re-colored.
5. **Intensity / Grayscale / Sepia sliders** (global, in the panel, 0–100% each):
   - **Intensity** controls the strength of the base dark-mode flip itself (`invert()`'s own amount) — 100% is the full effect described above, lower values blend toward the untouched page (e.g. 50% gives a soft mid-gray instead of true black), rather than just dimming brightness.
   - **Grayscale** and **Sepia** layer `grayscale()`/`sepia()` on top of whatever theme is active, for fine-tuning beyond the fixed presets.
6. **"Colourise images" checkbox** (global, in the panel) — checked (default): images/video/canvas only cancel the base dark-mode flip, so they still pick up the active theme's and sliders' tint like the rest of the page (as described in #4). Unchecked: computes the exact inverse of the *entire* active filter chain (intensity + theme + sliders) and applies it to media specifically, so they render in their true original colors regardless of how strong the effect is elsewhere on the page.

   This works via a small color-matrix engine: every filter function used (`invert`, `hue-rotate`, `brightness`, `contrast`, `saturate`, `sepia`, `grayscale`) is representable as an affine transform in RGB space, so the whole chain composes into one 3×4 matrix that gets inverted exactly and applied to media through a single generated SVG `feColorMatrix` (kept in sync on every change, rather than trying to reverse each CSS function one at a time — `sepia()`/`grayscale()` have no CSS-level inverse, so that approach breaks down once those are involved).

   One real limitation, not a bug: at very high Sepia/Grayscale slider values the *forward* transform itself throws away color information (that's the entire point of those filters), so nothing can recover it — pushing Sepia to 100% and unchecking "Colourise images" will show images as a flat, nearly featureless tone rather than restoring them, the same way you can't un-grayscale a photo. This becomes noticeable above roughly 80–90%; it's not something a filter trick can fix.

## Controls

- **Floating tab** (flush against the right edge, vertically centered): click it to open a panel with segmented controls for mode ("Default" and "This site"), a theme dropdown under each, the three sliders, and the "Colourise images" checkbox — change any of them instantly.
- **Tampermonkey menu**: right-click the Tampermonkey toolbar icon → "AfterDark: cycle default (...)", "cycle this site (...)", "cycle default theme (...)", "cycle this site theme (...)", and "colourise images (...)" — each click advances to the next option (or toggles), handy if you don't want the on-page widget. The sliders are continuous, so they're widget-only (no menu entries).

## Notes / limitations

- The floating widget renders via the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) top layer (Chrome/Edge 114+, Safari 17+, Firefox 125+) so it's immune to the page's own dark filter and stays pinned to the viewport corner instead of scrolling away. On older browsers without Popover support it falls back to a plain fixed element, which can very rarely drift if a very tall page is also being darkened.

- The invert+hue-rotate trick is the same lightweight approach used by simple dark-mode extensions — it's fast and universal but, unlike Dark Reader's per-element color analysis, it won't intelligently re-theme CSS `background-image`s (only `<img>`, `<video>`, `<canvas>`, `<iframe>`, `<embed>`, `<object>`, and inline `<svg><image>` are corrected).
- Settings are stored per-script via Tampermonkey (`GM_setValue`), scoped to the script, not per-cookie — they persist across all sites and sync across open tabs automatically.
- The widget only renders in the top-level frame (not inside embedded iframes), but the dark filter itself is applied inside iframes too so embedded content still darkens.
