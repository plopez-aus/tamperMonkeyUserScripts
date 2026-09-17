// ==UserScript==
// @name         9GAG Controls
// @namespace    9gag-controls.local
// @version      1.4.4
// @description  Volume/zoom controls, promoted & ad post blocking, ad/app-nag removal, and per-post download buttons on 9gag.com. Ported from the "9GAG Controls" browser extension.
// @author       Niklas Englert (original extension); userscript port
// @source       https://github.com/niklas-englert/9GAG-Controls
// @match        http://9gag.com/*
// @match        https://9gag.com/*
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @run-at       document-end
// @grant        none
// @license      GPL-3.0-only
// ==/UserScript==

(function () {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
/* REMOVED ADS */
iframe[id*="google_ads_iframe"], /* Definitely Google AdSense */
.block-ad, .inline-ad-container, /* Sidebar ads and container for ad iframe */
.topBannerAd-container,  /* Container for ad iframe at top */
.cp-background, a.cp2077, /* Cyberpunk 2077 background */
.billboard /* top ad banner */
{
  display: none !important;
}

/* BLURED ADS */
iframe[src*="google"]:not(:hover) /* Probably Google AdSense */
{
  opacity: .1;
  filter: blur(10px);
  user-select: none;
  pointer-events: none;
}

/* REMOVED SITE FEATURES */
.badge-sticky-button:not(:hover), /* badge on bottom-right corner to promote their app */
.get-the-app, .get-the-app-banner, /* badge at end of sidenav to promote their app */
a[href="/apps"], a.app-store, a.google-play, /* link to their apps */
.nav-menu .new:after,
.block-social-love, .social-love, /* badge at end of sidenav to promote their social meadia */
article .share .btn-share /* share buttons on each post */
{
  display: none !important;
}

/* move video mute to the left to unblock the controls */
.video-post {
  overflow: visible !important;
  line-height: 0;
}

.video-post .sound-toggle {
  right: 100% !important;
  left: unset !important;
  bottom: 0 !important;
  border-radius: 50% 0 0 50% !important;
}

.video-post .length {
  left: 100% !important;
  right: unset !important;
  bottom: 0 !important;
  border-radius: 0 13px 13px 0 !important;
}

/* stop video drag on control bar drag */
.post-container a {
  user-drag: none;
  -webkit-user-drag: none;
}

/* article fullscreen */
article.--ext-zoom {
  --ext-zoom-background: rgba(32,32,32,0.7);
  transform: scale(var(--ext-zoom, 1));
  background-color: var(--ext-zoom-background);
  z-index: 1000;
  position: relative;
  outline: calc(150vw + 50vh) var(--ext-zoom-background) solid;
}

#container {
  overflow: visible !important;
}

body {
  overflow-x: hidden !important;
  padding-right: 60px !important;
}

/* center focus highlighting to show current center play */
article.--ext-in-center {
  transition: 200ms ease-in background-color;
  background-color: rgba(127, 127, 127, 0.1)  !important;
  border-left: 15px solid transparent !important;
  margin-left: -15px !important;
}

body.theme-dark.--ext-original-dark {
  --palette-text-foreground: black;
  --palette-text-background: black;
  --palette-text-background-hover: #111;
}

body.theme-dark.--ext-original-dark,
body.theme-dark.--ext-original-dark .drawer,
body.theme-dark.--ext-original-dark .sticky-navbar,
body.theme-dark.--ext-original-dark .post-afterbar-a.in-post-top,
body.theme-dark.--ext-original-dark #container .CS3 {
  background-color: black !important;
}

/* If connatix video insertions are disabled */
.--ext-blocked>* {
  display: none !important;
}
.--ext-blocked>.--ext-blocked-msg {
  display: block !important;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
}

/* move things that might be covered by the new right control bar to the left */
.badge-scroll-to-top {
  right: 80px !important;
  bottom: 40px !important;
}

.qc-cmp-persistent-link {
  right: 63px !important;
}

.function-wrap {
  right: 60px !important;
}

