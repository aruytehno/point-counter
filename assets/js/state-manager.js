// state-manager.js
export function saveToLocalStorage(mainImage, points) {
  if (mainImage.src.startsWith("data:image")) {
    localStorage.setItem("imageSrc", mainImage.src);
  }
  localStorage.setItem("points", JSON.stringify(points));
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

  let showNumbers = true;
  let pointSize = 20;
  let pointOpacity = 1;

  if (savedImage) mainImage.src = savedImage;
  if (savedPoints) points.push(...JSON.parse(savedPoints));
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

  renderPoints();
  return { showNumbers, pointSize, pointOpacity };
}