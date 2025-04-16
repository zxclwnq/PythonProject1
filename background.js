chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "check-message",
    title: "Проверить сообщение",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "check-message") {
    const selectedText = info.selectionText;
    const SERVER_URL = "http://localhost:5000/validate";

    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: selectedText })
      });
      const result = await response.json();

      // ✅ ВСЕГДА отправляем результат — даже если class === 3
      if (result && result.class !== undefined) {
        chrome.tabs.sendMessage(tab.id, { action: "highlight", data: result });
      }

    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
    }
  }
});