/* controls */
.--ext-controls {
  --ext-width: 60px;
  position: fixed;
  z-index: 1001;
  top: 0;
  bottom: 0;
  right: 0;
  width: var(--ext-width);
  color: white !important;
  background-color: rgba(0,0,0,1);
  font-size: calc(var(--ext-width) / 4) !important;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
}
@media only screen and (min-width: 1200px) {
  .--ext-controls {
    --ext-width: 65px;
  }
}
@media only screen and (min-width: 1500px) {
  .--ext-controls {
    --ext-width: 70px;
  }
}

.--ext-option {
  margin: 0.5em 5px;
}
.--ext-value {
  text-align: center;
  font-size: 0.8em;
}

button.--ext-button {
  display: block;
  cursor: pointer;
  width: 100%;
  background-color: transparent;
  border: 1px solid white;
  border-radius: 3px;
  color: white;
  font-size: inherit !important;
  padding: 0.3em;
  font-size: 1.4em !important;
  outline: none !important;
}
button.--ext-button:not(:disabled):hover {
  opacity: 0.9;
}

button.--ext-button.--ext-undo {
  background-color: white;
  color: black;
}

input.--ext-range {
  display: block;
  margin-top: 0.5em;
  width: 100%;
}

.--ext-option-switch {
  display: flex;
  align-items: center;
  justify-content: left;
  width: var(--ext-width);
  flex-wrap: nowrap;
  user-select: none;
  font-size: 0.9em;
}
.--ext-option-switch>input {
  margin: 0 calc(var(--ext-width) / 20);
}

body:not(.theme-dark) .--ext-original-dark-option {
  display: none;
}

.back-to-top.show {
	right: 90px;
  z-index: 1005;
}

/* mozilla fallback style because it does not have a webkit-appearance  */
@supports not (-webkit-appearance: slider-vertical) {
  input.--ext-range {
    display: block;
    position: relative;
    width: 200%;
    height: var(--ext-width);
    -moz-transform: rotate(270deg);
    transform: rotate(270deg);
    left: calc(5px - var(--ext-width) / 2);
    margin: calc(var(--ext-width) / 2) 0;
    overflow: hidden;
  }
}

@supports (-webkit-appearance: slider-vertical) {
  input.--ext-range {
    display: block;
    margin-top: 0.5em;
    -webkit-appearance: slider-vertical;
    width: 100%;
  }
}

/* video cover */
.video-post::before {
  content: '';
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 80px;
}

