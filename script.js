// File Upload Component using CSVLoader
const FileUpload = ({ onFileLoad }) => {
    const fileInputRef = React.useRef();

    // Configure Chart.js defaults for better visibility
    React.useEffect(() => {
        if (window.Chart) {
            // Function to get computed CSS values
            const getComputedColor = (property) => {
                const computedStyle = getComputedStyle(document.documentElement);
                return computedStyle.getPropertyValue(property).trim();
            };

            // Update Chart.js defaults with computed colors
            const updateChartDefaults = () => {
                // Get theme to determine fallback colors
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

                const textPrimary = '#898989';
                const textSecondary = '#222';
                const bgSecondary = '#898989';
                const bgCard = '#ccc';
                const borderColor = '#898989';

                Chart.defaults.color = textPrimary;
                Chart.defaults.borderColor = borderColor;
                Chart.defaults.backgroundColor = bgSecondary;
                Chart.defaults.font.family = "'Share Tech Mono', monospace";
                Chart.defaults.font.size = 14;
                Chart.defaults.font.weight = '500';
                Chart.defaults.elements.arc.borderWidth = 2;
                Chart.defaults.elements.arc.hoverBorderWidth = 3;
                Chart.defaults.elements.line.borderWidth = 3;
                Chart.defaults.elements.line.tension = 0.4;
                Chart.defaults.elements.point.radius = 5;
                Chart.defaults.elements.point.hoverRadius = 7;
                Chart.defaults.elements.point.borderWidth = 2;
                Chart.defaults.elements.bar.borderWidth = 2;
                Chart.defaults.plugins.legend.labels.usePointStyle = true;
                Chart.defaults.plugins.legend.labels.padding = 20;
                Chart.defaults.plugins.legend.labels.color = textPrimary;
                Chart.defaults.plugins.tooltip.backgroundColor = bgCard;
                Chart.defaults.plugins.tooltip.titleColor = textPrimary;
                Chart.defaults.plugins.tooltip.bodyColor = textSecondary;
                Chart.defaults.plugins.tooltip.borderColor = borderColor;
                Chart.defaults.plugins.tooltip.borderWidth = 2;
                Chart.defaults.plugins.tooltip.cornerRadius = 8;
                Chart.defaults.plugins.tooltip.padding = 12;
                Chart.defaults.scale.grid.color = borderColor;
                Chart.defaults.scale.ticks.color = textSecondary;
                Chart.defaults.scale.title.color = textPrimary;

                console.log('Chart.js colors updated:', {
                    theme: isDark ? 'dark' : 'light',
                    textPrimary,
                    textSecondary,
                    bgCard,
                    borderColor
                });
            };

            // Initial setup
            updateChartDefaults();

            // Listen for theme changes
            const handleThemeChange = () => {
                setTimeout(() => {
                    updateChartDefaults();
                    console.log('Chart colors updated due to theme change');
                }, 100);
            };

            document.addEventListener('themeChanged', handleThemeChange);

            // Cleanup function
            return () => {
                document.removeEventListener('themeChanged', handleThemeChange);
            };
        }
    }, []);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const result = await window.csvLoader.loadFile(file);
            onFileLoad(result.content, result.fileName);
        } catch (error) {
            console.error('Error loading file:', error);
            showToast(`Błąd wczytywania pliku: ${error.message}`, 'danger');
        }
    };

    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `position-fixed bottom-0 end-0 m-3 alert alert-${type} alert-dismissible`;
        toast.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5><i className="bi bi-file-earmark-arrow-up me-2"></i>Wczytaj plik CSV</h5>
            </div>
            <div className="card-body">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv,.txt"
                    style={{ display: 'none' }}
                />
                <button
                    className="btn btn-outline-success p"
                    onClick={() => fileInputRef.current.click()}
                >
                    <i className="bi bi-folder-open me-2"></i>Wybierz plik CSV
                </button>
                <div className="mt-2 text-muted small">
                    Obsługuje pliki .csv i .txt z separatorami: przecinek, średnik, tabulator
                </div>
            </div>
        </div>
    );
};

