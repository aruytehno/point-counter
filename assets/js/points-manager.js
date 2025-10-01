 // points-manager.js
export function initPoints(mainImage, points, saveHistory, renderPoints) {
  mainImage.addEventListener("click", (e) => {
    if (!mainImage.src) return;

    const rect = mainImage.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const id = points.length + 1;
    points.push({ id, relX, relY });

    saveHistory();
    renderPoints();
  });
}

export function renderPointsLayer(pointsContainer, points, mainImage, pointSize, pointOpacity, showNumbers, updateCounter) {
  pointsContainer.innerHTML = "";
  const rect = mainImage.getBoundingClientRect();
  points.forEach((p) => {
    const pointEl = document.createElement("div");
    pointEl.className = "point";

    const x = p.relX * rect.width;
    const y = p.relY * rect.height;

    pointEl.style.left = `${x}px`;
    pointEl.style.top = `${y}px`;
    pointEl.style.width = `${pointSize}px`;
    pointEl.style.height = `${pointSize}px`;
    pointEl.style.opacity = pointOpacity;
    pointEl.textContent = showNumbers ? p.id : "";
    pointsContainer.appendChild(pointEl);
  });
  updateCounter();
}
