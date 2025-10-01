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
  const pointSizeValue = document.getElementById("pointSizeValue");
  const pointOpacityValue = document.getElementById("pointOpacityValue");

  // Установка начальных значений
  toggleNumbers.checked = getShowNumbers();
  pointSizeInput.value = getPointSize();
  pointOpacityInput.value = Math.round(getPointOpacity() * 100);

  // Установка начальных значений для отображения
  pointSizeValue.textContent = getPointSize();
  pointOpacityValue.textContent = Math.round(getPointOpacity() * 100);

  toggleNumbers.addEventListener("change", () => {
    setShowNumbers(toggleNumbers.checked);
    saveSettings();
    renderPoints();
  });

  pointSizeInput.addEventListener("input", () => {
    const value = parseInt(pointSizeInput.value);
    setPointSize(value);
    pointSizeValue.textContent = value;
    saveSettings();
    renderPoints();
  });

  pointOpacityInput.addEventListener("input", () => {
    const value = parseInt(pointOpacityInput.value);
    setPointOpacity(value / 100);
    pointOpacityValue.textContent = value;
    saveSettings();
    renderPoints();
  });
}