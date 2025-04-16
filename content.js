// Вставляем стили один раз
(function injectStyles() {
  if (document.getElementById("suspect-underline-style")) return;

  const style = document.createElement("style");
  style.id = "suspect-underline-style";
  style.textContent = `
    .suspect-underline {
      text-decoration: underline wavy red;
      text-decoration-thickness: 2px;
      cursor: help;
      position: relative;
      font-family: Arial, sans-serif; /* Один и тот же шрифт */
    }
    .suspect-underline:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      background-color: #333;
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      top: 120%;
      left: 0;
      white-space: nowrap;
      z-index: 9999;
      font-size: 12px;
      pointer-events: none;
      font-family: Arial, sans-serif; /* Один и тот же шрифт */
    }
    .toast-message {
      background-color: #323232;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      font-size: 14px;
      z-index: 999999;
      opacity: 0;
      transition: opacity 0.3s ease;
      max-width: 300px;
      pointer-events: none;
      font-family: Arial, sans-serif; /* Один и тот же шрифт */
    }
  `;
  document.head.appendChild(style);
})();

// Показывает всплывающее сообщение рядом с выделением
function showToastNearSelection(message) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const toast = document.createElement("div");
  toast.id = "suspect-toast";
  toast.className = "toast-message";
  toast.textContent = message;

  toast.style.position = "absolute";
  toast.style.left = `${rect.left + rect.width / 2 + window.scrollX - 75}px`;
  toast.style.top = `${rect.top + window.scrollY - 50}px`;
  toast.style.opacity = "0";

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Получаем сообщение от background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlight" && request.data) {
    const { class: messageClass } = request.data;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const selectedText = selection.toString();
    if (!selectedText.trim()) return;

    if (messageClass === 3) {
      showToastNearSelection("Ничего не найдено!");
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.className = "suspect-underline";
    span.textContent = selectedText;

    let tooltip = "Подозрение на неизвестную угрозу";
    if (messageClass === 0) tooltip = "Подозрение на фишинг";
    else if (messageClass === 1) tooltip = "Подозрение на спам";
    else if (messageClass === 2) tooltip = "Подозрение на манипуляцию";

    span.setAttribute("data-tooltip", tooltip);

    range.deleteContents();
    range.insertNode(span);
    selection.removeAllRanges();
  }
});
