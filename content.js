// Принимаем сообщение от background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "highlight") {
    const classification = message.data.class;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    if (classification !== 3) {
      highlightSelection(selection, classification);
    } else {
      showToaster("Ничего не найдено!", selection);
    }
  }
});

function highlightSelection(selection, predictionClass) {
  const range = selection.getRangeAt(0);

  const span = document.createElement("span");
  span.style.borderBottom = "2px wavy red";
  span.style.cursor = "help";
  span.title = getTooltipText(predictionClass);
  span.style.fontFamily = "inherit";
  span.style.backgroundColor = "transparent"; // на всякий случай

  try {
    range.surroundContents(span);
  } catch (e) {
    console.warn("Не удалось обернуть выделение:", e);
  }
}

// Определяем текст подсказки по классу
function getTooltipText(predClass) {
  switch (predClass) {
    case 0: return "Подозрение на фишинг";
    case 1: return "Подозрение на спам";
    case 2: return "Подозрение на манипуляцию";
    default: return "Неизвестный класс";
  }
}

// Показываем всплывающее окно "ничего не найдено"
function showToaster(text, selection) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const toast = document.createElement("div");
  toast.textContent = text;
  toast.style.position = "fixed";
  toast.style.left = `${rect.left + window.scrollX}px`;
  toast.style.top = `${rect.top + window.scrollY - 40}px`;
  toast.style.backgroundColor = "#333";
  toast.style.color = "#fff";
  toast.style.padding = "8px 14px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "14px";
  toast.style.fontFamily = "sans-serif";
  toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
  toast.style.zIndex = 9999;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}
