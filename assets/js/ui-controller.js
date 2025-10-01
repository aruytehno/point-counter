// ui-controller.js
export function initUIControls(
  getShowNumbers,
  getPointSize,
  getPointOpacity,
  setShowNumbers,
  setPointSize,
  setPointOpacity,
  renderPoints,
  saveSettings
) {
  const toggleNumbers = document.getElementById("toggleNumbers");
  const pointSizeInput = document.getElementById("pointSize");
  const pointOpacityInput = document.getElementById("pointOpacity");

  // Установка начальных значений
  toggleNumbers.checked = getShowNumbers();
  pointSizeInput.value = getPointSize();
  pointOpacityInput.value = Math.round(getPointOpacity() * 100);

  toggleNumbers.addEventListener("change", () => {
    setShowNumbers(toggleNumbers.checked);
    saveSettings();
    renderPoints();
  });

  pointSizeInput.addEventListener("input", () => {
    setPointSize(parseInt(pointSizeInput.value));
    saveSettings();
    renderPoints();
  });

  pointOpacityInput.addEventListener("input", () => {
    setPointOpacity(parseInt(pointOpacityInput.value) / 100);
    saveSettings();
    renderPoints();
  });
}