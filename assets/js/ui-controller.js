// ui-controller.js
export function initUIControls(toggleNumbers, pointSizeInput, pointOpacityInput, renderPoints, saveSettings) {
  let showNumbers = toggleNumbers.checked;
  let pointSize = parseInt(pointSizeInput.value);
  let pointOpacity = parseInt(pointOpacityInput.value) / 100;

  toggleNumbers.addEventListener("change", () => {
    showNumbers = toggleNumbers.checked;
    saveSettings(showNumbers, pointSize, pointOpacity);
    renderPoints();
  });

  pointSizeInput.addEventListener("input", () => {
    pointSize = parseInt(pointSizeInput.value);
    saveSettings(showNumbers, pointSize, pointOpacity);
    renderPoints();
  });

  pointOpacityInput.addEventListener("input", () => {
    pointOpacity = parseInt(pointOpacityInput.value) / 100;
    saveSettings(showNumbers, pointSize, pointOpacity);
    renderPoints();
  });

  return { showNumbers, pointSize, pointOpacity };
}
