# New Tab Notepad for Chrome

## Features

* Persistent notepad on the "New Tab" page using Chrome's storage API.
* Syncs across your Chrome browsers; notes too long for the sync quota
  automatically fall back to device-local storage.
* Live-updates across open tabs, so a stale tab never clobbers newer text.
* Dark mode, following the system setting.
* Options for font size and spellcheck (right-click the toolbar icon &rarr;
  Options); clicking the toolbar icon opens a new tab.

> **Tip:** Chrome hides the bookmarks bar on custom new-tab pages. Press
> <kbd>&#8984;&#8679;B</kbd> (Mac) or <kbd>Ctrl+Shift+B</kbd> (Windows/Linux)
> to always show it.

## Development

* `npm test` — behavioral tests that drive `tab.js` against a stubbed
  `chrome.storage` and DOM. No dependencies needed.
* `npm run lint` — ESLint via npx. Both run in CI on every push and PR.

## Releasing

Bump `version` in `manifest.json`, zip the extension files, and upload by
hand at the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole):

    zip -X new-tab-notepad.zip manifest.json start-page.html new-tab.css tab.js background.js options.html options.js options.css icon16.png icon48.png icon128.png

## Todo

* [ ] Nicer icon, maybe something like [this](http://www.flaticon.com/free-icon/note_33410#term=notes&page=1&position=35)
* [x] Better Chrome Extension Javascript — promise-based storage, `input` events, cross-tab sync
* [x] Tests, lint — `node --test` behavioral suite + ESLint, run in CI.

## Credits

* Chrome Extensions by [coleifer](https://github.com/coleifer/chrome-extensions)
* Textarea CSS by [eliotsykes](http://www.webdevbreak.com/episodes/zen-textarea-pure-css/demo)

## Screenshot

![](https://raw.githubusercontent.com/sweenzor/new-tab-notepad/master/screenshot.png)
