chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'bendu-assess',
    title: 'Assess Clarity',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'bendu-assess' && info.selectionText) {
    chrome.storage.local.set({ pendingText: info.selectionText });
    chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'evaluate') {
    handleEvaluate(msg.apiBase, msg.userId, msg.postText)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

async function handleEvaluate(apiBase, userId, postText) {
  const res = await fetch(`${apiBase}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, post_text: postText }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
