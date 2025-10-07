// zoom-handler.js
export function initZoomAndPan(containerId) {
  const wrapper = document.getElementById("zoom-wrapper");
  const container = document.getElementById(containerId);

  let scale = 1;
  let originX = 0;
  let originY = 0;
  let isDragging = false;
  let startX, startY;

  function applyTransform() {
    wrapper.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
  }

  // Зум колесом мыши с учетом позиции курсора
  container.addEventListener("wheel", (e) => {
    e.preventDefault();

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = scale * delta;

    // Ограничим масштаб
    if (newScale < 0.1) return;
    if (newScale > 10) return;

    // Вычисляем смещение для масштабирования к курсору
    const scaleFactor = newScale / scale;
    originX = mouseX - (mouseX - originX) * scaleFactor;
    originY = mouseY - (mouseY - originY) * scaleFactor;

    scale = newScale;
    applyTransform();
  });

  // Панорамирование (drag)
  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - originX;
    startY = e.clientY - originY;
    container.style.cursor = 'grabbing';
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    originX = e.clientX - startX;
    originY = e.clientY - startY;
    applyTransform();
  });

  container.addEventListener("mouseup", () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener("mouseleave", () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  // Инициализация курсора
  container.style.cursor = 'grab';
  applyTransform();
}