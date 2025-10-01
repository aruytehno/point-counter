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

  // Зум колесом мыши
  container.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // шаг
    scale *= delta;

    // Ограничим масштаб
    if (scale < 0.1) scale = 0.1;
    if (scale > 10) scale = 10;

    applyTransform();
  });

  // Панорамирование (drag)
  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - originX;
    startY = e.clientY - originY;
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    originX = e.clientX - startX;
    originY = e.clientY - startY;
    applyTransform();
  });

  container.addEventListener("mouseup", () => {
    isDragging = false;
  });

  container.addEventListener("mouseleave", () => {
    isDragging = false;
  });
}
