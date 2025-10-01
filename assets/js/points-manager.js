// points-manager.js
export function initPoints(getPoints, setPoints, saveHistory, renderPoints) {
  const mainImage = document.getElementById("mainImage");

  mainImage.addEventListener("click", (e) => {
    if (!mainImage.src || !mainImage.complete) return;

    const rect = mainImage.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const currentPoints = getPoints();
    const id = currentPoints.length + 1;
    const newPoints = [...currentPoints, { id, relX, relY }];

    setPoints(newPoints);
    saveHistory();
    renderPoints();
  });
}

export function renderPoints(pointsContainer, points, mainImage, pointSize, pointOpacity, showNumbers, updateCounter) {
  pointsContainer.innerHTML = "";

  if (!mainImage.src || !mainImage.complete) {
    if (updateCounter) updateCounter();
    return;
  }

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
    pointEl.textContent = showNumbers ? p.id.toString() : "";
    pointsContainer.appendChild(pointEl);
  });

  if (updateCounter) updateCounter();
}