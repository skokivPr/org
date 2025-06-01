// Data Buffer Module - Advanced data caching and management
class DataBuffer {
    constructor() {
        this.buffers = new Map();
        this.maxBufferSize = 10; // Maximum number of buffers to keep
        this.currentBufferId = null;
        this.bufferHistory = [];

        // Storage keys
        this.storageKeys = {
            buffers: 'csv_data_buffers',
            current: 'csv_current_buffer',
            history: 'csv_buffer_history'
        };

        this.loadFromStorage();
    }

    // Create new buffer from data
    createBuffer(name, data, transformedData = null) {
        const bufferId = this.generateBufferId();
        const buffer = {
            id: bufferId,
            name: name || `Buffer ${this.buffers.size + 1}`,
            created: new Date(),
            lastAccessed: new Date(),
            originalData: this.cloneData(data),
            transformedData: transformedData ? this.cloneData(transformedData) : null,
            stats: null,
            validation: null,
            metadata: {
                recordCount: data.length,
                hasTransformed: !!transformedData,
                size: JSON.stringify(data).length
            }
        };

        // Generate stats if transformer is available
        if (window.dataTransformer) {
            buffer.stats = window.dataTransformer.generateStats(data);
            buffer.validation = window.dataTransformer.validateData(data);
        }

        this.buffers.set(bufferId, buffer);
        this.currentBufferId = bufferId;
        this.addToHistory(bufferId);
        this.cleanupOldBuffers();
        this.saveToStorage();

        console.log(`Created buffer: ${buffer.name} (${buffer.metadata.recordCount} records)`);
        return bufferId;
    }

    // Get buffer by ID
    getBuffer(bufferId) {
        const buffer = this.buffers.get(bufferId);
        if (buffer) {
            buffer.lastAccessed = new Date();
            this.saveToStorage();
        }
        return buffer;
    }

    // Get current active buffer
    getCurrentBuffer() {
        return this.currentBufferId ? this.getBuffer(this.currentBufferId) : null;
    }

