// Data Transformer Module from incsv.html
class DataTransformer {
    constructor() {
        this.vehiclePatterns = {
            tractor: [
                /^[A-Z]{3}\d{5}$/i,
                /^[A-Z]{2,3}\d{4,6}$/i,
                /^\d{3,4}[A-Z]{2,3}$/i,
                /^[A-Z0-9]{4,6}$/i
            ],
            trailer: [
                /^[A-Z0-9]{4,8}$/i,
                /^[A-Z]{2,3}\d{4,6}$/i,
                /^[A-Z]{2,3}\d{4,6}[A-Z]?$/i,
                /^\d{4,6}[A-Z]{2,3}$/i
            ],
            scac: /^[A-Z]{2,4}$/i
        };
    }

    // Main data processing function adapted from incsv.html
    processData(rawData) {
        const table1Map = new Map(); // User activity grouped
        const table2Map = new Map(); // VRID/SCAC grouped

        const processRow = (row) => {
            if (!row.timestamp || !row.user) {
                return;
            }

            const key = `${row.timestamp}_${row.user}`;
            const [tractor, trailer, extractedScac] = this.processVehicleData(row);

            this.processTable1Data(table1Map, key, row, tractor, trailer);
            this.processTable2Data(table2Map, key, row, tractor, trailer, extractedScac);
        };

        // Process each row
        rawData.forEach(processRow);

        // Convert maps to arrays and format data
        const transformedData = {
            userActivity: this.convertMapToArray(table1Map, row => ({
                traktor: Array.from(row.traktor).join("\n"),
                trailer: Array.from(row.trailer).join("\n")
            })),
            vridScacData: this.convertMapToArray(table2Map, row => ({
                vrid: Array.from(row.vrid).join("\n"),
                scac: Array.from(row.scac).join("\n"),
                traktor: Array.from(row.traktor).join("\n"),
                trailer: Array.from(row.trailer).join("\n")
            }))
        };

        console.log('Data transformed:', transformedData);
        return transformedData;
    }

    // Process vehicle data from row
    processVehicleData(row) {
        const tractor = row.traktor?.trim() || '';
        const trailer = row.trailer?.trim() || '';

        // Extract SCAC from trailer if it follows VS pattern
        let extractedScac = '';
        if (trailer.toUpperCase().startsWith('VS')) {
            const match = trailer.match(/^VS([A-Z]{2,4})/i);
            if (match) {
                extractedScac = match[1];
            }
        }

        return [tractor, trailer, extractedScac];
    }

    // Process data for user activity table (table1)
    processTable1Data(map, key, row, tractor, trailer) {
        if (!map.has(key)) {
            map.set(key, {
                timestamp: row.timestamp,
                user: row.user,
                traktor: new Set(),
                trailer: new Set()
            });
        }

        this.addVehicleIfValid(map.get(key).traktor, tractor);
        this.addVehicleIfValid(map.get(key).trailer, trailer);
    }

    // Process data for VRID/SCAC table (table2)
    processTable2Data(map, key, row, tractor, trailer, extractedScac) {
        if (!map.has(key)) {
            map.set(key, {
                timestamp: row.timestamp,
                user: row.user,
                vrid: new Set(),
                scac: new Set(),
                traktor: new Set(),
                trailer: new Set()
            });
        }

        this.addDataIfValid(map.get(key).vrid, row.vrid);
        this.addDataIfValid(map.get(key).scac, row.scac);
        this.addDataIfValid(map.get(key).scac, extractedScac);
        this.addVehicleIfValid(map.get(key).traktor, tractor);
        this.addVehicleIfValid(map.get(key).trailer, trailer);
    }

    // Helper functions
    addVehicleIfValid(set, value) {
        if (value && value.trim()) {
            set.add(value.trim().toUpperCase());
        }
    }

    addDataIfValid(set, value) {
        if (!value) return;
        const cleanValue = value.trim();
        if (cleanValue && !set.has(cleanValue)) {
            set.add(cleanValue);
        }
    }

    convertMapToArray(map, formatFunction) {
        return Array.from(map.values()).map(row => ({
            ...row,
            ...formatFunction(row)
        }));
    }

    // Data validation functions
    validateData(data) {
        const errors = [];
        const warnings = [];

        data.forEach((row, index) => {
            // Validate timestamp
            if (row.timestamp && isNaN(new Date(row.timestamp).getTime())) {
                errors.push(`Row ${index + 1}: Invalid date format`);
            }

            // Validate user
            if (!row.user || !row.user.trim()) {
                errors.push(`Row ${index + 1}: Missing user ID`);
            }

            // Validate vehicles
            if (row.traktor && !this.isValidTractor(row.traktor)) {
                warnings.push(`Row ${index + 1}: Invalid tractor format`);
            }

            if (row.trailer && !this.isValidTrailer(row.trailer)) {
                warnings.push(`Row ${index + 1}: Invalid trailer format`);
            }

            if (row.scac && !this.isValidSCAC(row.scac)) {
                warnings.push(`Row ${index + 1}: Invalid SCAC format`);
            }
        });

        return { errors, warnings };
    }

