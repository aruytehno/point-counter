// state-manager.js
export function saveToLocalStorage(mainImage, points) {
  if (mainImage.src && mainImage.src.startsWith("data:image")) {
    localStorage.setItem("imageSrc", mainImage.src);
  }
  localStorage.setItem("points", JSON.stringify(points));

  // Сохраняем историю для синхронизации
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  const historyIndex = parseInt(localStorage.getItem("historyIndex") || "-1");

  // Обновляем историю текущим состоянием
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(JSON.stringify(points));
  const newHistoryIndex = historyIndex + 1;

  localStorage.setItem("history", JSON.stringify(newHistory));
  localStorage.setItem("historyIndex", newHistoryIndex.toString());
}

export function saveSettings(showNumbers, pointSize, pointOpacity) {
  localStorage.setItem("showNumbers", showNumbers);
  localStorage.setItem("pointSize", pointSize);
  localStorage.setItem("pointOpacity", pointOpacity);
}

export function loadFromLocalStorage(mainImage, points, toggleNumbers, pointSizeInput, pointOpacityInput, renderPoints) {
  const savedImage = localStorage.getItem("imageSrc");
  const savedPoints = localStorage.getItem("points");
  const savedShowNumbers = localStorage.getItem("showNumbers");
  const savedPointSize = localStorage.getItem("pointSize");
  const savedPointOpacity = localStorage.getItem("pointOpacity");
  const savedHistory = localStorage.getItem("history");
  const savedHistoryIndex = localStorage.getItem("historyIndex");

  let showNumbers = true;
  let pointSize = 20;
  let pointOpacity = 1;

  if (savedImage) mainImage.src = savedImage;
  if (savedPoints) {
    // Очищаем массив и добавляем сохраненные точки
    points.length = 0;
    const parsedPoints = JSON.parse(savedPoints);
    points.push(...parsedPoints);
  }
  if (savedShowNumbers !== null) {
    showNumbers = savedShowNumbers === "true";
    toggleNumbers.checked = showNumbers;
  }
  if (savedPointSize) {
    pointSize = parseInt(savedPointSize);
    pointSizeInput.value = pointSize;
  }
  if (savedPointOpacity) {
    pointOpacity = parseFloat(savedPointOpacity);
    pointOpacityInput.value = Math.round(pointOpacity * 100);
  }

  // Загружаем историю
  if (savedHistory && savedHistoryIndex !== null) {
    // История будет обработана в основном приложении
  }

  if (renderPoints) {
    renderPoints();
  }

  return {
    showNumbers,
    pointSize,
    pointOpacity,
    history: savedHistory ? JSON.parse(savedHistory) : [],
    historyIndex: savedHistoryIndex ? parseInt(savedHistoryIndex) : -1
  };
}