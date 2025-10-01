// assets/js/points-manager.js

class PointsManager {
    constructor() {
        this.points = [];
        this.pointsLayer = null;
        this.nextPointId = 1;
        this.currentSettings = {
            color: '#ff0000',
            size: 5,
            opacity: 80,
            borderOpacity: 100,
            showNumbers: true
        };

        this.draggingPoint = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.pointStartX = 0;
        this.pointStartY = 0;
    }

    init(app) {
        this.app = app;
        this.pointsLayer = document.getElementById('points-layer');

        this._setupEventListeners();
        return Promise.resolve();
    }

    _setupEventListeners() {
        // Клик по контейнеру для добавления точек
        this.pointsLayer.parentElement.addEventListener('click', this._handleContainerClick.bind(this));

        // Глобальные события для перетаскивания
        document.addEventListener('mousemove', this._handleMouseMove.bind(this));
        document.addEventListener('mouseup', this._handleMouseUp.bind(this));
    }

    _handleContainerClick(e) {
        // Если клик по крестику удаления - обрабатывается в _handlePointClick
        if (e.target.classList.contains('point-delete')) return;

        // Если клик по точке - активируем её
        const pointElement = e.target.closest('.point');
        if (pointElement) {
            this._handlePointClick(pointElement, e);
            return;
        }

        // Если клик по пустой области и есть изображение - добавляем точку
        if (this.app.getImageHandler().hasImage()) {
            const rect = this.pointsLayer.getBoundingClientRect();
            const imageCoords = this.app.getImageHandler().screenToImageCoordinates(e.clientX, e.clientY);
            this.app.addPoint(imageCoords.x, imageCoords.y);
        }
    }

    _handlePointClick(pointElement, e) {
        const pointId = pointElement.dataset.pointId;
        const point = this.points.find(p => p.id == pointId);

        if (!point) return;

        // Если клик по крестику - удаляем точку
        if (e.target.classList.contains('point-delete')) {
            this.app.removePoint(pointId);
            return;
        }

        // Активируем точку (показываем крестик)
        this._activatePoint(pointId);

        // Начинаем перетаскивание если не был короткий клик
        if (!this._isClick(e)) {
            this._startDragging(point, e);
        }
    }

    _isClick(e) {
        // Простой способ отличить клик от начала перетаскивания
        return !this.draggingPoint;
    }

    _startDragging(point, e) {
        this.draggingPoint = point;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.pointStartX = point.x;
        this.pointStartY = point.y;

        point.element.classList.add('dragging');
    }

    _handleMouseMove(e) {
        if (!this.draggingPoint) return;

        const imageHandler = this.app.getImageHandler();
        const currentCoords = imageHandler.screenToImageCoordinates(e.clientX, e.clientY);
        const startCoords = imageHandler.screenToImageCoordinates(this.dragStartX, this.dragStartY);

        const deltaX = currentCoords.x - startCoords.x;
        const deltaY = currentCoords.y - startCoords.y;

        const newX = Math.max(0, Math.min(1, this.pointStartX + deltaX));
        const newY = Math.max(0, Math.min(1, this.pointStartY + deltaY));

        this._updatePointPosition(this.draggingPoint.id, newX, newY, false);
    }

    _handleMouseUp() {
        if (this.draggingPoint) {
            this.draggingPoint.element.classList.remove('dragging');

            // Если точка переместилась, записываем в историю
            if (this.pointStartX !== this.draggingPoint.x || this.pointStartY !== this.draggingPoint.y) {
                this.app.movePoint(this.draggingPoint.id, this.draggingPoint.x, this.draggingPoint.y);
            }

            this.draggingPoint = null;
        }
    }

    addPoint(x, y, silent = false) {
        const point = {
            id: this.nextPointId++,
            x: x,
            y: y,
            number: this.points.length + 1,
            color: this.currentSettings.color,
            size: this.currentSettings.size,
            opacity: this.currentSettings.opacity,
            borderOpacity: this.currentSettings.borderOpacity,
            showNumber: this.currentSettings.showNumbers,
            element: null
        };

        this.points.push(point);
        this._createPointElement(point);

        if (!silent) {
            this._renumberPoints();
        }

        return point;
    }

