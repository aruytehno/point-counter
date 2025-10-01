 // history-manager.js
export function saveHistory(points, history, historyIndex, saveToLocalStorage) {
  history = history.slice(0, historyIndex + 1);
  history.push(JSON.stringify(points));
  historyIndex++;
  saveToLocalStorage();
  return historyIndex;
}

export function undo(points, history, historyIndex, renderPoints, saveToLocalStorage) {
  if (historyIndex > 0) {
    historyIndex--;
    points.length = 0;
    points.push(...JSON.parse(history[historyIndex]));
    renderPoints();
    saveToLocalStorage();
  }
  return historyIndex;
}

export function redo(points, history, historyIndex, renderPoints, saveToLocalStorage) {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    points.length = 0;
    points.push(...JSON.parse(history[historyIndex]));
    renderPoints();
    saveToLocalStorage();
  }
  return historyIndex;
}