    // Set current buffer
    setCurrentBuffer(bufferId) {
        if (this.buffers.has(bufferId)) {
            this.currentBufferId = bufferId;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Get all buffers list
    getBuffersList() {
        return Array.from(this.buffers.values()).map(buffer => ({
            id: buffer.id,
            name: buffer.name,
            created: buffer.created,
            lastAccessed: buffer.lastAccessed,
            recordCount: buffer.metadata.recordCount,
            hasTransformed: buffer.metadata.hasTransformed,
            size: this.formatSize(buffer.metadata.size)
        }));
    }

    // Update buffer data
    updateBuffer(bufferId, newData, transformedData = null) {
        const buffer = this.buffers.get(bufferId);
        if (!buffer) return false;

        buffer.originalData = this.cloneData(newData);
        buffer.transformedData = transformedData ? this.cloneData(transformedData) : null;
        buffer.lastAccessed = new Date();
        buffer.metadata.recordCount = newData.length;
        buffer.metadata.hasTransformed = !!transformedData;
        buffer.metadata.size = JSON.stringify(newData).length;

        // Update stats
        if (window.dataTransformer) {
            buffer.stats = window.dataTransformer.generateStats(newData);
            buffer.validation = window.dataTransformer.validateData(newData);
        }

        this.saveToStorage();
        return true;
    }

    // Rename buffer
    renameBuffer(bufferId, newName) {
        const buffer = this.buffers.get(bufferId);
        if (buffer) {
            buffer.name = newName;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Delete buffer
    deleteBuffer(bufferId) {
        if (this.buffers.delete(bufferId)) {
            if (this.currentBufferId === bufferId) {
                this.currentBufferId = null;
            }
            this.bufferHistory = this.bufferHistory.filter(id => id !== bufferId);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Clear all buffers
    clearAllBuffers() {
        this.buffers.clear();
        this.currentBufferId = null;
        this.bufferHistory = [];
        this.saveToStorage();
    }

    // Transform data in buffer
    transformBufferData(bufferId) {
        const buffer = this.buffers.get(bufferId);
        if (!buffer || !window.dataTransformer) return false;

        try {
            const cleanedData = window.dataTransformer.cleanData(buffer.originalData);
            const transformedData = window.dataTransformer.processData(cleanedData);

            buffer.transformedData = this.cloneData(transformedData);
            buffer.metadata.hasTransformed = true;
            buffer.lastAccessed = new Date();

            // Update stats
            buffer.stats = window.dataTransformer.generateStats(cleanedData);
            buffer.validation = window.dataTransformer.validateData(cleanedData);

            this.saveToStorage();
            return transformedData;
        } catch (error) {
            console.error('Transform error:', error);
            return false;
        }
    }

    // Export buffer data
    exportBuffer(bufferId, format = 'csv') {
        const buffer = this.buffers.get(bufferId);
        if (!buffer) return null;

        const data = buffer.originalData;
        const filename = `${buffer.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}`;

        if (window.csvLoader) {
            switch (format) {
                case 'csv':
                    return window.csvLoader.exportToCSV(data);
                case 'download':
                    window.csvLoader.downloadCSV(data, `${filename}.csv`);
                    return true;
                default:
                    return window.csvLoader.exportToCSV(data);
            }
        }

        return null;
    }

    // Compare two buffers
    compareBuffers(bufferId1, bufferId2) {
        const buffer1 = this.buffers.get(bufferId1);
        const buffer2 = this.buffers.get(bufferId2);

        if (!buffer1 || !buffer2) return null;

        const data1 = buffer1.originalData;
        const data2 = buffer2.originalData;

        // Find common records
        const common = [];
        const unique1 = [];
        const unique2 = [];

        data1.forEach(row1 => {
            const found = data2.find(row2 =>
                row1.timestamp === row2.timestamp &&
                row1.user === row2.user &&
                row1.vrid === row2.vrid
            );
            if (found) {
                common.push(row1);
            } else {
                unique1.push(row1);
            }
        });

        data2.forEach(row2 => {
            const found = data1.find(row1 =>
                row1.timestamp === row2.timestamp &&
                row1.user === row2.user &&
                row1.vrid === row2.vrid
            );
            if (!found) {
                unique2.push(row2);
            }
        });

        return {
            common: common,
            unique1: unique1,
            unique2: unique2,
            stats: {
                total1: data1.length,
                total2: data2.length,
                commonCount: common.length,
                unique1Count: unique1.length,
                unique2Count: unique2.length,
                similarity: (common.length / Math.max(data1.length, data2.length) * 100).toFixed(1)
            }
        };
    }

    // Search in buffers
    searchInBuffers(query) {
        const results = [];
        const searchQuery = query.toLowerCase();

        this.buffers.forEach((buffer, bufferId) => {
            const matches = buffer.originalData.filter(row =>
                Object.values(row).some(value =>
                    String(value).toLowerCase().includes(searchQuery)
                )
            );

            if (matches.length > 0) {
                results.push({
                    bufferId: bufferId,
                    bufferName: buffer.name,
                    matches: matches,
                    matchCount: matches.length
                });
            }
        });

        return results;
    }

    // Helper methods
    generateBufferId() {
        return 'buffer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    cloneData(data) {
        return JSON.parse(JSON.stringify(data));
    }

    addToHistory(bufferId) {
        this.bufferHistory = this.bufferHistory.filter(id => id !== bufferId);
        this.bufferHistory.unshift(bufferId);
        if (this.bufferHistory.length > this.maxBufferSize) {
            this.bufferHistory = this.bufferHistory.slice(0, this.maxBufferSize);
        }
    }

    cleanupOldBuffers() {
        if (this.buffers.size > this.maxBufferSize) {
            const sortedBuffers = Array.from(this.buffers.entries())
                .sort((a, b) => new Date(a[1].lastAccessed) - new Date(b[1].lastAccessed));

            const toDelete = sortedBuffers.slice(0, this.buffers.size - this.maxBufferSize);
            toDelete.forEach(([bufferId]) => {
                this.deleteBuffer(bufferId);
            });
        }
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Storage methods
    saveToStorage() {
        try {
            const bufferData = {};
            this.buffers.forEach((buffer, id) => {
                bufferData[id] = buffer;
            });

            localStorage.setItem(this.storageKeys.buffers, JSON.stringify(bufferData));
            localStorage.setItem(this.storageKeys.current, this.currentBufferId || '');
            localStorage.setItem(this.storageKeys.history, JSON.stringify(this.bufferHistory));
        } catch (error) {
            console.warn('Could not save buffers to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const bufferData = localStorage.getItem(this.storageKeys.buffers);
            if (bufferData) {
                const parsed = JSON.parse(bufferData);
                Object.entries(parsed).forEach(([id, buffer]) => {
                    // Restore dates
                    buffer.created = new Date(buffer.created);
                    buffer.lastAccessed = new Date(buffer.lastAccessed);
                    this.buffers.set(id, buffer);
                });
            }

            this.currentBufferId = localStorage.getItem(this.storageKeys.current) || null;

            const historyData = localStorage.getItem(this.storageKeys.history);
            if (historyData) {
                this.bufferHistory = JSON.parse(historyData);
            }
        } catch (error) {
            console.warn('Could not load buffers from localStorage:', error);
        }
    }

    // Get buffer statistics
    getBufferStats() {
        const buffers = Array.from(this.buffers.values());
        return {
            totalBuffers: buffers.length,
            totalRecords: buffers.reduce((sum, buffer) => sum + buffer.metadata.recordCount, 0),
            totalSize: buffers.reduce((sum, buffer) => sum + buffer.metadata.size, 0),
            transformedBuffers: buffers.filter(buffer => buffer.metadata.hasTransformed).length,
            oldestBuffer: buffers.length > 0 ? buffers.reduce((oldest, buffer) =>
                buffer.created < oldest.created ? buffer : oldest
            ) : null,
            newestBuffer: buffers.length > 0 ? buffers.reduce((newest, buffer) =>
                buffer.created > newest.created ? buffer : newest
            ) : null
        };
    }
}

// Create global instance
window.dataBuffer = new DataBuffer();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataBuffer;
} 