// Code Editor Component
const CodeEditor = ({ value, onChange, onDataParsed }) => {
    const editorRef = React.useRef();
    const cmRef = React.useRef();

    React.useEffect(() => {
        if (editorRef.current && !cmRef.current) {
            cmRef.current = CodeMirror.fromTextArea(editorRef.current, {
                mode: 'javascript',
                theme: 'monokai',
                lineNumbers: true,
                lineWrapping: true,
                placeholder: 'Wklej dane CSV tutaj lub użyj przycisku powyżej do wczytania pliku...'
            });

            cmRef.current.on('change', (instance) => {
                const newValue = instance.getValue();
                onChange(newValue);
                parseData(newValue);
            });
        }

        if (cmRef.current && value !== cmRef.current.getValue()) {
            cmRef.current.setValue(value);
        }
    }, [value]);

    const parseData = (text) => {
        if (!text.trim()) {
            onDataParsed([]);
            return;
        }

        try {
            console.log('Parsowanie tekstu:', text);
            const result = window.csvLoader.parseCSV(text);
            console.log('Końcowy wynik parsowania:', result);
            onDataParsed(result);
        } catch (error) {
            console.error('Parse error:', error);
            onDataParsed([]);
        }
    };

    return (
        <div>
            <textarea
                ref={editorRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="form-control"
            />
        </div>
    );
};

// Data Table Component replaced with Bootstrap Table like beta.html
const DataTable = ({ data, id, title, className, onSendToEditor }) => {
    React.useEffect(() => {
        // Initialize Bootstrap Table after data changes
        if (data.length > 0) {
            setTimeout(() => {
                const $table = $(`#${id}`);
                if ($table.length > 0) {
                    if ($table.data('bootstrap.table')) {
                        $table.bootstrapTable('destroy');
                    }
                    $table.bootstrapTable({
                        data: data,
                        search: true,
                        showColumns: true,
                        showCopyRows: true,
                        clickToSelect: true,
                        singleSelect: false
                    });
                }
            }, 100);
        }
    }, [data, id]);

    const exportTableData = () => {
        if (data.length === 0 || !window.csvLoader) {
            showToast('Brak danych do eksportu', 'warning');
            return;
        }

        try {
            const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
            window.csvLoader.downloadCSV(data, filename);
            showToast(`Wyeksportowano ${data.length} rekordów z kategorii: ${title}`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            showToast(`Błąd eksportu: ${error.message}`, 'danger');
        }
    };

    const sendToEditor = () => {
        if (data.length === 0) {
            showToast('Brak danych do przesłania', 'warning');
            return;
        }

        if (onSendToEditor) {
            onSendToEditor(data, title);
            showToast(`Przesłano ${data.length} rekordów z kategorii: ${title} do edytora`, 'success');
        } else {
            showToast('Funkcja edytora nie jest dostępna', 'danger');
        }
    };

    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `position-fixed bottom-0 end-0 m-3 alert alert-${type} alert-dismissible`;
        toast.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    if (data.length === 0) {
        return (
            <div className={`card ${className}`}>
                <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">{title} <span className="badge bg-secondary">0</span></h6>
                    </div>
                </div>
                <div className="card-body text-center text-muted">
                    Brak danych
                </div>
            </div>
        );
    }

    return (
        <div className={`card ${className}`}>
            <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{title} <span className="badge bg-primary">{data.length}</span></h6>
                    <div className="btn-group btn-group-sm">
                        <button
                            className="btn btn-outline-info table-send-btn"
                            onClick={sendToEditor}
                            title={`Prześlij ${data.length} rekordów do edytora tabelowego`}
                        >
                            <i className="bi bi-arrow-right-circle me-1"></i>Edytor
                        </button>
                        <button
                            className="btn btn-outline-success table-export-btn"
                            onClick={exportTableData}
                            title={`Eksportuj ${data.length} rekordów do CSV`}
                        >
                            <i className="bi bi-download me-1"></i>CSV
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table
                        id={id}
                        className="table table-dark table-striped table-sm mb-0"
                        data-toggle="table"
                        data-show-columns="true"
                        data-search="true"
                        data-click-to-select="true"
                        data-show-copy-rows="true"
                    >
                        <thead>
                            <tr>
                                <th data-field="state" data-checkbox="true"></th>
                                <th data-field="timestamp" data-sortable="true" className="timestamp">Data UTC</th>
                                <th data-field="user" data-sortable="true" className="user">User ID</th>
                                <th data-field="vrid" data-sortable="true" className="vrid">VRID</th>
                                <th data-field="scac" data-sortable="true" className="scac">SCAC</th>
                                <th data-field="traktor" data-sortable="true" className="traktor">TRAKTOR</th>
                                <th data-field="trailer" data-sortable="true" className="trailer">TRAILER</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Chart Components for Comparison
const ComparisonChart = ({ type, data, title, canvasId }) => {
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (!data || !window.Chart) return;

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Create new chart based on type
        let config = {};

        switch (type) {
            case 'pie':
                config = {
                    type: 'pie',
                    data: {
                        labels: ['Wspólne', 'Tylko w 1.', 'Tylko w 2.'],
                        datasets: [{
                            data: [
                                data.stats.commonCount,
                                data.stats.unique1Count,
                                data.stats.unique2Count
                            ],
                            backgroundColor: [
                                '#69ff3b',
                                '#ffdf2c',
                                '#4dabf7'
                            ],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const total = data.stats.total1 + data.stats.total2 - data.stats.commonCount;
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                };
                break;

            case 'bar':
                config = {
                    type: 'bar',
                    data: {
                        labels: ['Bufor 1', 'Bufor 2', 'Wspólne'],
                        datasets: [{
                            label: 'Liczba rekordów',
                            data: [
                                data.stats.total1,
                                data.stats.total2,
                                data.stats.commonCount
                            ],
                            backgroundColor: [
                                'rgba(105, 255, 59, 0.8)',
                                'rgba(255, 223, 44, 0.8)',
                                'rgba(77, 171, 247, 0.8)',
                                'rgba(223, 223, 223, 0.8)'
                            ],
                            borderColor: [
                                '#69ff3b',
                                '#ffdf2c',
                                '#4dabf7'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: '#cccccc',
                                    font: {
                                        weight: '500'
                                    }
                                }
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    stepSize: 1,
                                    color: '#cccccc',
                                    font: {
                                        weight: '500'
                                    }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                };
                break;

            case 'doughnut':
                const similarity = parseFloat(data.stats.similarity);
                const remaining = 100 - similarity;
                config = {
                    type: 'doughnut',
                    data: {
                        labels: ['Podobieństwo', 'Różnice'],
                        datasets: [{
                            data: [similarity, remaining],
                            backgroundColor: [
                                '#69ff3b',
                                '#ffdf2c'
                            ],
                            borderWidth: 3,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.label}: ${context.parsed.toFixed(1)}%`;
                                    }
                                }
                            }
                        }
                    }
                };
                break;

            case 'radar':
                // Create categories analysis
                const buffer1Categories = analyzeCategories(data.buffer1Data || []);
                const buffer2Categories = analyzeCategories(data.buffer2Data || []);

                config = {
                    type: 'radar',
                    data: {
                        labels: ['IB (0994)', 'OB (Inne)', 'ATSEU (VS)', 'OTHER (Bez VRID)'],
                        datasets: [{
                            label: 'Bufor 1',
                            data: [
                                buffer1Categories.ib,
                                buffer1Categories.ob,
                                buffer1Categories.atseu,
                                buffer1Categories.other
                            ],
                            borderColor: '#69ff3b',
                            backgroundColor: 'rgba(105, 255, 59, 0.2)',
                            borderWidth: 2,
                            pointBackgroundColor: '#69ff3b'
                        }, {
                            label: 'Bufor 2',
                            data: [
                                buffer2Categories.ib,
                                buffer2Categories.ob,
                                buffer2Categories.atseu,
                                buffer2Categories.other
                            ],
                            borderColor: '#ffdf2c',
                            backgroundColor: 'rgba(255, 223, 44, 0.2)',
                            borderWidth: 2,
                            pointBackgroundColor: '#ffdf2c'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: Math.max(data.stats.total1, data.stats.total2),
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.2)'
                                },
                                pointLabels: {
                                    color: '#ffffff',
                                    font: {
                                        size: 12,
                                        weight: '600'
                                    }
                                },
                                ticks: {
                                    color: '#cccccc',
                                    backdropColor: 'transparent'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                };
                break;
        }

        chartRef.current = new Chart(ctx, config);

    }, [data, type, canvasId]);

    // Helper function to analyze categories
    const analyzeCategories = (data) => {
        const categories = { ib: 0, ob: 0, atseu: 0, other: 0 };

        data.forEach(row => {
            // Safely handle undefined/null values before calling trim()
            const vrid = (row.vrid || '').trim();
            const trailer = (row.trailer || '').trim().toUpperCase();

            if (trailer.includes('VS')) {
                categories.atseu++;
            } else if (!vrid) {
                categories.other++;
            } else if (vrid.includes('0994')) {
                categories.ib++;
            } else {
                categories.ob++;
            }
        });

        return categories;
    };

    return (
        <div className="chart-container category-chart" style={{ position: 'relative', height: '300px' }}>
            <h6 className="text-center mb-3">{title}</h6>
            <canvas id={canvasId}></canvas>
        </div>
    );
};

// Timeline Chart Component
const TimelineChart = ({ data, canvasId }) => {
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (!data || !window.Chart) return;

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Process timeline data
        const processTimelineData = (bufferData, label, color) => {
            const hourlyCount = {};

            bufferData.forEach(row => {
                if (row.timestamp) {
                    const date = new Date(row.timestamp);
                    const hour = date.getHours();
                    hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
                }
            });

            return {
                label: label,
                data: Array.from({ length: 24 }, (_, i) => hourlyCount[i] || 0),
                borderColor: color,
                backgroundColor: color + '20',
                fill: true,
                tension: 0.4
            };
        };

        const config = {
            type: 'line',
            data: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                datasets: [
                    processTimelineData(data.buffer1Data || [], 'Bufor 1', '#69ff3b'),
                    processTimelineData(data.buffer2Data || [], 'Bufor 2', '#ffdf2c')
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Godzina',
                            color: '#ffffff',
                            font: {
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: '#cccccc'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Liczba rekordów',
                            color: '#ffffff',
                            font: {
                                weight: '600'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            color: '#cccccc'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                return `Godzina ${context[0].label}`;
                            }
                        }
                    }
                }
            }
        };

        chartRef.current = new Chart(ctx, config);

    }, [data, canvasId]);

    return (
        <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
            <h6 className="text-center mb-3">Aktywność w ciągu dnia</h6>
            <canvas id={canvasId}></canvas>
        </div>
    );
};

// Current Data Chart Component
const CurrentDataChart = ({ type, data, title, canvasId }) => {
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (!data || !window.Chart) return;

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const total = data.ib.length + data.ob.length + data.atseu.length + data.other.length;
        if (total === 0) return;

        // Create new chart based on type
        let config = {};

        switch (type) {
            case 'pie':
                config = {
                    type: 'pie',
                    data: {
                        labels: ['IB (0994)', 'OB (Pozostałe)', 'ATSEU (VS)', 'OTHER'],
                        datasets: [{
                            data: [
                                data.ib.length,
                                data.ob.length,
                                data.atseu.length,
                                data.other.length
                            ],
                            backgroundColor: [
                                '#69ff3b',
                                '#ffdf2c',
                                '#4dabf7',
                                '#dfdfdf'
                            ],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                };
                break;

            case 'doughnut':
                config = {
                    type: 'doughnut',
                    data: {
                        labels: ['IB (0994)', 'OB (Pozostałe)', 'ATSEU (VS)', 'OTHER'],
                        datasets: [{
                            data: [
                                data.ib.length,
                                data.ob.length,
                                data.atseu.length,
                                data.other.length
                            ],
                            backgroundColor: [
                                '#69ff3b',
                                '#ffdf2c',
                                '#4dabf7',
                                '#dfdfdf'
                            ],
                            borderWidth: 3,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                };
                break;

            case 'bar':
                config = {
                    type: 'bar',
                    data: {
                        labels: ['IB (0994)', 'OB (Pozostałe)', 'ATSEU (VS)', 'OTHER'],
                        datasets: [{
                            label: 'Liczba rekordów',
                            data: [
                                data.ib.length,
                                data.ob.length,
                                data.atseu.length,
                                data.other.length
                            ],
                            backgroundColor: [
                                'rgba(105, 255, 59, 0.8)',
                                'rgba(255, 223, 44, 0.8)',
                                'rgba(77, 171, 247, 0.8)',
                                'rgba(223, 223, 223, 0.8)'
                            ],
                            borderColor: [
                                '#69ff3b',
                                '#ff6b6b',
                                '#4dabf7',
                                '#dfdfdf'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: '#cccccc',
                                    font: {
                                        weight: '500'
                                    }
                                }
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    stepSize: 1,
                                    color: '#cccccc',
                                    font: {
                                        weight: '500'
                                    }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                };
                break;
        }

        chartRef.current = new Chart(ctx, config);

    }, [data, type, canvasId]);

    return (
        <div className="chart-container category-chart" style={{ position: 'relative', height: '300px' }}>
            <h6 className="text-center mb-3">{title}</h6>
            <canvas id={canvasId}></canvas>
        </div>
    );
};

// Current Timeline Chart Component
const CurrentTimelineChart = ({ data, canvasId }) => {
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (!data || !window.Chart || data.length === 0) return;

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Process timeline data for current dataset
        const hourlyCount = {};

        data.forEach(row => {
            if (row.timestamp) {
                const date = new Date(row.timestamp);
                const hour = date.getHours();
                hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
            }
        });

        const config = {
            type: 'line',
            data: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Aktywność',
                    data: Array.from({ length: 24 }, (_, i) => hourlyCount[i] || 0),
                    borderColor: '#4dabf7',
                    backgroundColor: 'rgba(77, 171, 247, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4dabf7',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Godzina',
                            color: '#ffffff',
                            font: {
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: '#cccccc'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Liczba rekordów',
                            color: '#ffffff',
                            font: {
                                weight: '600'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            color: '#cccccc'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                return `Godzina ${context[0].label}`;
                            },
                            label: function (context) {
                                return `Rekordów: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            }
        };

        chartRef.current = new Chart(ctx, config);

    }, [data, canvasId]);

    return (
        <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
            <h6 className="text-center mb-3">Aktywność w ciągu dnia</h6>
            <canvas id={canvasId}></canvas>
        </div>
    );
};

// User Activity Chart Component
const UserActivityChart = ({ data, canvasId, type }) => {
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (!data || !window.Chart || data.length === 0) return;

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Analyze user activity
        const userCount = {};
        data.forEach(row => {
            const userId = row.user;
            if (userId) {
                userCount[userId] = (userCount[userId] || 0) + 1;
            }
        });

        const userEntries = Object.entries(userCount);
        if (userEntries.length === 0) return;

        // Sort by count and take top users
        const topUsers = userEntries.sort((a, b) => b[1] - a[1]);
        const maxUsers = type === 'pie' ? 10 : 15; // Show more in bar chart
        const displayUsers = topUsers.slice(0, maxUsers);

        const total = data.length;

        // Generate colors - starting with category colors
        const colors = [
            '#69ff3b', '#ffdf2c', '#4dabf7', '#dfdfdf',
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7DBDD'
        ];

        // Create new chart based on type
        let config = {};

        switch (type) {
            case 'bar':
                config = {
                    type: 'bar',
                    data: {
                        labels: displayUsers.map(([userId]) => userId),
                        datasets: [{
                            label: 'Liczba rekordów',
                            data: displayUsers.map(([, count]) => count),
                            backgroundColor: displayUsers.map((_, index) => colors[index % colors.length]),
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                title: {
                                    display: true,
                                    text: 'User ID',
                                    color: '#ffffff',
                                    font: {
                                        weight: '600'
                                    }
                                },
                                ticks: {
                                    maxRotation: 45,
                                    minRotation: 45,
                                    color: '#cccccc'
                                }
                            },
                            y: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                title: {
                                    display: true,
                                    text: 'Liczba rekordów',
                                    color: '#ffffff',
                                    font: {
                                        weight: '600'
                                    }
                                },
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1,
                                    color: '#cccccc'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                                        return `Rekordów: ${context.parsed.y} (${percentage}% całości)`;
                                    }
                                }
                            }
                        }
                    }
                };
                break;

            case 'pie':
                config = {
                    type: 'pie',
                    data: {
                        labels: displayUsers.map(([userId]) => userId),
                        datasets: [{
                            data: displayUsers.map(([, count]) => count),
                            backgroundColor: displayUsers.map((_, index) => colors[index % colors.length]),
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    boxWidth: 12,
                                    font: {
                                        size: 10
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                };
                break;
        }

        chartRef.current = new Chart(ctx, config);

    }, [data, type, canvasId]);

    const title = type === 'bar' ? 'Top 15 użytkowników - aktywność' : 'Top 10 użytkowników - rozkład';

    return (
        <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
            <h6 className="text-center mb-3">{title}</h6>
            <canvas id={canvasId}></canvas>
        </div>
    );
};

// Top Users Table Component
const TopUsersTable = ({ data }) => {
    const topUsers = React.useMemo(() => {
        const userCount = {};
        data.forEach(row => {
            const userId = row.user;
            if (userId) {
                userCount[userId] = (userCount[userId] || 0) + 1;
            }
        });
        return Object.entries(userCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
    }, [data]);

    return (
        <div className="table-responsive">
            <table className="table table-hover top-users-table">
                <thead>
                    <tr>
                        <th>
                            <i className="bi bi-person-badge me-2"></i>User ID
                        </th>
                        <th>
                            <i className="bi bi-bar-chart me-2"></i>Liczba rekordów
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {topUsers.map(([userId, count], index) => (
                        <tr key={userId}>
                            <td>{userId}</td>
                            <td>
                                <span className="record-badge">{count}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Main Application
const App = () => {
    const [rawData, setRawData] = React.useState('');
    const [allData, setAllData] = React.useState([]);
    const [categorizedData, setCategorizedData] = React.useState({ ib: [], ob: [], atseu: [], other: [] });
    const [transformStats, setTransformStats] = React.useState(null);
    const [buffersList, setBuffersList] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('editor');
    const [compareBuffers, setCompareBuffers] = React.useState({ buffer1: null, buffer2: null, result: null });
    const [editableTable, setEditableTable] = React.useState(null);
    // State do zarządzania widocznością sekcji analizy
    const [analysisVisibility, setAnalysisVisibility] = React.useState({
        tables: true,
        stats: true
    });

    // Funkcja do przełączania widoczności sekcji analizy
    const toggleAnalysisSection = (section) => {
        setAnalysisVisibility(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const categorizeData = (data) => {
        const ib = [];
        const ob = [];
        const atseu = [];
        const other = [];

        data.forEach(row => {
            // Safely handle undefined/null values before calling trim()
            const vrid = (row.vrid || '').trim();
            const scac = (row.scac || '').trim().toUpperCase();
            const trailer = (row.trailer || '').trim().toUpperCase();

            // ATSEU has priority - check 'VS' in trailer first
            if (trailer.includes('VS')) {
                atseu.push(row);
                return;
            }

            // No VRID = OTHER (but only if not ATSEU)
            if (!vrid) {
                other.push(row);
                return;
            }

            // IB (contains '0994')
            if (vrid.includes('0994')) {
                ib.push(row);
                return;
            }

            // Default: OB
            ob.push(row);
        });

        setCategorizedData({ ib, ob, atseu, other });
    };

    const handleDataParsed = (data) => {
        setAllData(data);
        categorizeData(data);
    };

    const handleFileLoad = (content, fileName) => {
        setRawData(content);
        showToast(`Wczytano plik: ${fileName}`);
    };

    const clearAll = () => {
        setRawData('');
        setAllData([]);
        setCategorizedData({ ib: [], ob: [], atseu: [], other: [] });
        showToast('Wszystkie dane zostały wyczyszczone');
    };

    const transformData = () => {
        if (allData.length === 0) {
            showToast('Brak danych do przekształcenia!', 'warning');
            return;
        }

        try {
            // Clean data first
            const cleanedData = window.dataTransformer.cleanData(allData);

            // Transform data
            const transformedData = window.dataTransformer.processData(cleanedData);

            // Generate statistics
            const stats = window.dataTransformer.generateStats(cleanedData);

            // Validate data
            const validation = window.dataTransformer.validateData(cleanedData);

            // Save stats to state
            setTransformStats(stats);

            // Show transformation results
            const message = `
                <div class="text-start">
                    <h6>Przekształcono dane:</h6>
                    <p>• Aktywność użytkowników: ${transformedData.userActivity.length} grup</p>
                    <p>• Dane VRID/SCAC: ${transformedData.vridScacData.length} grup</p>
                    <hr>
                    <h6>Statystyki:</h6>
                    <p>• Unikatowi użytkownicy: ${stats.uniqueUsers}</p>
                    <p>• Traktory: ${stats.vehicleStats.tractors}</p>
                    <p>• Naczepy: ${stats.vehicleStats.trailers}</p>
                    <p>• VS Naczepy: ${stats.vehicleStats.vsTrailers}</p>
                    <hr>
                    <h6>Jakość danych:</h6>
                    <p>• Poprawne: ${stats.dataQuality.valid.toFixed(1)}%</p>
                    <p>• Błędy: ${validation.errors.length}</p>
                    <p>• Ostrzeżenia: ${validation.warnings.length}</p>
                    <hr>
                    <p><small>Przejdź do zakładki "Analiza" aby zobaczyć szczegóły</small></p>
                </div>
            `;

            showToast(message, 'info', 8000);

            console.log('Transformed data:', transformedData);
            console.log('Stats:', stats);
            console.log('Validation:', validation);

        } catch (error) {
            console.error('Transform error:', error);
            showToast(`Błąd przekształcania danych: ${error.message}`, 'danger');
        }
    };

    const saveToBuffer = () => {
        if (allData.length === 0) {
            showToast('Brak danych do zapisania!', 'warning');
            return;
        }

        try {
            // Generate buffer name with timestamp
            const timestamp = new Date().toLocaleString('pl-PL');
            const bufferName = `CSV Data ${timestamp}`;

            // Check if we have transformed data
            let transformedData = null;
            if (categorizedData.ib.length > 0 || categorizedData.ob.length > 0 ||
                categorizedData.atseu.length > 0 || categorizedData.other.length > 0) {
                transformedData = {
                    ib: categorizedData.ib,
                    ob: categorizedData.ob,
                    atseu: categorizedData.atseu,
                    other: categorizedData.other
                };
            }

            // Create buffer
            const bufferId = window.dataBuffer.createBuffer(bufferName, allData, transformedData);

            // Get buffer stats
            const bufferStats = window.dataBuffer.getBufferStats();

            const message = `
                <div class="text-start">
                    <h6>Zapisano do bufora:</h6>
                    <p><strong>${bufferName}</strong></p>
                    <p>• Rekordów: ${allData.length}</p>
                    <p>• Kategorie: ${transformedData ? 'Tak' : 'Nie'}</p>
                    <hr>
                    <h6>Stan buforów:</h6>
                    <p>• Łącznie buforów: ${bufferStats.totalBuffers}</p>
                    <p>• Łącznie rekordów: ${bufferStats.totalRecords}</p>
                    <p>• Rozmiar: ${formatBytes(bufferStats.totalSize)}</p>
                </div>
            `;

            showToast(message, 'success', 6000);
            console.log('Buffer created with ID:', bufferId);

        } catch (error) {
            console.error('Buffer save error:', error);
            showToast(`Błąd zapisywania do bufora: ${error.message}`, 'danger');
        }
    };

    // Helper function to format bytes
    const formatBytes = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const loadBuffersList = () => {
        if (window.dataBuffer) {
            setBuffersList(window.dataBuffer.getBuffersList());
        }
    };

    // Effect to refresh buffer count in button
    React.useEffect(() => {
        const interval = setInterval(() => {
            loadBuffersList();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const showToast = (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `position-fixed bottom-0   m-3 alert alert-${type} alert-dismissible`;
        toast.style.zIndex = '9999';
        toast.style.maxWidth = '400px';
        toast.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, duration);
    };

    const loadFromBuffer = (bufferId) => {
        try {
            const buffer = window.dataBuffer.getBuffer(bufferId);
            if (!buffer) {
                showToast('Nie znaleziono bufora!', 'warning');
                return;
            }

            // Load original data
            setAllData(buffer.originalData);
            setRawData(buffer.originalData.map(row => Object.values(row).join(',')).join('\n'));

            // Load transformed data if available
            if (buffer.transformedData) {
                setCategorizedData(buffer.transformedData);
            } else {
                setCategorizedData({ ib: [], ob: [], atseu: [], other: [] });
            }

            showToast(`Załadowano bufor: ${buffer.name} (${buffer.originalData.length} rekordów)`, 'success');

        } catch (error) {
            console.error('Buffer load error:', error);
            showToast(`Błąd ładowania bufora: ${error.message}`, 'danger');
        }
    };

    const deleteBuffer = (bufferId) => {
        if (confirm('Czy na pewno chcesz usunąć ten bufor?')) {
            try {
                const deleted = window.dataBuffer.deleteBuffer(bufferId);
                if (deleted) {
                    showToast('Bufor został usunięty', 'success');
                    loadBuffersList();
                } else {
                    showToast('Nie udało się usunąć bufora', 'warning');
                }
            } catch (error) {
                console.error('Buffer delete error:', error);
                showToast(`Błąd usuwania bufora: ${error.message}`, 'danger');
            }
        }
    };

    const clearAllBuffers = () => {
        if (confirm('Czy na pewno chcesz usunąć wszystkie bufory?')) {
            try {
                window.dataBuffer.clearAllBuffers();
                showToast('Wszystkie bufory zostały usunięte', 'success');
                setBuffersList([]);
            } catch (error) {
                console.error('Clear buffers error:', error);
                showToast(`Błąd usuwania buforów: ${error.message}`, 'danger');
            }
        }
    };

    const exportBuffer = (bufferId) => {
        try {
            const result = window.dataBuffer.exportBuffer(bufferId, 'download');
            if (result) {
                showToast('Bufor został wyeksportowany', 'success');
            } else {
                showToast('Nie udało się wyeksportować bufora', 'warning');
            }
        } catch (error) {
            console.error('Export error:', error);
            showToast(`Błąd eksportu: ${error.message}`, 'danger');
        }
    };

    const performComparison = () => {
        if (!compareBuffers.buffer1 || !compareBuffers.buffer2) {
            showToast('Wybierz oba bufory do porównania', 'warning');
            return;
        }

        try {
            const result = window.dataBuffer.compareBuffers(
                compareBuffers.buffer1.id,
                compareBuffers.buffer2.id
            );

            if (result) {
                // Get full buffer data for charts
                const buffer1Data = window.dataBuffer.getBuffer(compareBuffers.buffer1.id);
                const buffer2Data = window.dataBuffer.getBuffer(compareBuffers.buffer2.id);

                // Add buffer data to result for charts
                result.buffer1Data = buffer1Data?.originalData || [];
                result.buffer2Data = buffer2Data?.originalData || [];
                result.buffer1Name = buffer1Data?.name || 'Bufor 1';
                result.buffer2Name = buffer2Data?.name || 'Bufor 2';

                setCompareBuffers(prev => ({ ...prev, result }));
                showToast('Porównanie zakończone pomyślnie', 'success');
            } else {
                showToast('Nie udało się porównać buforów', 'warning');
            }
        } catch (error) {
            console.error('Comparison error:', error);
            showToast(`Błąd porównania: ${error.message}`, 'danger');
        }
    };

    const exportComparisonData = (type) => {
        if (!compareBuffers.result || !window.csvLoader) {
            showToast('Brak danych do eksportu', 'warning');
            return;
        }

        try {
            let dataToExport = [];
            let filename = '';

            switch (type) {
                case 'common':
                    dataToExport = compareBuffers.result.common;
                    filename = `wspólne_rekordy_${new Date().toISOString().split('T')[0]}.csv`;
                    break;
                case 'unique1':
                    dataToExport = compareBuffers.result.unique1;
                    filename = `unikalne_${compareBuffers.result.buffer1Name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
                    break;
                case 'unique2':
                    dataToExport = compareBuffers.result.unique2;
                    filename = `unikalne_${compareBuffers.result.buffer2Name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
                    break;
                case 'full':
                    // Create comprehensive report
                    const report = {
                        summary: {
                            buffer1_name: compareBuffers.result.buffer1Name,
                            buffer2_name: compareBuffers.result.buffer2Name,
                            total1: compareBuffers.result.stats.total1,
                            total2: compareBuffers.result.stats.total2,
                            common_count: compareBuffers.result.stats.commonCount,
                            unique1_count: compareBuffers.result.stats.unique1Count,
                            unique2_count: compareBuffers.result.stats.unique2Count,
                            similarity_percent: compareBuffers.result.stats.similarity
                        }
                    };

                    // Convert report to CSV-like format
                    const reportLines = [
                        'RAPORT PORÓWNANIA BUFORÓW',
                        `Data: ${new Date().toLocaleString('pl-PL')}`,
                        '',
                        'PODSUMOWANIE:',
                        `Bufor 1: ${report.summary.buffer1_name}`,
                        `Bufor 2: ${report.summary.buffer2_name}`,
                        `Rekordy w buforze 1: ${report.summary.total1}`,
                        `Rekordy w buforze 2: ${report.summary.total2}`,
                        `Wspólne rekordy: ${report.summary.common_count}`,
                        `Unikalne w buforze 1: ${report.summary.unique1_count}`,
                        `Unikalne w buforze 2: ${report.summary.unique2_count}`,
                        `Podobieństwo: ${report.summary.similarity_percent}%`,
                        '',
                        'WSPÓLNE REKORDY:',
                        ...compareBuffers.result.common.map(row => Object.values(row).join(',')),
                        '',
                        'UNIKALNE W BUFORZE 1:',
                        ...compareBuffers.result.unique1.map(row => Object.values(row).join(',')),
                        '',
                        'UNIKALNE W BUFORZE 2:',
                        ...compareBuffers.result.unique2.map(row => Object.values(row).join(','))
                    ];

                    const blob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `pełny_raport_porównania_${new Date().toISOString().split('T')[0]}.txt`;
                    a.click();
                    window.URL.revokeObjectURL(url);

                    showToast('Pełny raport został wyeksportowany', 'success');
                    return;
            }

            if (dataToExport.length === 0) {
                showToast('Brak danych do eksportu w wybranej kategorii', 'info');
                return;
            }

            window.csvLoader.downloadCSV(dataToExport, filename);
            showToast(`Wyeksportowano ${dataToExport.length} rekordów`, 'success');

        } catch (error) {
            console.error('Export error:', error);
            showToast(`Błąd eksportu: ${error.message}`, 'danger');
        }
    };

    const sendDataToTableEditor = (data, categoryTitle) => {
        // Najpierw przełącz na zakładkę edytora
        setActiveTab('table-editor');

        if (!editableTable) {
            // Inicjalizuj edytor jeśli jeszcze nie istnieje
            setTimeout(() => {
                // Sprawdź czy kontener istnieje w DOM
                const container = document.getElementById('editableTableContainer');
                if (!container) {
                    console.error('Container editableTableContainer not found');
                    showToast('Błąd: Kontener edytora nie został znaleziony', 'danger');
                    return;
                }

                try {
                    const table = new window.EditableTable('editableTableContainer', data);
                    table.setCallbacks({
                        onDataChange: (newData) => {
                            setAllData(newData);
                            categorizeData(newData);
                        }
                    });
                    setEditableTable(table);
                    showToast(`Przesłano ${data.length} rekordów z kategorii: ${categoryTitle} do edytora`, 'success');
                } catch (error) {
                    console.error('Error creating editable table:', error);
                    showToast(`Błąd tworzenia edytora: ${error.message}`, 'danger');
                }
            }, 200); // Zwiększam timeout żeby dać więcej czasu na renderowanie DOM
        } else {
            // Jeśli edytor już istnieje, sprawdź czy kontener nadal istnieje
            const container = document.getElementById('editableTableContainer');
            if (!container) {
                // Kontener nie istnieje, utwórz edytor ponownie
                setTimeout(() => {
                    try {
                        const table = new window.EditableTable('editableTableContainer', data);
                        table.setCallbacks({
                            onDataChange: (newData) => {
                                setAllData(newData);
                                categorizeData(newData);
                            }
                        });
                        setEditableTable(table);
                        showToast(`Przesłano ${data.length} rekordów z kategorii: ${categoryTitle} do edytora`, 'success');
                    } catch (error) {
                        console.error('Error recreating editable table:', error);
                        showToast(`Błąd ponownego tworzenia edytora: ${error.message}`, 'danger');
                    }
                }, 200);
                return;
            }

            // Edytor istnieje, dodaj lub zastąp dane
            try {
                if (editableTable.getData().length > 0) {
                    if (confirm(`Czy chcesz zastąpić dane w edytorze (${editableTable.getData().length} rekordów) danymi z kategorii ${categoryTitle} (${data.length} rekordów)?`)) {
                        editableTable.setData(data);
                        showToast(`Zastąpiono dane edytora danymi z kategorii ${categoryTitle}`, 'info');
                    } else {
                        editableTable.addData(data);
                        showToast(`Dodano dane z kategorii ${categoryTitle} do edytora`, 'success');
                    }
                } else {
                    editableTable.setData(data);
                    showToast(`Przesłano dane z kategorii ${categoryTitle} do edytora`, 'success');
                }
            } catch (error) {
                console.error('Error updating editable table:', error);
                showToast(`Błąd aktualizacji edytora: ${error.message}`, 'danger');
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1><i className="bi bi-table me-2"></i>CSV Sortowanie i Kategoryzacja</h1>
                <div className="btn-group">
                    <button
                        className="btn btn-outline-primary"
                        onClick={transformData}
                        disabled={allData.length === 0}
                        title="Przekształć i analizuj dane"
                    >
                        <i className="bi bi-arrow-repeat me-2"></i>Przekształć dane
                    </button>
                    <button
                        className="btn btn-outline-info"
                        onClick={saveToBuffer}
                        disabled={allData.length === 0}
                        title="Zapisz dane do bufora"
                    >
                        <i className="bi bi-save me-2"></i>Zapisz do bufora
                    </button>
                    <button className="btn btn-outline-danger" onClick={clearAll}>
                        <i className="bi bi-trash me-2"></i>Wyczyść wszystko
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <ul className="nav nav-tabs mb-4" id="mainTabs" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'editor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('editor')}
                        type="button"
                    >
                        <i className="bi bi-code-square me-2"></i>Edytor CSV
                        {allData.length > 0 && <span className="badge bg-primary ms-2">{allData.length}</span>}
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'table-editor' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('table-editor');
                            if (!editableTable) {
                                setTimeout(() => {
                                    const container = document.getElementById('editableTableContainer');
                                    if (!container) {
                                        console.warn('Container editableTableContainer not found during tab initialization');
                                        return;
                                    }

                                    try {
                                        const table = new window.EditableTable('editableTableContainer', allData);
                                        table.setCallbacks({
                                            onDataChange: (data) => {
                                                setAllData(data);
                                                categorizeData(data);
                                            }
                                        });
                                        setEditableTable(table);
                                    } catch (error) {
                                        console.error('Error initializing editable table on tab click:', error);
                                        showToast(`Błąd inicjalizacji edytora: ${error.message}`, 'danger');
                                    }
                                }, 200);
                            }
                        }}
                        type="button"
                    >
                        <i className="bi bi-table me-2"></i>Edytor
                        {editableTable && editableTable.getData().length > 0 &&
                            <span className="badge bg-success ms-2">{editableTable.getData().length}</span>}
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'buffers' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('buffers'); loadBuffersList(); }}
                        type="button"
                    >
                        <i className="bi bi-stack me-2"></i>Bufory
                        <span className="badge bg-secondary ms-2">{window.dataBuffer?.getBufferStats().totalBuffers || 0}</span>
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'analysis' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analysis')}
                        type="button"
                    >
                        <i className="bi bi-graph-up me-2"></i>Analiza
                        {allData.length > 0 && <span className="badge bg-success ms-2">Ready</span>}
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'compare' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('compare'); loadBuffersList(); }}
                        type="button"
                        disabled={allData.length === 0 && buffersList.length < 2}
                    >
                        <i className="bi bi-bar-chart me-2"></i>Chart
                        {allData.length > 0 && <span className="badge bg-success ms-2">Data</span>}
                        {buffersList.length >= 2 && <span className="badge bg-info ms-2">Compare</span>}
                    </button>
                </li>

                <li className="nav-item theme-header-container">
                    <button
                        id="theme-toggle"
                        className="btn btn-outline-secondary btn-sm theme-header"
                        title="Przełącz motyw"
                    >
                        <i className="bi bi-moon-fill" id="theme-icon"></i>
                        <span id="theme-text" className="ms-1 d-none d-md-inline"></span>
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Editor Tab */}
                {activeTab === 'editor' && (
                    <div className="tab-pane fade show active">
                        <FileUpload onFileLoad={handleFileLoad} />

                        <div className="card mb-4">
                            <div className="card-header">
                                <h5><i className="bi bi-code-square me-2"></i>Edytor CSV</h5>
                            </div>
                            <div className="card-body">
                                <CodeEditor
                                    value={rawData}
                                    onChange={setRawData}
                                    onDataParsed={handleDataParsed}
                                />
                                <div className="mt-2 text-muted small">
                                    Format: Data UTC | User ID | VRID | SCAC | TRAKTOR | TRAILER
                                    <br />
                                    Wierszy: {allData.length} | Znaków: {rawData.length}
                                </div>
                            </div>
                        </div>

                        {allData.length > 0 && (
                            <div className="stats-grid">
                                <div className="stat-card ib">
                                    <div>🟢 IB (0994)</div>
                                    <div className="stat-number">{categorizedData.ib.length}</div>
                                    <div>Rekordy z '0994' w VRID</div>
                                </div>
                                <div className="stat-card ob">
                                    <div>🟡 OB (Pozostałe)</div>
                                    <div className="stat-number">{categorizedData.ob.length}</div>
                                    <div>Rekordy bez '0994' w VRID</div>
                                </div>
                                <div className="stat-card atseu">
                                    <div>🔵 ATSEU</div>
                                    <div className="stat-number">{categorizedData.atseu.length}</div>
                                    <div>Tylko 'VS' w TRAILER</div>
                                </div>
                                <div className="stat-card other">
                                    <div>⚪ OTHER</div>
                                    <div className="stat-number">{categorizedData.other.length}</div>
                                    <div>Rekordy bez VRID</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Table Editor Tab */}
                {activeTab === 'table-editor' && (
                    <div className="tab-pane fade show active">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <i className="bi bi-table me-2"></i>Edytor tabeli danych
                                    </h5>
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-outline-info"
                                            onClick={() => {
                                                if (editableTable && allData.length > 0) {
                                                    editableTable.setData(allData);
                                                    showToast('Załadowano dane z edytora CSV', 'info');
                                                } else {
                                                    showToast('Brak danych w edytorze CSV', 'warning');
                                                }
                                            }}
                                            title="Załaduj dane z edytora CSV"
                                        >
                                            <i className="bi bi-arrow-down-circle me-1"></i>Załaduj z CSV
                                        </button>
                                        <button
                                            className="btn btn-outline-success"
                                            onClick={() => {
                                                if (editableTable) {
                                                    const data = editableTable.getData();
                                                    if (data.length > 0) {
                                                        setAllData(data);
                                                        categorizeData(data);
                                                        showToast(`Przesłano ${data.length} rekordów do edytora CSV`, 'success');
                                                    } else {
                                                        showToast('Brak danych do przesłania', 'warning');
                                                    }
                                                }
                                            }}
                                            title="Prześlij dane do edytora CSV"
                                        >
                                            <i className="bi bi-arrow-up-circle me-1"></i>Prześlij do CSV
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div id="editableTableContainer"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buffers Tab */}
                {activeTab === 'buffers' && (
                    <div className="tab-pane fade show active">
                        <div className="card buffer-management-card">
                            <div className="card-header">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <i className="bi bi-stack me-2"></i>Zarządzanie buforami
                                        <span className="badge bg-info ms-2">{buffersList.length}</span>
                                    </h5>
                                    <div>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={clearAllBuffers}
                                            disabled={buffersList.length === 0}
                                        >
                                            <i className="bi bi-trash me-1"></i>Usuń wszystkie
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {buffersList.length === 0 ? (
                                    <div className="buffer-empty-state">
                                        <i className="bi bi-inbox fs-1"></i>
                                        <p className="mt-3">Brak zapisanych buforów</p>
                                        <p className="text-muted">Przejdź do zakładki "Edytor CSV" aby utworzyć nowy bufor</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover buffer-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <i className="bi bi-file-text me-2"></i>Nazwa
                                                    </th>
                                                    <th>
                                                        <i className="bi bi-calendar-plus me-2"></i>Data utworzenia
                                                    </th>
                                                    <th>
                                                        <i className="bi bi-clock-history me-2"></i>Ostatni dostęp
                                                    </th>
                                                    <th>
                                                        <i className="bi bi-bar-chart me-2"></i>Rekordy
                                                    </th>
                                                    <th>
                                                        <i className="bi bi-hdd me-2"></i>Rozmiar
                                                    </th>
                                                    <th>
                                                        <i className="bi bi-check-circle me-2"></i>Status
                                                    </th>
                                                    <th>
                                                        <i className="bi bi-gear me-2"></i>Akcje
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {buffersList.map(buffer => (
                                                    <tr key={buffer.id}>
                                                        <td>
                                                            <strong>{buffer.name}</strong>
                                                        </td>
                                                        <td>
                                                            <small className="buffer-date">
                                                                {new Date(buffer.created).toLocaleString('pl-PL')}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <small className="buffer-date">
                                                                {new Date(buffer.lastAccessed).toLocaleString('pl-PL')}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <span className="buffer-record-badge">{buffer.recordCount}</span>
                                                        </td>
                                                        <td>
                                                            <small className="buffer-size">{buffer.size}</small>
                                                        </td>
                                                        <td>
                                                            {buffer.hasTransformed ? (
                                                                <span className="buffer-status-badge transformed">Przekształcone</span>
                                                            ) : (
                                                                <span className="buffer-status-badge raw">Surowe</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="buffer-actions">
                                                                <div className="btn-group btn-group-sm">
                                                                    <button
                                                                        className="btn btn-outline-primary"
                                                                        onClick={() => {
                                                                            loadFromBuffer(buffer.id);
                                                                            setActiveTab('editor');
                                                                        }}
                                                                        title="Załaduj bufor"
                                                                    >
                                                                        <i className="bi bi-upload"></i>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-info"
                                                                        onClick={() => exportBuffer(buffer.id)}
                                                                        title="Eksportuj bufor"
                                                                    >
                                                                        <i className="bi bi-download"></i>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-danger"
                                                                        onClick={() => deleteBuffer(buffer.id)}
                                                                        title="Usuń bufor"
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                    <div className="tab-pane fade show active">
                        {/* Control Panel dla opcji ukrywania/pokazania */}
                        <div className="card mb-4 analysis-control-panel">
                            <div className="card-header">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5><i className="bi bi-eye me-2"></i>Panel kontrolny analizy</h5>
                                    <div className="btn-group btn-group-sm analysis-control-buttons">
                                        <button
                                            className={`btn ${analysisVisibility.tables ? 'btn-success' : 'btn-outline-success'}`}
                                            onClick={() => toggleAnalysisSection('tables')}
                                            title="Przełącz widoczność tabel kategorii"
                                        >
                                            <i className={`bi ${analysisVisibility.tables ? 'bi-eye' : 'bi-eye-slash'} me-1`}></i>
                                            <span>Tabele kategorii</span>
                                        </button>
                                        <button
                                            className={`btn ${analysisVisibility.stats ? 'btn-info' : 'btn-outline-info'}`}
                                            onClick={() => toggleAnalysisSection('stats')}
                                            title="Przełącz widoczność statystyk"
                                        >
                                            <i className={`bi ${analysisVisibility.stats ? 'bi-eye' : 'bi-eye-slash'} me-1`}></i>
                                            <span>Statystyki</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabele kategorii - warunkowe wyświetlanie */}
                        {analysisVisibility.tables && (
                            <div className="row g-4 analysis-section">
                                <div className="col-md-6">
                                    <DataTable
                                        data={categorizedData.ib}
                                        id="ib-table"
                                        title="🟢 IB - Rekordy z 0994"
                                        className="category-ib"
                                        onSendToEditor={sendDataToTableEditor}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <DataTable
                                        data={categorizedData.ob}
                                        id="ob-table"
                                        title="🟡 OB - Pozostałe VRID"
                                        className="category-ob"
                                        onSendToEditor={sendDataToTableEditor}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <DataTable
                                        data={categorizedData.atseu}
                                        id="atseu-table"
                                        title="🔵 ATSEU - Tylko VS w TRAILER"
                                        className="category-atseu"
                                        onSendToEditor={sendDataToTableEditor}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <DataTable
                                        data={categorizedData.other}
                                        id="other-table"
                                        title="⚪ OTHER - Bez VRID"
                                        className="category-other"
                                        onSendToEditor={sendDataToTableEditor}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Transform Stats Display - warunkowe wyświetlanie */}
                        {analysisVisibility.stats && transformStats && (
                            <div className="card mt-4 analysis-section">
                                <div className="card-header">
                                    <h5><i className="bi bi-graph-up me-2"></i>Szczegółowe statystyki</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6>Użytkownicy</h6>
                                            <p>Unikalni: <strong>{transformStats.uniqueUsers}</strong></p>
                                            <p>Najaktywniejszy: <strong>{transformStats.topUser?.user || 'N/A'}</strong>
                                                ({transformStats.topUser?.count || 0} działań)</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Pojazdy</h6>
                                            <p>Traktory: <strong>{transformStats.vehicleStats.tractors}</strong></p>
                                            <p>Naczepy: <strong>{transformStats.vehicleStats.trailers}</strong></p>
                                            <p>VS Naczepy: <strong>{transformStats.vehicleStats.vsTrailers}</strong></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Compare Tab */}
                {activeTab === 'compare' && (
                    <div className="tab-pane fade show active">
                        {/* Current Data Charts Section */}
                        {allData.length > 0 && (
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5><i className="bi bi-graph-up me-2"></i>Wykresy aktualnych danych</h5>
                                </div>
                                <div className="card-body">
                                    {/* Current Data Stats */}
                                    <div className="row mb-4">
                                        <div className="col-md-3">
                                            <div className="card bg-warning text-white text-center">
                                                <div className="card-body">
                                                    <h3 className="mb-0">{categorizedData.ib.length}</h3>
                                                    <small>IB (0994)</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-primary text-white text-center">
                                                <div className="card-body">
                                                    <h3 className="mb-0">{categorizedData.ob.length}</h3>
                                                    <small>OB (Pozostałe)</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-danger text-white text-center">
                                                <div className="card-body">
                                                    <h3 className="mb-0">{categorizedData.atseu.length}</h3>
                                                    <small>ATSEU (VS)</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-secondary text-white text-center">
                                                <div className="card-body">
                                                    <h3 className="mb-0">{categorizedData.other.length}</h3>
                                                    <small>OTHER</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Data Charts Grid */}
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="card">
                                                <div className="card-body">
                                                    <CurrentDataChart
                                                        type="pie"
                                                        data={categorizedData}
                                                        title="Rozkład kategorii"
                                                        canvasId="currentPieChart"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card">
                                                <div className="card-body">
                                                    <CurrentDataChart
                                                        type="doughnut"
                                                        data={categorizedData}
                                                        title="Procentowy rozkład"
                                                        canvasId="currentDoughnutChart"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row g-4 mt-2">
                                        <div className="col-md-6">
                                            <div className="card">
                                                <div className="card-body">
                                                    <CurrentDataChart
                                                        type="bar"
                                                        data={categorizedData}
                                                        title="Liczba rekordów"
                                                        canvasId="currentBarChart"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card">
                                                <div className="card-body">
                                                    <CurrentTimelineChart
                                                        data={allData}
                                                        canvasId="currentTimelineChart"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Activity Analysis */}
                                    <div className="row g-4 mt-2">
                                        <div className="col-md-6">
                                            <div className="card">
                                                <div className="card-body">
                                                    <UserActivityChart
                                                        data={allData}
                                                        canvasId="userActivityChart"
                                                        type="bar"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card">
                                                <div className="card-body">
                                                    <UserActivityChart
                                                        data={allData}
                                                        canvasId="userActivityPieChart"
                                                        type="pie"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Users Stats */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <div className="card top-users-card">
                                                <div className="card-header">
                                                    <h6 className="mb-0">
                                                        <i className="bi bi-person-fill me-2"></i>Top 10 użytkowników
                                                        <span className="badge bg-primary ms-2">10</span>
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <TopUsersTable data={allData} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Buffer Comparison Section */}
                        <div className="card">
                            <div className="card-header">
                                <h5><i className="bi bi-bar-chart me-2"></i>Chart - Analiza porównawcza</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="form-label">Pierwszy bufor:</label>
                                        <select
                                            className="form-select"
                                            value={compareBuffers.buffer1?.id || ''}
                                            onChange={(e) => {
                                                const buffer = buffersList.find(b => b.id === e.target.value);
                                                setCompareBuffers(prev => ({ ...prev, buffer1: buffer, result: null }));
                                            }}
                                        >
                                            <option value="">Wybierz bufor...</option>
                                            {buffersList.map(buffer => (
                                                <option key={buffer.id} value={buffer.id}>
                                                    {buffer.name} ({buffer.recordCount} rekordów)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Drugi bufor:</label>
                                        <select
                                            className="form-select"
                                            value={compareBuffers.buffer2?.id || ''}
                                            onChange={(e) => {
                                                const buffer = buffersList.find(b => b.id === e.target.value);
                                                setCompareBuffers(prev => ({ ...prev, buffer2: buffer, result: null }));
                                            }}
                                        >
                                            <option value="">Wybierz bufor...</option>
                                            {buffersList.map(buffer => (
                                                <option key={buffer.id} value={buffer.id}>
                                                    {buffer.name} ({buffer.recordCount} rekordów)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <button
                                        className="btn btn-primary"
                                        onClick={performComparison}
                                        disabled={!compareBuffers.buffer1 || !compareBuffers.buffer2}
                                    >
                                        <i className="bi bi-search me-2"></i>Porównaj bufory
                                    </button>
                                </div>

                                {compareBuffers.result && (
                                    <div className="mt-4">
                                        {/* Quick Stats Overview */}
                                        <div className="row mb-4 comparison-stats">
                                            <div className="col-md-3">
                                                <div className="card bg-success text-white text-center">
                                                    <div className="card-body">
                                                        <h3 className="mb-0">{compareBuffers.result.stats.commonCount}</h3>
                                                        <small>Wspólne rekordy</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-primary text-white text-center">
                                                    <div className="card-body">
                                                        <h3 className="mb-0">{compareBuffers.result.stats.unique1Count}</h3>
                                                        <small>Tylko w pierwszym</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-warning text-white text-center">
                                                    <div className="card-body">
                                                        <h3 className="mb-0">{compareBuffers.result.stats.unique2Count}</h3>
                                                        <small>Tylko w drugim</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card bg-info text-white text-center">
                                                    <div className="card-body">
                                                        <h3 className="mb-0">{compareBuffers.result.stats.similarity}%</h3>
                                                        <small>Podobieństwo</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Charts Grid */}
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-body">
                                                        <ComparisonChart
                                                            type="pie"
                                                            data={compareBuffers.result}
                                                            title="Rozkład danych"
                                                            canvasId="pieChart"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-body">
                                                        <ComparisonChart
                                                            type="doughnut"
                                                            data={compareBuffers.result}
                                                            title="Poziom podobieństwa"
                                                            canvasId="doughnutChart"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row g-4 mt-2">
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-body">
                                                        <ComparisonChart
                                                            type="bar"
                                                            data={compareBuffers.result}
                                                            title="Porównanie objętości"
                                                            canvasId="barChart"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-body">
                                                        <ComparisonChart
                                                            type="radar"
                                                            data={compareBuffers.result}
                                                            title="Analiza kategorii"
                                                            canvasId="radarChart"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timeline Analysis */}
                                        <div className="row mt-4">
                                            <div className="col-12">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5 className="mb-0">
                                                            <i className="bi bi-clock me-2"></i>Analiza czasowa
                                                        </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <TimelineChart
                                                            data={compareBuffers.result}
                                                            canvasId="timelineChart"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Analysis */}
                                        <div className="row mt-4">
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="bi bi-file-text me-2"></i>{compareBuffers.result.buffer1Name}
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="row text-center">
                                                            <div className="col-6">
                                                                <h4 className="text-primary">{compareBuffers.result.stats.total1}</h4>
                                                                <small className="text-muted">Łączne rekordy</small>
                                                            </div>
                                                            <div className="col-6">
                                                                <h4 className="text-info">{compareBuffers.result.stats.unique1Count}</h4>
                                                                <small className="text-muted">Unikalne rekordy</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="bi bi-file-text me-2"></i>{compareBuffers.result.buffer2Name}
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="row text-center">
                                                            <div className="col-6">
                                                                <h4 className="text-warning">{compareBuffers.result.stats.total2}</h4>
                                                                <small className="text-muted">Łączne rekordy</small>
                                                            </div>
                                                            <div className="col-6">
                                                                <h4 className="text-info">{compareBuffers.result.stats.unique2Count}</h4>
                                                                <small className="text-muted">Unikalne rekordy</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Export Options */}
                                        <div className="row mt-4">
                                            <div className="col-12">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="bi bi-download me-2"></i>Eksport wyników porównania
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="btn-group">
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                onClick={() => exportComparisonData('common')}
                                                            >
                                                                <i className="bi bi-download me-2"></i>Wspólne rekordy
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-info"
                                                                onClick={() => exportComparisonData('unique1')}
                                                            >
                                                                <i className="bi bi-download me-2"></i>Unikalne z {compareBuffers.result.buffer1Name}
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-warning"
                                                                onClick={() => exportComparisonData('unique2')}
                                                            >
                                                                <i className="bi bi-download me-2"></i>Unikalne z {compareBuffers.result.buffer2Name}
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-success"
                                                                onClick={() => exportComparisonData('full')}
                                                            >
                                                                <i className="bi bi-download me-2"></i>Pełny raport
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Initialize React App
ReactDOM.render(<App />, document.getElementById('root'));