/*stop clicks in zoom */
.--ext-zoom-blocker {
  position: fixed;
  cursor: pointer;
  z-index: 999;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

/* download */
body.theme-dark li[data-v-download] {
  border: 1px solid rgba(255,255,255,.2);
}
li[data-v-download] {
  position: relative;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  text-align: center;
  -webkit-border-radius: 4px;
  border-radius: 4px;
  padding: 0 16px;
  height: 34px;
  border: 1px solid rgba(0,0,0,.1);
}

.--ext-download:after {
  position: absolute;
  content: " ";
  width: 30px;
  height: 30px;
  top: 50%;
  left: 50%;
  margin-top: -15px;
  margin-left: -15px;
  background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z' fill='%23999' /%3E%3C/svg%3E");
  background-size: cover;
}
`;
  document.head.appendChild(style);

  // If local storage wasn't set: set defaut options
  if (localStorage.getItem('__ext_volume') == null) localStorage.setItem('__ext_volume', 0.7);
  if (localStorage.getItem('__ext_zoom') == null) localStorage.setItem('__ext_zoom', 1.5);
  if (localStorage.getItem('__ext_original_dark') == null) localStorage.setItem('__ext_original_dark', 'false');
  if (localStorage.getItem('__ext_play_control') == null) localStorage.setItem('__ext_play_control', 'false');
  if (localStorage.getItem('__ext_auto_unmute') == null) localStorage.setItem('__ext_auto_unmute', 'false');

  // buffered version of localStorage.setItem
  // (inspired but probably not fixing issue #4)
  function localStorageSetItem(key, value) {
    const timeouts = localStorageSetItem.timeouts;
    localStorageSetItem.values.set(key, value);
    // cancel old timeout
    const lastTimeout = timeouts.get(key);
    if (lastTimeout) clearTimeout(lastTimeout);
    // start new timeout
    timeouts.set(key, setTimeout(() => {
      localStorage.setItem(key, value);
      timeouts.delete(key);
      localStorageSetItem.values.delete(key);
    }, 750));
  }

  localStorageSetItem.timeouts = new Map();
  localStorageSetItem.values = new Map();

  /* to apply every change */
  const update = () => {

    // set volume and add controls
    const isAutoUnmuting = JSON.parse(localStorage.getItem('__ext_auto_unmute'));
    if (isAutoUnmuting) {
      for (const video of document.querySelectorAll('video:not([data-volume])')) {
        video.muted = false;
      }
    }
    const volume = localStorageSetItem.values.has('__ext_volume') ? localStorageSetItem.values.get('__ext_volume') : localStorage.getItem('__ext_volume') * 1;
    for (const video of document.querySelectorAll('video:not([data-volume="' + volume + '"])')) {
      video.volume = volume;
      video.dataset.volume = volume;
      video.controls = true;
    }
    // disable drag for video post
    $('.post-container a:not([draggable])').attr('draggable', 'false');

    // find promoted post
    const promotetArticles = [...document.querySelectorAll('article:not(.--ext-detected) .message>a[href^="javascript:"]')]
      .filter(elem => elem.textContent.match(/Promoted/))
      .map(elem => {
        while (elem) {
          elem = elem.parentElement;
          if (elem.tagName === 'ARTICLE') return elem;
        }
      });
    for (const article of promotetArticles) {
      article.dataset.blocked = 'Post from the section "Promoted"';
    }

    // find unlisted posts and ads covered in posts like connatix
    const unlistedArticles = [...document.querySelectorAll('article:not([id]):not(.--ext-detected)')];
    for (const article of unlistedArticles) {
      article.dataset.blocked = 'Post has no ID, so it is probably an ad.';
    }

    // hide posts
    for (const article of [...promotetArticles, ...unlistedArticles]) {
      const $blockMsg = $(
          '<div class="--ext-blocked-msg">[9GAG Controls has blocked this post. Click here to reveal.]<br>' +
          'Reason: ' + article.dataset.blocked + '</div>')
        .click(() => {
          $blockMsg.remove();
          $(article).removeClass('--ext-blocked');
        });
      $(article)
        .addClass('--ext-detected')
        .addClass('--ext-blocked')
        .append($blockMsg);
    }

    // remove video sources like webm or other weird non-mp4
    try {
      $('.post-container video>source[src^="https://img-9gag-fun.9cache.com/"]:not([type="video/mp4"])').each((i, elem) => {
        elem.parentElement.classList.add('--reloadable');
      }).remove();
    } catch (e) {}

    $('video.--reloadable').removeClass('--reloadable').each(async (i, elem) => {
      try {
        // This part is over-complicated because of Google Chromes nasty loading policy on videos and audios. It's causing
        // "Uncaught (in promise) DOMException: The play() request was interrupted by a call to load()." errors otherwise.
        let paused = elem.paused;
        // elem.readyState
        await elem.pause();
        await elem.load();
        if (!paused) elem.play();
      } catch (e) {}
    });

    // remove picture sources like webp
    $('picture>source[type="image/webp"]').remove();

    // add download buttons
    $('article:not(.--ext-downloadable)').each((i, elem) => {
      const $elem = $(elem);
      $elem.addClass('--ext-downloadable');
      // get filename
      if (typeof elem.id !== 'string') return;
      let filename = false;
      $('picture>img', elem).each((j, img) => filename = img.src);
      $('source[type="video/mp4"]', elem).each((j, source) => filename = source.src);
      if (!filename) return;
      filename = filename.split('/').pop();
      if (!filename) return;
      // add download button
      $('.post-afterbar-a>.btn-vote:last-of-type, .post-afterbar-a>.vote+.share', elem)
        .after('<ul class="btn-vote left"><li data-v-download><a title="download post" class="--ext-download" href="/photo/' + filename + '" rel="nofollow" download="">&nbsp;&nbsp;</a></li></ul>');
    });
  };
  setInterval(update, 100);

  /**
   * Get volume symbol that shows the "loudnes".
   * @param {Number} volume Volume percentage from 0.0 to 1.0.
   * @return {String} Volume unicode.
   */
  function getVolumeSymbol(volume) {
    if (volume <= 0) return '🔇';
    else if (volume < 0.5) return '🔈';
    else if (volume < 1) return '🔉';
    else return '🔊';
  }

  /**
   * Get current article thag that is the best in current viewport.
   * @return {ArticleElement} The found element.
   */
  function getCurrentArticle() {
    let bestElem, bestMiddle = Infinity;
    $('article').each((i, elem) => {
      let middle = Math.abs($(elem).offset().top + elem.offsetHeight / 2 - pageYOffset - innerHeight / 2 - 25);
      if (middle < bestMiddle) {
        bestElem = elem;
        bestMiddle = middle;
      }
    });
    return bestElem;
  }

  function autoUnmuteChange(isAutoUnmuting) {
    if (isAutoUnmuting) {
      for (const video of document.querySelectorAll('video[data-volume]')) {
        if (video.parentElement.querySelector('.sound-toggle.off')) video.muted = false;
      }
    } else {
      for (const video of document.querySelectorAll('video[data-volume]')) {
        video.muted = true;
      }
    }
  }

  // detect changes in settings made by an other tab
  window.addEventListener('storage', evt => {
    // stop on non-extention storage
    if (!evt.key.startsWith('__ext_')) return;
    // handle changes
    switch (evt.key) {
      // simulate volume input to apply changes
      case '__ext_volume':
        $('#--ext-volume-scale').val(evt.newValue * 1)[0]
          .dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
          }));
        break;
      case '__ext_zoom':
        // simulate zoom input to apply changes
        $('#--ext-zoom-scale').val(evt.newValue * 1)[0]
          .dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
          }));
        break;
      case '__ext_original_dark': {
        let originalDark = JSON.parse(evt.newValue);
        $('#--ext-original-dark-switch').prop('checked', originalDark);
        if (originalDark) $('body').addClass('--ext-original-dark');
        else $('body').removeClass('--ext-original-dark');
      }
      case '__ext_auto_unmute': {
        let isAutoUnmuting = JSON.parse(evt.newValue);
        $('#--ext-auto-unmute').prop('checked', isAutoUnmuting);
        autoUnmuteChange(isAutoUnmuting);
      }
      break;
    }
  }, false);

  // inject control html
  {
    let volume = localStorage.getItem('__ext_volume') * 1;
    let zoom = localStorage.getItem('__ext_zoom') * 1;
    let originalDark = JSON.parse(localStorage.getItem('__ext_original_dark'));
    let isAutoUnmuting = JSON.parse(localStorage.getItem('__ext_auto_unmute'));


    let $body = $(document.body)
      .append(`<div class="--ext-controls">
      <img title="9GAG Controls" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5AUHDxkiUQrrPAAABrFJREFUaN7lWl1I0+sf/2y6lm9t7ESuYbTKziIiZkoaFUVQN/2TtFYR1I1kp/DCXrBRCWfQVUbhhbIiuygMrIsgpBCRxI2CijMjGG1abYQ5WzUjtdzb51yczeN0m7/fpp5z+H/gufk9b5/v8zzf5/vy/CSYHcgB5ADIBvArgEIAGgCKSP03AB8B9ANwAhgDMApgPN2JJWn21wHYCWArgA0R4kLQD+APABYAnQAcmGfoIhP7AIQAMMUSiozRGRlzzqECYE6D8EzFHJljTvAbgKE5JB8tQ5G5ZlUHHgL4Xyo6o1QqsXfvXpSVlWHVqlUYHBzEiRMnMDo6mqwbAbQDKE931X8B8ErsKqpUKlZWVtJms3EqLBYL8/LyhI71KsIhZfIvxBBfsGABa2pqaLfbmQg9PT1iBGCEQ0pCiFp5hUJBq9XKcDjMZEhBgOhOiMJDMRMUFhZyeHiYQpCiAIxwEnzbhIUOXFJSws+fP1MorFZrqgKEhdxOKjFXZV5eHh0OB8Xg8ePHzMrKSueKTWonRBmp27dvCyY+PDxMk8k0W8YuoXsgeKA9e/YIIh4IBNjY2Mj8/HzKZDLW19fz6NGj6QoR1+3oFDqAVCplf3+/oOOyfPlyAmBVVRW9Xi9J0u/3s7e3l3q9PlUBOuOtvk/oABUVFfzx40dc0qFQiG63m/v37ycA6nQ6Pn36NKGQV69epVKpFCuAb+ou1Aj1KqVSKZuamhISamlpYV5eHrVaLc1m8zS70NraSqvVGvPN4/Gwrq6Oubm5YrzYmsnBSJsYg/XixYuEAhw6dIgqlYoDAwMx31++fMn169czMzOTOTk5NBgM/PTpU0ybJ0+eiNmFNgByaSSS2iDUSGRlZWHt2rUJ66VSKaRSKbKzs2O+t7e3w+12IxgMYnx8HDabDb29vTFtFi9eLMbYbohwR4GY86fT6ZIq7uHDhymRSHjw4EE+f/48pm5gYIBGo5Fms5mBQGBa39evX4vVhQIA2CGm08aNG2cUINo2NzeXR44c4djY2ET9VJ2wWCzpCLADAKqFNJbL5aysrOS3b98ECxAtSqWSDx484OjoaIzi1tbWEkA6AlQDwO8zNSwvL2d3d7cgwxVPgGjZvn077927x4aGhgn7kKYAv2dOSn1Mw7Jly3Dnzh2UlpZi4cKFKQUVarUaHo8HANDd3Y1nz57B7/eD5GyEuQppvK+LFi1CbW0tXC4Xtm3blhL5pUuX4ubNmxgcHITFYoFOp0NGRgbGx8dBEtnZ2aioqMDIyMjf8a0ktSzPxBGSSCQ8fvy4aA9zMioqKgiAly9fjvkeDAbZ3NzMdevWcffu3ezo6Iip9/l8PHXqlOgjNKHEW7dupdPpZDAYZDpwu91cvHkzAbC4uHhaeOnz+WJuJZJsa2ujRqMhABqNRnZ1dVGtVgtT4sLCwh3Nzc2CCX79+pUdHR3TSEzFjRs3JkicPXuWQ0ND03wmu93OTZs2EQBLS0v59u3bmDYXLlyYKfjZAZIFQogHg0G2tLSwqKiIAGLu70T4+PEjz58/T5lMRo1GwytXrnBkZIR2u50nT54kAOr1era2tiYc482bNzx27BgzMjLiGzKSKpJ9yYjYbDYWFRXFDLJy5UrBu/bhwwceOHCAAKjRaKhQKAiAZrNZUCwdCATY1dU1lXwfABVIykm2JVrBqqqqhFtoNBpF6UdPTw9Xr17N8vLyGQ3iVBQXF8d15v5Kg5E1JEPRxl6vlyaTiUuWLEnqlZ47d060kodCIdF9qqurk7rTCIfDOpI+krx16xYLCgqSar/BYKDL5ZoxBzQbuHTpEqVSaeKAJmoR371717lly5akgYxWq+WjR484H/D7/bx27drMIeUkk54wqNdqtWxsbIzrAs8FHA4H9+3bJzqoj5tWMZlMgrNu0cjr/v37KZOvr6+fuKXEplUmEltyuZxlZWV0Op2CJ/Z4PDxz5szERGvWrOHdu3fp8Xg4PDzMnz9/xuhMMBjk2NgYv3z5wv7+fl68eJGZmZmiE1vTvKeSkpLf6urqmg0GgyDP6vv377h+/Tqamprgcrmm1ctkMuj1emi1WqjVaigUCoTDYXi9Xng8HjgcDjidTiFTEcDJmXYgqhcPhax6e3s7V6xYQYlEMtevNsKSu5N9dJKv4pEOh8Ps6+vjrl275oO0+PR6VAiSv5CMyZ+8f/+ep0+fZk5OznySF//AMUWIVyTZ0NDA/Pz8+SSe3hPT5OO0c+fOh2LeDGahhMU8aAgSQiKR/CufWf+vHrr/lb8a/Od/9pDM0o78Y7/b/Akwk3N/hL7nOwAAAABJRU5ErkJggg==" />
      <div class="--ext-option" title="audio volume">
        <button id="--ext-volume-btn" class="--ext-button">${getVolumeSymbol(volume)}</button>
        <div id="--ext-volume-value" class="--ext-value">${Math.round(volume*100)}%</div>
        <input id="--ext-volume-scale" class="--ext-range" type="range" step="0.05" min="0" max="1" />
      </div>
      <div class="--ext-option" title="post zoom">
        <button id="--ext-zoom-btn" class="--ext-button">🔍</button>
        <div id="--ext-zoom-value" class="--ext-value">${Math.round(zoom*100)}%</div>
        <input id="--ext-zoom-scale" class="--ext-range" type="range" step="0.05" min="1" max="3" />
      </div>
      <div class="--ext-option --ext-auto-unmute-option" title="unmute videos if scrolled into view">
        <label class="--ext-option-switch">
          <input type="checkbox" id="--ext-auto-unmute">
          <span>auto unmute</span>
        </label>
      </div>
      <div class="--ext-option --ext-original-dark-option" title="switch back to original dark mode">
        <label class="--ext-option-switch">
          <input type="checkbox" id="--ext-original-dark-switch">
          <span>black</span>
        </label>
      </div>
    </div>`)
      .append(`<div class="--ext-zoom-blocker" style="display:none" title="undo zoom"></div>`)
      .css('--ext-zoom', zoom + '');

    if (originalDark) {
      $body.addClass('--ext-original-dark');
      $('#--ext-original-dark-switch').prop('checked', true);
    }
    if (isAutoUnmuting) {
      $('#--ext-auto-unmute').prop('checked', true);
    }

    $('#--ext-volume-btn').click(evt => {
      let volume = localStorageSetItem.values.has('__ext_volume') ? localStorageSetItem.values.get('__ext_volume') : localStorage.getItem('__ext_volume') * 1;
      if (volume == 0) volume = 1;
      else volume = 0;
      localStorageSetItem('__ext_volume', volume);
      $('#--ext-volume-scale').val(volume);
      $('#--ext-volume-btn').text(getVolumeSymbol(volume));
      $('#--ext-volume-value').text(Math.round(volume * 100) + '%');
      update();
    });

    $('#--ext-volume-scale').on('input', evt => {
      let volume = evt.target.value * 1;
      localStorageSetItem('__ext_volume', volume);
      $('#--ext-volume-btn').text(getVolumeSymbol(volume));
      $('#--ext-volume-value').text(Math.round(volume * 100) + '%');
      update();
    }).val(volume);

    $('#--ext-zoom-btn, .--ext-zoom-blocker').click(evt => {
      // undo last zoom
      if ($('article.--ext-zoom').removeClass('--ext-zoom').length) {
        $('.--ext-zoom-blocker').hide();
        $('#--ext-zoom-btn').removeClass('--ext-undo');
        return;
      }
      // zoom
      $(getCurrentArticle()).addClass('--ext-zoom');
      $('.--ext-zoom-blocker').show();
      $('#--ext-zoom-btn').addClass('--ext-undo');
    });

    $('#--ext-zoom-scale').on('input', evt => {
      let zoom = evt.target.value * 1;
      localStorageSetItem('__ext_zoom', zoom);
      $(document.body).css('--ext-zoom', zoom + '');
      $('#--ext-zoom-value').text(Math.round(zoom * 100) + '%');
    }).val(zoom);

    $('#--ext-original-dark-switch').on('input', evt => {
      originalDark = $('#--ext-original-dark-switch').prop('checked');
      if (originalDark) $body.addClass('--ext-original-dark');
      else $body.removeClass('--ext-original-dark');
      localStorageSetItem('__ext_original_dark', JSON.stringify(originalDark));
    });

    $('#--ext-auto-unmute').on('input', evt => {
      isAutoUnmuting = $('#--ext-auto-unmute').prop('checked');
      localStorageSetItem('__ext_auto_unmute', JSON.stringify(isAutoUnmuting));
      autoUnmuteChange(isAutoUnmuting);
    }).val(zoom);

  }

  // advanced ads and feature detection
  setTimeout(() => {
    for (const a of [...document.querySelectorAll('nav a[href*="://bit.ly"]')]) {
      const content = a.textContent.trim().toLowerCase().replace(/[\s_]+/g, '_');
      if (
        content.indexOf('get_app') !== -1 ||
        content.indexOf('win_a') !== -1 ||
        content.indexOf('donate') !== -1 ||
        content.indexOf('shop') !== -1
      ) {
        a.remove();
      }
    }
  }, 1200);
})();
