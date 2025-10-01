// assets/js/image-handler.js

class ImageHandler {
    constructor() {
        this.imageElement = null;
        this.container = null;
        this.placeholder = null;
        this.currentImage = null;

        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
    }

    init(app) {
        this.app = app;

        this.imageElement = document.getElementById('main-image');
        this.container = document.getElementById('image-container');
        this.placeholder = document.getElementById('no-image-placeholder');

        this._setupEventListeners();

        return Promise.resolve();
    }

    _setupEventListeners() {
        // Масштабирование колесиком мыши
        this.container.addEventListener('wheel', this._handleWheel.bind(this), { passive: false });

        // Перетаскивание изображения
        this.container.addEventListener('mousedown', this._handleMouseDown.bind(this));
        document.addEventListener('mousemove', this._handleMouseMove.bind(this));
        document.addEventListener('mouseup', this._handleMouseUp.bind(this));

        // Предотвращение контекстного меню на изображении
        this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    async loadImage(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Please select a valid image file'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                this.currentImage = {
                    src: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type
                };

                this._displayImage();
                this._updateImageInfo();
                resolve(this.currentImage);
            };

            reader.onerror = () => reject(new Error('Failed to load image'));
            reader.readAsDataURL(file);
        });
    }

    async loadImageFromState(imageState) {
        this.currentImage = imageState;
        this._displayImage();
        this._updateImageInfo();

        if (imageState.transform) {
            this.scale = imageState.transform.scale || 1;
            this.offsetX = imageState.transform.offsetX || 0;
            this.offsetY = imageState.transform.offsetY || 0;
            this._applyTransform();
        }
    }

    _displayImage() {
        this.imageElement.src = this.currentImage.src;
        this.imageElement.style.display = 'block';
        this.placeholder.style.display = 'none';

        // Сброс трансформаций для нового изображения
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.imageElement.onload = () => {
            this._applyTransform();
            this._centerImage();
        };
    }

    _updateImageInfo() {
        const infoElement = document.getElementById('image-info');
        if (this.currentImage) {
            const sizeInKB = Math.round(this.currentImage.size / 1024);
            infoElement.textContent = `${this.currentImage.name} (${sizeInKB} KB)`;
        } else {
            infoElement.textContent = 'Изображение не загружено';
        }
    }

    _centerImage() {
        if (!this.imageElement.complete) return;

        const containerRect = this.container.getBoundingClientRect();
        const imgWidth = this.imageElement.naturalWidth * this.scale;
        const imgHeight = this.imageElement.naturalHeight * this.scale;

        this.offsetX = (containerRect.width - imgWidth) / 2;
        this.offsetY = (containerRect.height - imgHeight) / 2;

        this._applyTransform();
    }

    _applyTransform() {
        this.imageElement.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
    }

    _handleWheel(e) {
        e.preventDefault();

        const rect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta = -e.deltaY / 1000;
        const zoomFactor = 1 + delta;

        const oldScale = this.scale;
        this.scale = Math.max(0.1, Math.min(5, this.scale * zoomFactor));

        // Масштабирование относительно курсора мыши
        const scaleChange = this.scale / oldScale;
        this.offsetX = mouseX - (mouseX - this.offsetX) * scaleChange;
        this.offsetY = mouseY - (mouseY - this.offsetY) * scaleChange;

        this._applyTransform();
    }

    _handleMouseDown(e) {
        if (e.button !== 0 || !this.currentImage) return; // Только левая кнопка мыши

        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.container.classList.add('grabbing');
    }

    _handleMouseMove(e) {
        if (!this.isDragging || !this.currentImage) return;

        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;

        this.offsetX += deltaX;
        this.offsetY += deltaY;

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        this._applyTransform();
    }

    _handleMouseUp() {
        this.isDragging = false;
        this.container.classList.remove('grabbing');
    }

    // Преобразование координат из экранных в относительные (от 0 до 1)
    screenToImageCoordinates(screenX, screenY) {
        if (!this.imageElement.complete) return { x: 0, y: 0 };

        const rect = this.container.getBoundingClientRect();
        const relativeX = (screenX - rect.left - this.offsetX) / this.scale;
        const relativeY = (screenY - rect.top - this.offsetY) / this.scale;

        const naturalWidth = this.imageElement.naturalWidth;
        const naturalHeight = this.imageElement.naturalHeight;

        return {
            x: relativeX / naturalWidth,
            y: relativeY / naturalHeight
        };
    }

    // Преобразование относительных координат в экранные
    imageToScreenCoordinates(relativeX, relativeY) {
        if (!this.imageElement.complete) return { x: 0, y: 0 };

        const naturalWidth = this.imageElement.naturalWidth;
        const naturalHeight = this.imageElement.naturalHeight;

        const screenX = relativeX * naturalWidth * this.scale + this.offsetX;
        const screenY = relativeY * naturalHeight * this.scale + this.offsetY;

        return { x: screenX, y: screenY };
    }

    getImageState() {
        if (!this.currentImage) return null;

        return {
            ...this.currentImage,
            transform: {
                scale: this.scale,
                offsetX: this.offsetX,
                offsetY: this.offsetY
            }
        };
    }

    resetImage() {
        this.currentImage = null;
        this.imageElement.src = '';
        this.imageElement.style.display = 'none';
        this.placeholder.style.display = 'flex';

        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this._updateImageInfo();
    }

    hasImage() {
        return this.currentImage !== null;
    }

    saveImageWithPoints(points) {
        if (!this.hasImage()) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = this.imageElement.naturalWidth;
        canvas.height = this.imageElement.naturalHeight;

        // Рисуем исходное изображение
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);

            // Рисуем точки
            points.forEach(point => {
                const x = point.x * canvas.width;
                const y = point.y * canvas.height;

                ctx.fillStyle = point.color;
                ctx.beginPath();
                ctx.arc(x, y, point.size, 0, 2 * Math.PI);
                ctx.fill();

                if (point.showNumber) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(point.number.toString(), x, y);
                }
            });

            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = `counted-${this.currentImage.name}`;
            link.href = canvas.toDataURL();
            link.click();
        };

        img.src = this.currentImage.src;
    }
}