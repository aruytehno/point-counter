// points-manager.js
export function initPoints(getPoints, setPoints, saveHistory, renderPoints) {
  const mainImage = document.getElementById("mainImage");
  const zoomWrapper = document.getElementById("zoom-wrapper");
  const imageContainer = document.getElementById("image-container");

  zoomWrapper.addEventListener("click", (e) => {
    if (!mainImage.src || !mainImage.complete) return;

    // Получаем трансформацию zoom-wrapper
    const transform = window.getComputedStyle(zoomWrapper).transform;
    let matrix = new DOMMatrix(transform);

    // Координаты клика относительно image-container
    const containerRect = imageContainer.getBoundingClientRect();
    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    // Преобразуем координаты с учетом трансформации
    // Для этого нужно инвертировать трансформацию
    const inverseMatrix = matrix.inverse();
    const transformedPoint = inverseMatrix.transformPoint(
      new DOMPoint(containerX, containerY)
    );

    // Теперь transformedPoint - координаты в непревознесенном пространстве zoom-wrapper
    const clickX = transformedPoint.x;
    const clickY = transformedPoint.y;

    // Переводим в относительные (от natural размера картинки)
    const relX = clickX / mainImage.width;
    const relY = clickY / mainImage.height;

    // Проверяем, что клик был внутри изображения
    if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1) {
      const currentPoints = getPoints();
      const id = currentPoints.length + 1;
      const newPoints = [...currentPoints, { id, relX, relY }];

      setPoints(newPoints);
      saveHistory();
      renderPoints();
    }
  });
}

export function renderPoints(pointsContainer, points, mainImage, pointSize, pointOpacity, showNumbers, updateCounter) {
  pointsContainer.innerHTML = "";

  if (!mainImage.src || !mainImage.complete) {
    if (updateCounter) updateCounter();
    return;
  }

  // Используем фактические размеры (внутри zoomWrapper)
  const imgWidth = mainImage.width;
  const imgHeight = mainImage.height;

  points.forEach((p) => {
    const pointEl = document.createElement("div");
    pointEl.className = "point";

    // Восстанавливаем абсолютные координаты из относительных
    const x = p.relX * imgWidth;
    const y = p.relY * imgHeight;

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