    removePoint(pointId, silent = true) {
        const pointIndex = this.points.findIndex(p => p.id == pointId);
        if (pointIndex === -1) return null;

        const point = this.points[pointIndex];

        // Удаляем DOM элемент
        if (point.element) {
            point.element.classList.add('removing');
            setTimeout(() => {
                if (point.element && point.element.parentNode) {
                    point.element.parentNode.removeChild(point.element);
                }
            }, 200);
        }

        this.points.splice(pointIndex, 1);

        if (!silent) {
            this._renumberPoints();
        }

        return point;
    }

    restorePoint(pointData, silent = true) {
        const point = {
            ...pointData,
            element: null
        };

        // Обновляем nextPointId если нужно
        this.nextPointId = Math.max(this.nextPointId, point.id + 1);

        this.points.push(point);
        this._createPointElement(point);

        if (!silent) {
            this._renumberPoints();
        }

        return point;
    }

    movePoint(pointId, newX, newY, silent = true) {
        const point = this.points.find(p => p.id == pointId);
        if (!point) return null;

        const oldPosition = { x: point.x, y: point.y };

        point.x = Math.max(0, Math.min(1, newX));
        point.y = Math.max(0, Math.min(1, newY));

        this._updatePointElementPosition(point);

        return oldPosition;
    }

    _createPointElement(point) {
        const pointElement = document.createElement('div');
        pointElement.className = 'point new';
        pointElement.dataset.pointId = point.id;

        const numberElement = document.createElement('div');
        numberElement.className = 'point-number';
        numberElement.textContent = point.number;

        const deleteElement = document.createElement('div');
        deleteElement.className = 'point-delete';
        deleteElement.innerHTML = '×';

        pointElement.appendChild(numberElement);
        pointElement.appendChild(deleteElement);

        this.pointsLayer.appendChild(pointElement);
        point.element = pointElement;

        this._updatePointElementAppearance(point);
        this._updatePointElementPosition(point);

        // Убираем класс анимации после её завершения
        setTimeout(() => {
            pointElement.classList.remove('new');
        }, 300);
    }

    _updatePointElementAppearance(point) {
        if (!point.element) return;

        const borderAlpha = point.borderOpacity / 100;
        const fillAlpha = point.opacity / 100;

        point.element.style.backgroundColor = `rgba(${this._hexToRgb(point.color)}, ${fillAlpha})`;
        point.element.style.borderColor = `rgba(0, 0, 0, ${borderAlpha})`;
        point.element.style.width = `${point.size * 2}px`;
        point.element.style.height = `${point.size * 2}px`;

        const numberElement = point.element.querySelector('.point-number');
        numberElement.style.display = point.showNumber ? 'block' : 'none';
        numberElement.textContent = point.number;
    }

    _updatePointElementPosition(point) {
        if (!point.element) return;

        const screenCoords = this.app.getImageHandler().imageToScreenCoordinates(point.x, point.y);
        point.element.style.left = `${screenCoords.x}px`;
        point.element.style.top = `${screenCoords.y}px`;
    }

    _activatePoint(pointId) {
        // Деактивируем все точки
        this.points.forEach(p => {
            if (p.element) {
                p.element.classList.remove('active');
            }
        });

        // Активируем выбранную точку
        const point = this.points.find(p => p.id == pointId);
        if (point && point.element) {
            point.element.classList.add('active');
        }
    }

    _renumberPoints() {
        this.points.forEach((point, index) => {
            point.number = index + 1;
            this._updatePointElementAppearance(point);
        });
    }

    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '255, 0, 0';
    }

    updateAllPointsAppearance(settings) {
        this.currentSettings = { ...settings };

        this.points.forEach(point => {
            point.color = settings.color;
            point.size = settings.size;
            point.opacity = settings.opacity;
            point.borderOpacity = settings.borderOpacity;
            point.showNumber = settings.showNumbers;

            this._updatePointElementAppearance(point);
        });
    }

    restorePoints(pointsData, silent = true) {
        this.clearPoints();

        pointsData.forEach(pointData => {
            this.restorePoint(pointData, true);
        });

        if (!silent) {
            this._renumberPoints();
        }
    }

    clearPoints() {
        // Удаляем все DOM элементы
        this.points.forEach(point => {
            if (point.element && point.element.parentNode) {
                point.element.parentNode.removeChild(point.element);
            }
        });

        this.points = [];
    }

    getPoints() {
        return this.points.map(point => ({
            ...point,
            element: null // Исключаем DOM элемент при сериализации
        }));
    }

    getPointsCount() {
        return this.points.length;
    }
}