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
  const selectedText = range.toString();
  if (!selectedText.trim()) return;

  // Создаём элемент с подчёркиванием
  const underline = document.createElement("span");
  underline.textContent = selectedText;
  underline.style.borderBottom = "2px wavy red";
  underline.style.cursor = "help";
  underline.title = getTooltipText(predictionClass);
  underline.style.fontFamily = "inherit";
  underline.style.backgroundColor = "transparent";
  underline.style.display = "inline";

  // Удаляем содержимое и вставляем нашу обёртку
  range.deleteContents();
  range.insertNode(underline);

  // Снимаем выделение, чтобы было аккуратно
  selection.removeAllRanges();
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
