// CSV File Loader Module
class CSVLoader {
    constructor() {
        this.supportedFormats = ['.csv', '.txt'];
        this.encoding = 'UTF-8';
    }

    // Load file from file input
    loadFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Nie wybrano pliku'));
                return;
            }

            if (!this.isValidFormat(file.name)) {
                reject(new Error('Nieobsługiwany format pliku. Obsługiwane: .csv, .txt'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;
                console.log(`Wczytano plik: ${file.name} (${file.size} bytes)`);
                resolve({
                    content: content,
                    fileName: file.name,
                    fileSize: file.size,
                    lastModified: new Date(file.lastModified)
                });
            };

            reader.onerror = () => {
                reject(new Error('Błąd podczas czytania pliku'));
            };

            reader.readAsText(file, this.encoding);
        });
    }

    // Load file from URL/path
    async loadFromURL(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();
            const fileName = url.split('/').pop() || 'unknown.csv';

            return {
                content: content,
                fileName: fileName,
                fileSize: content.length,
                lastModified: new Date()
            };
        } catch (error) {
            throw new Error(`Nie można wczytać pliku z URL: ${error.message}`);
        }
    }

    // Parse CSV content with improved algorithm from beta.html
    parseCSV(content) {
        if (!content || !content.trim()) {
            return [];
        }

        try {
            const lines = content.split('\n');
            const result = [];
            let currentLine = [];
            let isInQuotes = false;
            let quotedContent = [];

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                // Detect separator: tab > comma > semicolon
                let columns;
                if (trimmedLine.includes('\t')) {
                    columns = trimmedLine.split('\t');
                } else if (trimmedLine.includes(',')) {
                    columns = trimmedLine.split(',');
                } else if (trimmedLine.includes(';')) {
                    columns = trimmedLine.split(';');
                } else {
                    // Single column or space-separated
                    columns = [trimmedLine];
                }

                // Handle quoted fields
                for (const col of columns) {
                    const trimmedCol = col.trim();

                    if (!isInQuotes && trimmedCol.startsWith('"')) {
                        isInQuotes = true;
                        quotedContent = [trimmedCol.substring(1)];
                    } else if (isInQuotes) {
                        if (trimmedCol.endsWith('"')) {
                            isInQuotes = false;
                            quotedContent.push(trimmedCol.substring(0, trimmedCol.length - 1));
                            currentLine.push('"' + quotedContent.join(' ') + '"');
                        } else {
                            quotedContent.push(trimmedCol);
                        }
                    } else {
                        currentLine.push(trimmedCol);
                    }
                }

                // Process complete line
                if (!isInQuotes && currentLine.length > 0) {
                    if (currentLine.length >= 3) {
                        const rowData = {
                            timestamp: (currentLine[0] || '').trim().replace(/"/g, ''),
                            user: (currentLine[1] || '').trim().replace(/"/g, ''),
                            vrid: (currentLine[2] || '').trim().replace(/"/g, ''),
                            scac: (currentLine[3] || '').trim().replace(/"/g, ''),
                            traktor: (currentLine[4] || '').trim().replace(/"/g, ''),
                            trailer: (currentLine[5] || '').trim().replace(/"/g, '')
                        };

                        // Skip empty rows
                        if (rowData.timestamp || rowData.user || rowData.vrid) {
                            result.push(rowData);
                        }
                    }
                    currentLine = [];
                }
            }

            console.log(`Sparsowano ${result.length} wierszy z CSV`);
            return result;

        } catch (error) {
            console.error('Błąd parsowania CSV:', error);
            throw new Error(`Błąd parsowania CSV: ${error.message}`);
        }
    }

    // Validate file format
    isValidFormat(fileName) {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        return this.supportedFormats.includes(extension);
    }

    // Get file statistics
    getFileStats(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                totalRows: 0,
                validRows: 0,
                emptyRows: 0,
                duplicates: 0
            };
        }

        const validRows = data.filter(row =>
            row.timestamp || row.user || row.vrid
        ).length;

        const vrids = data.map(row => row.vrid).filter(vrid => vrid);
        const uniqueVrids = new Set(vrids);
        const duplicates = vrids.length - uniqueVrids.size;

        return {
            totalRows: data.length,
            validRows: validRows,
            emptyRows: data.length - validRows,
            duplicates: duplicates
        };
    }

    // Export data to CSV format
    exportToCSV(data, separator = ',') {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        const headers = ['Data UTC', 'User ID', 'VRID', 'SCAC', 'TRAKTOR', 'TRAILER'];
        const csvContent = [
            headers.join(separator),
            ...data.map(row => [
                row.timestamp || '',
                row.user || '',
                row.vrid || '',
                row.scac || '',
                row.traktor || '',
                row.trailer || ''
            ].join(separator))
        ].join('\n');

        return csvContent;
    }

    // Download data as file
    downloadCSV(data, fileName = 'export.csv', separator = ',') {
        const csvContent = this.exportToCSV(data, separator);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }
}

// Create global instance
window.csvLoader = new CSVLoader();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVLoader;
} 