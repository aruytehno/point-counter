// points-manager.js
export function initPoints(getPoints, setPoints, saveHistory, renderPoints) {
  const mainImage = document.getElementById("mainImage");
  const zoomWrapper = document.getElementById("zoom-wrapper");
  const imageContainer = document.getElementById("image-container");

  zoomWrapper.addEventListener("click", (e) => {
    if (!mainImage.src || !mainImage.complete) return;

    const transform = window.getComputedStyle(zoomWrapper).transform;
    const matrix = new DOMMatrix(transform);

    const containerRect = imageContainer.getBoundingClientRect();
    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    const inverseMatrix = matrix.inverse();
    const transformedPoint = inverseMatrix.transformPoint(
      new DOMPoint(containerX, containerY)
    );

    const clickX = transformedPoint.x;
    const clickY = transformedPoint.y;

    const relX = clickX / mainImage.width;
    const relY = clickY / mainImage.height;

    if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1) {
      const currentPoints = getPoints();
      const id = currentPoints.length + 1;
      const newPoints = [...currentPoints, { id, relX, relY }];

      setPoints(newPoints);
      saveHistory();
      renderPoints(pointsContainer, getPoints(), mainImage);
    }
  });
}

export function renderPoints(pointsContainer, points, mainImage, pointSize = 20, pointOpacity = 1, showNumbers = true, updateCounter) {
  pointsContainer.innerHTML = "";

  if (!mainImage.src || !mainImage.complete) {
    if (updateCounter) updateCounter();
    return;
  }

  const zoomWrapper = document.getElementById("zoom-wrapper");
  const imgWidth = mainImage.width;
  const imgHeight = mainImage.height;

  // Получаем текущий масштаб
  const transform = window.getComputedStyle(zoomWrapper).transform;
  const matrix = new DOMMatrix(transform);
  const scaleX = matrix.a; // масштаб по X
  const scaleY = matrix.d; // масштаб по Y

  points.forEach((p) => {
    const pointEl = document.createElement("div");
    pointEl.className = "point";

    let x = p.relX * imgWidth;
    let y = p.relY * imgHeight;

    pointEl.style.left = `${x}px`;
    pointEl.style.top = `${y}px`;
    pointEl.style.width = `${pointSize}px`;
    pointEl.style.height = `${pointSize}px`;
    pointEl.style.opacity = pointOpacity;
    pointEl.textContent = showNumbers ? p.id.toString() : "";
    pointsContainer.appendChild(pointEl);

    // --- Drag & Drop ---
    pointEl.addEventListener("mousedown", (e) => {
      e.stopPropagation(); // чтобы клик по точке не создавал новую
      const startX = e.clientX;
      const startY = e.clientY;
      const startRelX = p.relX;
      const startRelY = p.relY;

      function onMouseMove(moveEvent) {
        const dx = (moveEvent.clientX - startX) / scaleX;
        const dy = (moveEvent.clientY - startY) / scaleY;

        p.relX = startRelX + dx / imgWidth;
        p.relY = startRelY + dy / imgHeight;

        // Ограничиваем в пределах изображения
        p.relX = Math.min(Math.max(p.relX, 0), 1);
        p.relY = Math.min(Math.max(p.relY, 0), 1);

        renderPoints(pointsContainer, points, mainImage, pointSize, pointOpacity, showNumbers, updateCounter);
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });

  if (updateCounter) updateCounter();
}
