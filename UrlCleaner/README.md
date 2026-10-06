# URL Cleaner (Tampermonkey Userscript)

A lightweight userscript designed to remove tracking parameters, analytics tokens, and click IDs from URLs, with seamless compatibility for **Tampermonkey in Safari**, Chrome, Firefox, and Edge.

Ported and adapted from the Chrome Extension [URL Cleaner](https://chromewebstore.google.com/detail/url-cleaner/dffbjiomnajbmlhjelpipfldgkijdemn).

---

## Features

- **Automatic Address Bar Cleaning**: Automatically detects and strips tracking parameters on page load using `history.replaceState` without reloading or breaking page state.
- **Link Click Sanitization**: Strips tracking parameters on outgoing links when clicked.
- **Tampermonkey Menu Commands**:
  - `Copy URL (without tracking)`: Copies the URL stripped of tracking tags.
  - `Copy Base URL (no params/hash)`: Copies the bare canonical URL (strips all query parameters and hash fragments).
- **Keyboard Shortcut**:
  - Press <kbd>Option</kbd> + <kbd>C</kbd> (Mac) or <kbd>Alt</kbd> + <kbd>C</kbd> to copy the clean URL directly to your clipboard.
- **Safari Compatible**: Built using standard GM APIs (`GM_setClipboard`, `GM_registerMenuCommand`) and DOM APIs fully supported by Tampermonkey on Safari.

---

## Filtered Parameters

The script automatically strips:
- **UTM parameters**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`, `utm_name` (and any other `utm_*` parameters)
- **Ad & Click IDs**:
  - Facebook (`fbclid`)
  - Google Ads (`gclid`, `gclsrc`, `dclid`)
  - Microsoft / Bing Ads (`msclkid`)
  - Yandex (`yclid`)
  - Mailchimp (`mc_cid`, `mc_eid`)
  - Instagram (`igshid`)
  - Google Analytics (`_ga`, `_gl`)

---

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension for your browser (available on the Mac App Store for Safari).
2. Open Tampermonkey's Dashboard and create a new script.
3. Paste the contents of [`url-cleaner.user.js`](./url-cleaner.user.js) and save (<kbd>Cmd</kbd> + <kbd>S</kbd>).
4. Browse as normal—URLs will be automatically cleaned in the background.
