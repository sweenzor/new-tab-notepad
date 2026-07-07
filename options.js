(function() {
  const DEFAULTS = {fontSizeEm: 6.375, spellcheck: true};

  const fontSlider = document.getElementById('font-size');
  const fontValue = document.getElementById('font-size-value');
  const spellcheckBox = document.getElementById('spellcheck');

  function showFontSize() {
    fontValue.textContent = Math.round(fontSlider.value * 16) + ' px';
  }

  async function init() {
    const stored = await chrome.storage.sync.get(Object.keys(DEFAULTS));
    const settings = Object.assign({}, DEFAULTS, stored);
    fontSlider.value = settings.fontSizeEm;
    spellcheckBox.checked = settings.spellcheck;
    showFontSize();
  }

  // Preview the value while dragging; persist on release.
  fontSlider.addEventListener('input', showFontSize);
  fontSlider.addEventListener('change', function() {
    chrome.storage.sync.set({fontSizeEm: Number(fontSlider.value)});
  });
  spellcheckBox.addEventListener('change', function() {
    chrome.storage.sync.set({spellcheck: spellcheckBox.checked});
  });

  init();
})();