    // Vehicle validation patterns
    isValidTractor(tractor) {
        if (!tractor) return false;
        return this.vehiclePatterns.tractor.some(pattern =>
            pattern.test(tractor.trim())
        );
    }

    isValidTrailer(trailer) {
        if (!trailer) return false;
        return this.vehiclePatterns.trailer.some(pattern =>
            pattern.test(trailer.trim())
        );
    }

    isValidSCAC(scac) {
        if (!scac) return false;
        return this.vehiclePatterns.scac.test(scac.trim());
    }

    // Data cleaning functions
    cleanData(data) {
        return data.map(row => ({
            timestamp: this.formatDate(row.timestamp),
            user: row.user?.trim(),
            vrid: row.vrid?.trim(),
            scac: row.scac?.trim().toUpperCase(),
            traktor: row.traktor?.trim().toUpperCase(),
            trailer: row.trailer?.trim().toUpperCase()
        }));
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toISOString().replace('T', ' ').substring(0, 19);
    }

    // Generate data statistics
    generateStats(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                totalRecords: 0,
                uniqueUsers: 0,
                dateRange: null,
                vehicleStats: { tractors: 0, trailers: 0, vsTrailers: 0 },
                dataQuality: { valid: 0, missing: 0, errors: 0 }
            };
        }

        const uniqueUsers = new Set(data.map(row => row.user)).size;
        const dates = data.map(row => new Date(row.timestamp)).filter(d => !isNaN(d.getTime()));

        const dateRange = dates.length > 0 ? {
            start: new Date(Math.min(...dates)),
            end: new Date(Math.max(...dates))
        } : null;

        // Vehicle statistics
        const tractors = new Set(data.map(row => row.traktor).filter(t => t)).size;
        const trailers = new Set(data.map(row => row.trailer).filter(t => t)).size;
        const vsTrailers = data.filter(row =>
            row.trailer?.toUpperCase().includes('VS')
        ).length;

        // Data quality
        const validRecords = data.filter(row =>
            row.timestamp && row.user && (row.traktor || row.trailer)
        ).length;

        const missingData = data.filter(row =>
            !row.timestamp || !row.user
        ).length;

        const errors = data.filter(row =>
            row.timestamp && isNaN(new Date(row.timestamp).getTime())
        ).length;

        return {
            totalRecords: data.length,
            uniqueUsers,
            dateRange,
            vehicleStats: { tractors, trailers, vsTrailers },
            dataQuality: {
                valid: (validRecords / data.length) * 100,
                missing: (missingData / data.length) * 100,
                errors
            }
        };
    }

    // Group data by time periods
    groupByTimePeriod(data, period = 'day') {
        const groups = {};

        data.forEach(row => {
            const date = new Date(row.timestamp);
            if (isNaN(date.getTime())) return;

            let key;
            switch (period) {
                case 'hour':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
                    break;
                case 'day':
                    key = date.toLocaleDateString();
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toLocaleDateString();
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                default:
                    key = date.toLocaleDateString();
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(row);
        });

        return groups;
    }

    // Filter data by criteria
    filterData(data, criteria) {
        return data.filter(row => {
            // Date range filter
            if (criteria.dateFrom || criteria.dateTo) {
                const rowDate = new Date(row.timestamp);
                if (isNaN(rowDate.getTime())) return false;

                if (criteria.dateFrom && rowDate < new Date(criteria.dateFrom)) return false;
                if (criteria.dateTo && rowDate > new Date(criteria.dateTo)) return false;
            }

            // User filter
            if (criteria.user && !row.user?.toLowerCase().includes(criteria.user.toLowerCase())) {
                return false;
            }

            // Vehicle filter
            if (criteria.vehicle) {
                const vehicle = criteria.vehicle.toLowerCase();
                const hasVehicle =
                    row.traktor?.toLowerCase().includes(vehicle) ||
                    row.trailer?.toLowerCase().includes(vehicle);
                if (!hasVehicle) return false;
            }

            // SCAC filter
            if (criteria.scac && !row.scac?.toLowerCase().includes(criteria.scac.toLowerCase())) {
                return false;
            }

            // VRID filter
            if (criteria.vrid && !row.vrid?.toLowerCase().includes(criteria.vrid.toLowerCase())) {
                return false;
            }

            return true;
        });
    }
}

// Create global instance
window.dataTransformer = new DataTransformer();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataTransformer;
} 