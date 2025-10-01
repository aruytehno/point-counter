// ui-controller.js
export function initUIControls(toggleNumbers, pointSizeInput, pointOpacityInput, renderPoints, saveSettings) {
  let showNumbers = toggleNumbers.checked;
  let pointSize = parseInt(pointSizeInput.value);
  let pointOpacity = parseInt(pointOpacityInput.value) / 100;

  toggleNumbers.addEventListener("change", () => {
    showNumbers = toggleNumbers.checked;
    if (saveSettings) {
      saveSettings(showNumbers, pointSize, pointOpacity);
    }
    if (renderPoints) {
      renderPoints();
    }
  });

  pointSizeInput.addEventListener("input", () => {
    pointSize = parseInt(pointSizeInput.value);
    if (saveSettings) {
      saveSettings(showNumbers, pointSize, pointOpacity);
    }
    if (renderPoints) {
      renderPoints();
    }
  });

  pointOpacityInput.addEventListener("input", () => {
    pointOpacity = parseInt(pointOpacityInput.value) / 100;
    if (saveSettings) {
      saveSettings(showNumbers, pointSize, pointOpacity);
    }
    if (renderPoints) {
      renderPoints();
    }
  });

  return { showNumbers, pointSize, pointOpacity };
}