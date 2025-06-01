// Editable Table Component using Handsontable for CSV Data
class EditableTable {
    constructor(containerId, data = []) {
        this.containerId = containerId;
        this.data = [...data];
        this.handsontableInstance = null;
        this.columns = [
            { key: 'timestamp', label: 'Data UTC', type: 'datetime-local', required: true },
            { key: 'user', label: 'User ID', type: 'text', required: true },
            { key: 'vrid', label: 'VRID', type: 'text', required: false },
            { key: 'scac', label: 'SCAC', type: 'text', required: false },
            { key: 'traktor', label: 'TRAKTOR', type: 'text', required: false },
            { key: 'trailer', label: 'TRAILER', type: 'text', required: false }
        ];
        this.callbacks = {
            onDataChange: null,
            onRowAdd: null,
            onRowDelete: null
        };
        this.init();
    }

    init() {
        if (!this.render()) {
            console.error('Failed to initialize editable table');
            return;
        }
        this.updateStats();
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID ${this.containerId} not found during render`);
            return false;
        }

        try {
            // Get available themes for select
            const availableThemes = window.themeManager ? window.themeManager.getAvailableHandsontableThemes() : {
                'ht-theme-main': 'Main Light',
                'ht-theme-horizon': 'Horizon Light',
                'ht-theme-main-dark': 'Main Dark',
                'ht-theme-horizon-dark': 'Horizon Dark',
                'ht-no-theme': 'No theme'
            };

            const themeOptions = Object.entries(availableThemes)
                .map(([value, label]) => `<option value="${value}">${label}</option>`)
                .join('');

            const currentTheme = window.themeManager ? window.themeManager.getHandsontableTheme() : 'ht-theme-main';

            container.innerHTML = `
                <div class="table-header">
                    <div class="header-left">
                        <h3 class="table-title">Edytor Tabeli</h3>
                        <span class="row-count">Wierszy: ${this.data.length}</span>
                    </div>
                    <div class="header-controls">
                        <div class="theme-selector">
                            <label for="handsontable-theme-select">🎨 Motyw tabeli (niezależny):</label>
                            <select id="handsontable-theme-select" class="form-select form-select-sm" title="Wybierz motyw dla Handsontable niezależnie od motywu strony">
                                ${themeOptions}
                            </select>
                        </div>
                        <button id="add-row" class="btn btn-primary btn-sm">
                            <i class="bi bi-plus-lg"></i> Dodaj wiersz
                        </button>
                        <button id="delete-row" class="btn btn-danger btn-sm">
                            <i class="bi bi-trash"></i> Usuń wiersz
                        </button>
                        <button id="export-csv" class="btn btn-success btn-sm">
                            <i class="bi bi-download"></i> Eksport CSV
                        </button>
                        <button id="import-csv" class="btn btn-info btn-sm">
                            <i class="bi bi-upload"></i> Import CSV
                        </button>
                    </div>
                </div>
                <div id="handsontable-container" class="handsontable-wrapper"></div>
                <input type="file" id="csv-file-input" accept=".csv" style="display: none;">
            `;

            // Set the current theme value and notify ThemeManager
            const themeSelect = document.getElementById('handsontable-theme-select');
            if (themeSelect && window.themeManager) {
                themeSelect.value = window.themeManager.getSelectedHandsontableTheme();

                // Directly set up the event listener here for better performance
                themeSelect.addEventListener('change', (e) => {
                    window.themeManager.setHandsontableTheme(e.target.value);
                });

                // Mark as ready for ThemeManager
                themeSelect.dataset.themeSetup = 'true';

                // Notify ThemeManager that selector is ready (alternative to MutationObserver)
                if (window.themeManager.setupHandsontableThemeSelect) {
                    // This will trigger the immediate setup in ThemeManager
                    setTimeout(() => window.themeManager.setupHandsontableThemeSelect(), 0);
                }
            }

            this.attachEventListeners();
            this.initHandsontable();

            return true;
        } catch (error) {
            console.error('Error rendering editable table:', error);
            return false;
        }
    }

    initHandsontable() {
        // Check if Handsontable is available
        if (typeof Handsontable === 'undefined') {
            console.error('Handsontable library is not loaded');
            const hotContainer = document.getElementById('handsontable-container');
            if (hotContainer) {
                hotContainer.innerHTML = `
                    <div class="alert alert-danger text-center">
                        <h6>Błąd ładowania</h6>
                        <p>Biblioteka Handsontable nie została załadowana. Sprawdź połączenie internetowe.</p>
                    </div>
                `;
            }
            return;
        }

        const hotContainer = document.getElementById('handsontable-container');
        if (!hotContainer) {
            console.error('Handsontable container not found');
            return;
        }

        // Apply theme class to container
        if (window.themeManager) {
            const themeClass = window.themeManager.getHandsontableTheme();
            hotContainer.classList.remove('ht-theme-main', 'ht-theme-horizon', 'ht-theme-main-dark', 'ht-theme-horizon-dark');
            if (themeClass && themeClass !== 'ht-no-theme') {
                hotContainer.classList.add(themeClass);
            }
        }

        // Prepare columns configuration
        const hotColumns = this.columns.map(col => ({
            data: col.key,
            title: col.label + (col.required ? ' *' : ''),
            type: col.type === 'datetime-local' ? 'date' : 'text',
            allowEmpty: !col.required,
            validator: col.required ? this.createRequiredValidator(col.label) : null
        }));

        // Initialize Handsontable with configuration
        this.handsontableInstance = new Handsontable(hotContainer, {
            data: this.data,
            columns: hotColumns,
            width: '100%',
            height: 700,

            // Core features
            rowHeaders: true,
            colHeaders: true,
            stretchH: 'all',
            autoWrapRow: true,
            autoWrapCol: true,

            // Interaction features
            fillHandle: true,
            comments: true,
            dragToScroll: true,
            manualRowMove: true,
            manualColumnMove: true,
            manualRowResize: true,
            manualColumnResize: true,

            // Professional features
            contextMenu: {
                items: {
                    'row_above': { name: 'Wstaw wiersz powyżej' },
                    'row_below': { name: 'Wstaw wiersz poniżej' },
                    'remove_row': { name: 'Usuń wiersz' },
                    'sep1': '---------',
                    'col_left': { name: 'Wstaw kolumnę po lewej' },
                    'col_right': { name: 'Wstaw kolumnę po prawej' },
                    'remove_col': { name: 'Usuń kolumnę' },
                    'sep2': '---------',
                    'undo': { name: 'Cofnij' },
                    'redo': { name: 'Ponów' },
                    'sep3': '---------',
                    'copy': { name: 'Kopiuj' },
                    'cut': { name: 'Wytnij' },
                    'paste': { name: 'Wklej' },
                    'sep4': '---------',
                    'alignment': { name: 'Wyrównanie' },
                    'borders': { name: 'Obramowanie' },
                    'make_read_only': { name: 'Tylko do odczytu' },
                    'clear_column': { name: 'Wyczyść kolumnę' }
                }
            },

            // Filters and sorting
            dropdownMenu: true,
            filters: true,
            columnSorting: true,
            sortIndicator: true,

            // Advanced features
            undo: true,
            outsideClickDeselects: false,
            selectionMode: 'multiple',
            mergeCells: false,

            // Validation and data quality
            allowInvalid: false,
            invalidCellClassName: 'validation-error',

            // Performance optimization
            renderAllRows: false,
            viewportRowRenderingOffset: 'auto',
            viewportColumnRenderingOffset: 'auto',

            // Callbacks for data management
            afterChange: (changes, source) => {
                if (source === 'loadData') return;
                this.handleDataChange(changes);
            },

            beforeValidate: (value, row, prop, source) => {
                return this.validateCell(value, row, prop, source);
            },

            afterValidate: (isValid, value, row, prop, source) => {
                this.handleValidationResult(isValid, value, row, prop, source);
            },

            afterCreateRow: (index, amount, source) => {
                if (source !== 'auto') {
                    this.updateRowCount();
                }
            },

            afterRemoveRow: (index, amount, source) => {
                this.updateRowCount();
            },

            licenseKey: 'non-commercial-and-evaluation'
        });

        // Setup theme change event listeners
        this.setupThemeEventListeners();
    }

    setupThemeEventListeners() {
        // Listen for main theme changes - ONLY if Handsontable is set to 'auto'
        document.addEventListener('themeChanged', (e) => {
            const hotContainer = document.getElementById('handsontable-container');
            if (hotContainer && window.themeManager && e.detail.isHandsontableAuto) {
                // Only update if Handsontable theme is set to 'auto'
                const newThemeClass = e.detail.handsontableTheme;
                window.themeManager.removeAllHandsontableThemes(hotContainer);
                if (newThemeClass && newThemeClass !== 'ht-no-theme' && newThemeClass !== 'auto') {
                    hotContainer.classList.add(newThemeClass);
                }

                // Update Handsontable instance class
                if (this.handsontableInstance && this.handsontableInstance.rootElement) {
                    window.themeManager.removeAllHandsontableThemes(this.handsontableInstance.rootElement);
                    if (newThemeClass && newThemeClass !== 'ht-no-theme' && newThemeClass !== 'auto') {
                        this.handsontableInstance.rootElement.classList.add(newThemeClass);
                    }
                }
            }
        });

        // Listen for Handsontable theme changes - ALWAYS apply these
        document.addEventListener('handsontableThemeChanged', (e) => {
            const hotContainer = document.getElementById('handsontable-container');
            const newTheme = e.detail.theme;
            const selectedTheme = e.detail.selectedTheme;

            // Always apply Handsontable theme changes regardless of main theme
            if (hotContainer && window.themeManager) {
                window.themeManager.removeAllHandsontableThemes(hotContainer);
                if (newTheme && newTheme !== 'ht-no-theme' && newTheme !== 'auto') {
                    hotContainer.classList.add(newTheme);
                }
            }

            // Update Handsontable instance class
            if (this.handsontableInstance && this.handsontableInstance.rootElement && window.themeManager) {
                window.themeManager.removeAllHandsontableThemes(this.handsontableInstance.rootElement);
                if (newTheme && newTheme !== 'ht-no-theme' && newTheme !== 'auto') {
                    this.handsontableInstance.rootElement.classList.add(newTheme);
                }
            }

            // Update select value to show what was actually selected (including 'auto')
            const themeSelect = document.getElementById('handsontable-theme-select');
            if (themeSelect && themeSelect.value !== selectedTheme) {
                themeSelect.value = selectedTheme;
            }
        });
    }

    createRequiredValidator(fieldName) {
        return function (value, callback) {
            if (value === null || value === undefined || value === '') {
                callback(false);
            } else {
                callback(true);
            }
        };
    }

    renderEmptyState() {
        return `
            <div class="empty-state text-center p-4">
                <i class="bi bi-table fs-1 text-muted mb-3"></i>
                <h6 class="text-muted">Brak danych do edycji</h6>
                <p class="text-muted small">Kliknij "Dodaj wiersz" aby rozpocząć dodawanie danych</p>
            </div>
        `;
    }

    attachEventListeners() {
        // Add Row Button
        const addRowBtn = document.getElementById('add-row');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => this.addRow());
        }

        // Export Button
        const exportBtn = document.getElementById('export-csv');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Import Button
        const importBtn = document.getElementById('import-csv');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }

        // Delete Row Button
        const deleteRowBtn = document.getElementById('delete-row');
        if (deleteRowBtn) {
            deleteRowBtn.addEventListener('click', () => this.deleteRow());
        }
    }

    addRow() {
        if (this.handsontableInstance) {
            const newRow = {
                timestamp: new Date().toISOString().slice(0, 16),
                user: '',
                vrid: '',
                scac: '',
                traktor: '',
                trailer: ''
            };

            const rowIndex = this.handsontableInstance.countRows();
            this.handsontableInstance.alter('insert_row_below', rowIndex - 1);


            // Set default timestamp
            this.handsontableInstance.setDataAtCell(rowIndex, 0, newRow.timestamp);

            this.data = this.handsontableInstance.getData();
            this.updateStats();
        }
    }

    deleteRow() {
        if (this.handsontableInstance && this.handsontableInstance.countRows() > 0) {
            if (confirm('Czy na pewno chcesz usunąć ten wiersz?')) {
                const rowIndex = this.handsontableInstance.countRows() - 1;
                this.handsontableInstance.alter('remove_row', rowIndex);
            }
        }
    }

    getData() {
        return this.handsontableInstance ? this.handsontableInstance.getData() : this.data;
    }

    setData(newData) {
        this.data = [...newData];
        if (this.handsontableInstance) {
            this.handsontableInstance.loadData(this.data);
        }
        this.updateStats();
    }

    addData(newData) {
        if (this.handsontableInstance) {
            const currentData = this.handsontableInstance.getData();
            const combinedData = [...currentData, ...newData];
            this.handsontableInstance.loadData(combinedData);
            this.data = combinedData;
        } else {
            this.data.push(...newData);
        }
        this.updateStats();
    }

    refreshTable() {
        if (this.handsontableInstance) {
            this.handsontableInstance.render();
        }
        this.updateStats();
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    updateStats() {
        const validRows = this.data.filter(row => row && row.timestamp && row.user).length;
        const statsElement = document.querySelector('.table-stats small');
        if (statsElement) {
            const originalText = 'Dwukrotne kliknięcie - edycja • Enter - nowy wiersz • Del - usuń komórkę • Ctrl+Z - cofnij';
            const statsText = this.data.length > 0 ?
                `${originalText} • Wierszy: ${this.data.length} • Poprawnych: ${validRows}` :
                originalText;
            statsElement.innerHTML = `<i class="bi bi-info-circle me-1"></i>${statsText}`;
        }

        // Update badge
        const badge = document.querySelector('.editable-table-header .badge');
        if (badge) {
            badge.textContent = this.data.length;
        }
    }

    handleDataChange(changes) {
        if (!changes) return;

        // Update internal data
        this.data = this.handsontableInstance.getData();
        this.updateRowCount();

        // Notify external callbacks
        if (this.callbacks.onDataChange) {
            this.callbacks.onDataChange(this.data);
        }

        // Show notification for significant changes
        if (changes.length > 10) {
            this.showToast(`Zaktualizowano ${changes.length} komórek`, 'info');
        }
    }

    validateCell(value, row, prop, source) {
        // Find column configuration
        const colIndex = this.handsontableInstance.propToCol(prop);
        const column = this.columns[colIndex];

        if (!column) return true;

        // Check required fields
        if (column.required && (!value || value.toString().trim() === '')) {
            return false;
        }

        // Type-specific validation
        if (column.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }

        if (column.type === 'number' && value !== '' && value !== null) {
            return !isNaN(value);
        }

        return true;
    }

    handleValidationResult(isValid, value, row, prop, source) {
        if (!isValid) {
            const cell = this.handsontableInstance.getCell(row, this.handsontableInstance.propToCol(prop));
            if (cell) {
                cell.style.background = 'var(--error-bg, #ffebee)';
                cell.style.color = 'var(--error-color, #c62828)';
                cell.title = 'Nieprawidłowa wartość';
            }

            // Show error message
            const column = this.columns[this.handsontableInstance.propToCol(prop)];
            const columnName = column ? column.label : 'pole';
            this.showToast(`Błąd walidacji w kolumnie "${columnName}"`, 'error');
        } else {
            // Clear error styling
            const cell = this.handsontableInstance.getCell(row, this.handsontableInstance.propToCol(prop));
            if (cell) {
                cell.style.background = '';
                cell.style.color = '';
                cell.title = '';
            }
        }
    }

    updateRowCount() {
        const rowCountElement = document.querySelector('.row-count');
        if (rowCountElement && this.handsontableInstance) {
            const count = this.handsontableInstance.countRows();
            rowCountElement.textContent = `Wierszy: ${count}`;
        }
    }

    exportData() {
        if (this.data.length === 0) {
            this.showToast('Brak danych do eksportu', 'warning');
            return;
        }

        if (window.csvLoader) {
            const filename = `handsontable_dane_${new Date().toISOString().split('T')[0]}.csv`;
            window.csvLoader.downloadCSV(this.data, filename);
            this.showToast(`Wyeksportowano ${this.data.length} rekordów`, 'success');
        } else {
            this.showToast('Moduł eksportu CSV nie jest dostępny', 'danger');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.txt';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                if (window.csvLoader) {
                    const result = await window.csvLoader.loadFile(file);
                    const newData = window.csvLoader.parseCSV(result.content);

                    if (this.data.length > 0) {
                        if (confirm('Czy chcesz zastąpić istniejące dane, czy dodać nowe?')) {
                            // Replace
                            this.setData(newData);
                            this.showToast(`Zastąpiono dane - załadowano ${newData.length} rekordów`, 'info');
                        } else {
                            // Append
                            this.addData(newData);
                            this.showToast(`Dodano ${newData.length} nowych rekordów`, 'success');
                        }
                    } else {
                        this.setData(newData);
                        this.showToast(`Załadowano ${newData.length} rekordów`, 'success');
                    }

                    if (this.callbacks.onDataChange) {
                        this.callbacks.onDataChange(this.data);
                    }
                } else {
                    this.showToast('Moduł importu CSV nie jest dostępny', 'danger');
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showToast(`Błąd importu: ${error.message}`, 'danger');
            }
        };
        input.click();
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    destroy() {
        if (this.handsontableInstance) {
            this.handsontableInstance.destroy();
            this.handsontableInstance = null;
        }
    }
}

// Global instance will be created when needed
window.EditableTable = EditableTable;
window.EditableTable = EditableTable; 