// history-manager.js
export function saveHistory(points, history, historyIndex, saveToLocalStorage) {
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(JSON.stringify(points));
  const newHistoryIndex = historyIndex + 1;
  saveToLocalStorage();
  return { historyIndex: newHistoryIndex, history: newHistory };
}

export function undo(points, history, historyIndex, renderPoints, saveToLocalStorage) {
  if (historyIndex > 0) {
    const newHistoryIndex = historyIndex - 1;
    const newPoints = JSON.parse(history[newHistoryIndex]);
    renderPoints();
    saveToLocalStorage();
    return { historyIndex: newHistoryIndex, points: newPoints };
  }
  return { historyIndex, points };
}

export function redo(points, history, historyIndex, renderPoints, saveToLocalStorage) {
  if (historyIndex < history.length - 1) {
    const newHistoryIndex = historyIndex + 1;
    const newPoints = JSON.parse(history[newHistoryIndex]);
    renderPoints();
    saveToLocalStorage();
    return { historyIndex: newHistoryIndex, points: newPoints };
  }
  return { historyIndex, points };
}

export function initHistory(undoBtn, redoBtn, getPoints, getHistory, getHistoryIndex, setPoints, setHistoryIndex, renderPoints, saveToLocalStorage) {
  // Функция для обновления состояния кнопок
  const updateButtons = () => {
    const historyIndex = getHistoryIndex();
    const history = getHistory();
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
  };

  // Обновляем кнопки при изменении истории
  updateButtons();
}