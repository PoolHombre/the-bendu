document.addEventListener('mouseup', () => {
  const text = window.getSelection()?.toString().trim();
  if (text && text.length > 10) {
    chrome.storage.local.set({ selectedText: text });
  }
});
