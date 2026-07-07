// Behavioral tests for tab.js: stub chrome.storage and a minimal DOM, then
// drive the real event flows and assert on storage contents.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SOURCE = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tab.js'),
    'utf8');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const tick = () => sleep(20);
// tab.js debounces saves by 1 second.
const DEBOUNCE = 1100;

function makeElem() {
  const handlers = {};
  return {
    value: '',
    hidden: true,
    style: {},
    addEventListener(type, fn) {
      (handlers[type] ||= []).push(fn);
    },
    fire(type) {
      (handlers[type] || []).forEach((fn) => fn());
    },
  };
}

// Boots a fresh copy of tab.js against fresh stores. syncByteLimit simulates
// sync's per-item quota by rejecting oversized writes.
function boot(localInit = {}, syncInit = {}, syncByteLimit = 8192) {
  const listeners = [];
  function makeStore(initial, byteLimit) {
    const data = {...initial};
    return {
      data,
      async get(keys) {
        const out = {};
        for (const k of keys) {
          if (k in data) out[k] = data[k];
        }
        return out;
      },
      async set(items) {
        if (byteLimit && JSON.stringify(items).length > byteLimit) {
          throw new Error('QUOTA_BYTES_PER_ITEM quota exceeded');
        }
        Object.assign(data, items);
        // Chrome fires onChanged in every context, including the writer.
        const changes = {};
        for (const k of Object.keys(items)) changes[k] = {newValue: items[k]};
        listeners.forEach((l) => l(changes));
      },
    };
  }
  const local = makeStore(localInit);
  const sync = makeStore(syncInit, syncByteLimit);
  const note = makeElem();
  const status = makeElem();
  const doc = makeElem();
  doc.visibilityState = 'visible';
  doc.getElementById = (id) => (id === 'note-text' ? note : status);
  global.document = doc;
  global.chrome = {
    storage: {local, sync, onChanged: {addListener: (fn) => listeners.push(fn)}},
  };
  eval(SOURCE);
  const fireChanges = (changes) => listeners.forEach((l) => l(changes));
  const remoteChange = (text) => fireChanges({noteText: {newValue: text}});
  return {local, sync, note, status, doc, remoteChange, fireChanges};
}

test('loads a legacy sync-only note (no timestamp)', async () => {
  const t = boot({}, {noteText: 'legacy note'});
  await tick();
  assert.equal(t.note.value, 'legacy note');
});

test('load prefers the newer of local and sync', async () => {
  let t = boot({noteText: 'newer local', noteSavedAt: 200},
      {noteText: 'older sync', noteSavedAt: 100});
  await tick();
  assert.equal(t.note.value, 'newer local');

  t = boot({noteText: 'older local', noteSavedAt: 100},
      {noteText: 'newer sync', noteSavedAt: 200});
  await tick();
  assert.equal(t.note.value, 'newer sync');
});

test('typing saves to both areas after the debounce', async () => {
  const t = boot();
  await tick();
  t.note.value = 'hello';
  t.note.fire('input');
  await sleep(DEBOUNCE);
  assert.equal(t.local.data.noteText, 'hello');
  assert.equal(t.sync.data.noteText, 'hello');
  assert.ok(t.local.data.noteSavedAt > 0);
});

test('over-quota notes fall back to local and show the indicator', async () => {
  const t = boot();
  await tick();
  t.note.value = 'hello';
  t.note.fire('blur');
  await tick();

  t.note.value = 'x'.repeat(9000);
  t.note.fire('blur');
  await tick();
  assert.equal(t.local.data.noteText.length, 9000);
  assert.equal(t.sync.data.noteText, 'hello');
  assert.equal(t.status.hidden, false);

  // Shrinking back under the quota resumes syncing and hides the indicator.
  t.note.value = 'small again';
  t.note.fire('blur');
  await tick();
  assert.equal(t.sync.data.noteText, 'small again');
  assert.equal(t.status.hidden, true);
});

test('changes from other tabs are mirrored when idle', async () => {
  const t = boot({}, {noteText: 'original'});
  await tick();
  t.remoteChange('from another tab');
  assert.equal(t.note.value, 'from another tab');
});

test('remote changes do not clobber unsaved edits', async () => {
  const t = boot({}, {noteText: 'original'});
  await tick();
  t.note.value = 'mid-edit here';
  t.note.fire('input');
  t.remoteChange('remote intruder');
  assert.equal(t.note.value, 'mid-edit here');
  await sleep(DEBOUNCE);
  assert.equal(t.sync.data.noteText, 'mid-edit here');
});

test('a blur with unchanged text writes nothing', async () => {
  const t = boot();
  await tick();
  t.note.value = 'hello';
  t.note.fire('blur');
  await tick();
  const savedAt = t.local.data.noteSavedAt;
  await sleep(5);
  t.note.fire('blur');
  await tick();
  assert.equal(t.local.data.noteSavedAt, savedAt);
});

test('applies default settings when none are stored', async () => {
  const t = boot();
  await tick();
  assert.equal(t.note.style.fontSize, '6.375em');
  assert.equal(t.note.spellcheck, true);
});

test('applies stored settings on load and live changes', async () => {
  const t = boot({}, {fontSizeEm: 2, spellcheck: false});
  await tick();
  assert.equal(t.note.style.fontSize, '2em');
  assert.equal(t.note.spellcheck, false);

  t.fireChanges({fontSizeEm: {newValue: 3}});
  assert.equal(t.note.style.fontSize, '3em');
  t.fireChanges({spellcheck: {newValue: true}});
  assert.equal(t.note.spellcheck, true);
});

test('hiding the tab saves pending text', async () => {
  const t = boot();
  await tick();
  t.note.value = 'saved on hide';
  t.doc.visibilityState = 'hidden';
  t.doc.fire('visibilitychange');
  await tick();
  assert.equal(t.local.data.noteText, 'saved on hide');
});
