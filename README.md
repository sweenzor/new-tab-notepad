# New Tab Notepad for Chrome

## Features

* Persistent notepad on the "New Tab" page using Chrome's storage API.

## Deploying

Pushing a tag like `v0.3` triggers a GitHub Actions workflow
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) that packages
the extension and uploads it to the Chrome Web Store, auto-submitting for
review.

One-time setup: generate OAuth credentials for the Chrome Web Store API
(see [this guide](https://github.com/fregante/chrome-webstore-upload/blob/main/How%20to%20generate%20Google%20API%20keys.md))
and add these repository secrets:

* `CWS_EXTENSION_ID` — the extension ID from its Web Store URL
* `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN` — the OAuth credentials

## Todo

* [ ] Nicer icon, maybe something like [this](http://www.flaticon.com/free-icon/note_33410#term=notes&page=1&position=35)
* [x] Automate deployment to Chrome Web Store — GitHub Actions, see Deploying above
* [ ] Better Chrome Extension Javascript, based on [this](https://github.com/sidenotes/sidenotes)
* [ ] Tests, lint.

## Credits

* Chrome Extensions by [coleifer](https://github.com/coleifer/chrome-extensions)
* Textarea CSS by [eliotsykes](http://www.webdevbreak.com/episodes/zen-textarea-pure-css/demo)

## Screenshot

![](https://raw.githubusercontent.com/sweenzor/new-tab-notepad/master/screenshot.png)
