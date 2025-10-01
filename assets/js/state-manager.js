// assets/js/state-manager.js

class StateManager {
    constructor() {
        this.storageKey = 'pointCounterState';
        this.state = {
            version: '1.0',
            image: null,
            points: [],
            settings: {
                color: '#ff0000',
                size: 5,
                opacity: 80,
                borderOpacity: 100,
                showNumbers: true
            },
            lastUpdated: null
        };
    }

    init(app) {
        this.app = app;
        return Promise.resolve();
    }

    saveState() {
        try {
            // Собираем актуальное состояние из всех модулей
            const currentState = this._collectCurrentState();

            // Подготавливаем данные для сохранения
            const stateToSave = this._prepareStateForSave(currentState);

            // Сохраняем в localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));

            console.log('State saved successfully');
            return true;

        } catch (error) {
            console.error('Failed to save state:', error);
            return false;
        }
    }

    loadState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) {
                console.log('No saved state found');
                return null;
            }

            const parsedState = JSON.parse(saved);

            // Валидация и миграция состояния если нужно
            const validatedState = this._validateState(parsedState);

            console.log('State loaded successfully');
            return validatedState;

        } catch (error) {
            console.error('Failed to load state:', error);
            this._clearCorruptedState();
            return null;
        }
    }

    getState() {
        return this.loadState() || this._getDefaultState();
    }

    _collectCurrentState() {
        const imageHandler = this.app.getImageHandler();
        const pointsManager = this.app.getPointsManager();
        const uiController = this.app.getUIController();

        return {
            version: '1.0',
            image: imageHandler.getImageState(),
            points: pointsManager.getPoints(),
            settings: uiController.getCurrentSettings(),
            lastUpdated: new Date().toISOString()
        };
    }

    _prepareStateForSave(state) {
        // Убеждаемся, что данные сериализуемы
        return {
            ...state,
            points: state.points.map(point => ({
                ...point,
                // Убеждаемся, что нет циклических ссылок или DOM элементов
                element: undefined
            })),
            image: state.image ? {
                ...state.image,
                // Очищаем временные данные если есть
                transform: state.image.transform || null
            } : null
        };
    }

    _validateState(state) {
        // Базовая валидация структуры состояния
        if (!state || typeof state !== 'object') {
            return this._getDefaultState();
        }

        // Проверяем обязательные поля
        const validatedState = {
            version: state.version || '1.0',
            image: this._validateImageState(state.image),
            points: this._validatePointsState(state.points),
            settings: this._validateSettingsState(state.settings),
            lastUpdated: state.lastUpdated || new Date().toISOString()
        };

        return validatedState;
    }

    _validateImageState(imageState) {
        if (!imageState || typeof imageState !== 'object') {
            return null;
        }

        // Проверяем обязательные поля для изображения
        if (!imageState.src || !imageState.name) {
            return null;
        }

        return {
            src: imageState.src,
            name: imageState.name,
            size: imageState.size || 0,
            type: imageState.type || 'image/jpeg',
            transform: imageState.transform || {
                scale: 1,
                offsetX: 0,
                offsetY: 0
            }
        };
    }

    _validatePointsState(points) {
        if (!Array.isArray(points)) {
            return [];
        }

        return points
            .filter(point =>
                point &&
                typeof point === 'object' &&
                typeof point.id === 'number' &&
                typeof point.x === 'number' && point.x >= 0 && point.x <= 1 &&
                typeof point.y === 'number' && point.y >= 0 && point.y <= 1
            )
            .map(point => ({
                id: point.id,
                x: Math.max(0, Math.min(1, point.x)),
                y: Math.max(0, Math.min(1, point.y)),
                number: point.number || 1,
                color: point.color || '#ff0000',
                size: point.size || 5,
                opacity: point.opacity || 80,
                borderOpacity: point.borderOpacity || 100,
                showNumber: point.showNumber !== undefined ? point.showNumber : true
            }));
    }

    _validateSettingsState(settings) {
        if (!settings || typeof settings !== 'object') {
            return this._getDefaultSettings();
        }

        return {
            color: typeof settings.color === 'string' ? settings.color : '#ff0000',
            size: typeof settings.size === 'number' ? Math.max(2, Math.min(20, settings.size)) : 5,
            opacity: typeof settings.opacity === 'number' ? Math.max(10, Math.min(100, settings.opacity)) : 80,
            borderOpacity: typeof settings.borderOpacity === 'number' ? Math.max(0, Math.min(100, settings.borderOpacity)) : 100,
            showNumbers: typeof settings.showNumbers === 'boolean' ? settings.showNumbers : true
        };
    }

    _getDefaultState() {
        return {
            version: '1.0',
            image: null,
            points: [],
            settings: this._getDefaultSettings(),
            lastUpdated: new Date().toISOString()
        };
    }

    _getDefaultSettings() {
        return {
            color: '#ff0000',
            size: 5,
            opacity: 80,
            borderOpacity: 100,
            showNumbers: true
        };
    }

    _clearCorruptedState() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Corrupted state cleared');
        } catch (error) {
            console.error('Failed to clear corrupted state:', error);
        }
    }

    clearState() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('State cleared successfully');
            return true;
        } catch (error) {
            console.error('Failed to clear state:', error);
            return false;
        }
    }

    getStorageInfo() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) {
                return { exists: false, size: 0 };
            }

            return {
                exists: true,
                size: new Blob([saved]).size,
                lastUpdated: this.state.lastUpdated
            };
        } catch (error) {
            return { exists: false, size: 0, error: error.message };
        }
    }

    // Метод для миграции состояния при обновлениях версий
    _migrateState(state) {
        if (!state.version) {
            // Миграция с версии без version
            return {
                version: '1.0',
                image: state.image || null,
                points: state.points || [],
                settings: state.settings || this._getDefaultSettings(),
                lastUpdated: state.lastUpdated || new Date().toISOString()
            };
        }

        return state;
    }
}