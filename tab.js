(function() {
  const elem = document.getElementById('note-text');
  const syncStatus = document.getElementById('sync-status');
  let saveTimer = 0;
  // The last text this tab loaded or saved; used to tell our own edits
  // apart from changes made in other tabs.
  let lastSaved = '';

  async function load() {
    const [local, sync] = await Promise.all([
      chrome.storage.local.get(['noteText', 'noteSavedAt']),
      chrome.storage.sync.get(['noteText', 'noteSavedAt']),
    ]);
    // Prefer the most recently saved copy. Notes from versions before 0.3
    // exist only in sync and carry no timestamp.
    let text;
    if (local.noteText === undefined) {
      text = sync.noteText;
    } else if (sync.noteText === undefined) {
      text = local.noteText;
    } else {
      text = (local.noteSavedAt || 0) > (sync.noteSavedAt || 0)
          ? local.noteText
          : sync.noteText;
    }
    elem.value = text || '';
    lastSaved = elem.value;
  }

  async function save() {
    const noteText = elem.value;
    if (noteText === lastSaved) {
      return;
    }
    lastSaved = noteText;
    const payload = {noteText: noteText, noteSavedAt: Date.now()};
    // local is the safety net: its quota is ~10 MB vs sync's 8 KB per item.
    await chrome.storage.local.set(payload);
    try {
      await chrome.storage.sync.set(payload);
      syncStatus.hidden = true;
    } catch (e) {
      // Over sync's per-item quota; the note is still saved locally.
      syncStatus.hidden = false;
    }
  }

  function scheduleSave() {
    // Debounce: save after 1 second without input.
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 1000);
  }

  elem.addEventListener('input', scheduleSave);
  elem.addEventListener('blur', save);
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      save();
    }
  });

  // Mirror edits made in other tabs (or other machines, via sync) so a
  // stale tab never overwrites newer text.
  chrome.storage.onChanged.addListener(function(changes) {
    if (!changes.noteText) {
      return;
    }
    const newText = changes.noteText.newValue || '';
    if (newText === elem.value) {
      lastSaved = newText;  // echo of this tab's own save
      return;
    }
    if (elem.value !== lastSaved) {
      return;  // this tab has unsaved edits; its pending save wins
    }
    elem.value = newText;
    lastSaved = newText;
  });

  load();
})();
