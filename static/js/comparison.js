/* ═══════════════════════════════════════
   COMPARISON.JS — Comparison Dashboard Logic
   Requires: Chart.js (loaded via base.html)
═══════════════════════════════════════ */

(function () {
    'use strict';

    // ── Data injected by the template ──
    const DATA = window.comparisonData || {
        existing: { efficiency: 68.4, accuracy: 82.5, processing_speed: 74.2, customer_satisfaction: 78.0, cost_efficiency: 71.5 },
        proposed: { efficiency: 71.2, accuracy: 85.3, processing_speed: 77.0, customer_satisfaction: 80.8, cost_efficiency: 74.3 }
    };

    // ── Metric definitions ──
    const METRICS = [
        { key: 'efficiency',             label: 'Efficiency',             icon: 'fa-bolt',          chartType: 'doughnut' },
        { key: 'accuracy',               label: 'Accuracy',               icon: 'fa-bullseye',      chartType: 'bar' },
        { key: 'processing_speed',       label: 'Processing Speed',       icon: 'fa-gauge-high',    chartType: 'line' },
        { key: 'customer_satisfaction',   label: 'Customer Satisfaction',  icon: 'fa-face-smile',    chartType: 'radar' },
        { key: 'cost_efficiency',         label: 'Cost Efficiency',        icon: 'fa-coins',         chartType: 'horizontalBar' },
    ];

    // ── Color Theme (Matched to Button Screenshots) ──
    // Existing Approach: Violet/Indigo (#6366f1)
    // Proposed Approach: Emerald/Mint Green (#10b981)
    const THEME_COLORS = {
        existing: { main: '#6366f1', light: 'rgba(99, 102, 241, 0.18)', border: '#818cf8' },
        proposed: { main: '#10b981', light: 'rgba(16, 185, 129, 0.18)', border: '#34d399' }
    };

    // ── State ──
    let existingGenerated = false;
    let proposedGenerated = false;
    let chartInstances = {};

    // ── DOM refs ──
    const genExistingBtn = document.getElementById('genExistingBtn');
    const genProposedBtn = document.getElementById('genProposedBtn');
    const statusExisting = document.getElementById('statusExisting');
    const statusProposed = document.getElementById('statusProposed');
    const plotBtn = document.getElementById('plotResultsBtn');
    const plotHintText = document.getElementById('plotHintText');
    const chartsContainer = document.getElementById('chartsContainer');
    const chartsPlaceholder = document.getElementById('chartsPlaceholder');

    // ═══════════════════════════════════════
    // STEP 1: GENERATE EXISTING DATA
    // ═══════════════════════════════════════

    if (genExistingBtn) {
        genExistingBtn.addEventListener('click', function () {
            existingGenerated = true;

            // Update status badge
            if (statusExisting) {
                statusExisting.className = 'gen-status-badge status-success';
                statusExisting.innerHTML = '<i class="fas fa-check-circle"></i> Existing Data Generated';
            }

            // Animate Existing KPI Values & Bars
            METRICS.forEach(function (metric, idx) {
                var value = DATA.existing[metric.key];
                var valEl = document.getElementById('existing-val-' + idx);
                var barEl = document.getElementById('existing-bar-' + idx);

                if (valEl) animateValue(valEl, value);
                if (barEl) barEl.style.width = value + '%';
            });

            // Check if both datasets are ready to unlock Plot Results
            checkBothGenerated();
        });
    }

    // ═══════════════════════════════════════
    // STEP 2: GENERATE PROPOSED DATA
    // ═══════════════════════════════════════

    if (genProposedBtn) {
        genProposedBtn.addEventListener('click', function () {
            proposedGenerated = true;

            // Update status badge
            if (statusProposed) {
                statusProposed.className = 'gen-status-badge status-success';
                statusProposed.innerHTML = '<i class="fas fa-check-circle"></i> Proposed Data Generated';
            }

            // Animate Proposed KPI Values, Bars & Delta (Existing values remain visible!)
            METRICS.forEach(function (metric, idx) {
                var value = DATA.proposed[metric.key];
                var valEl = document.getElementById('proposed-val-' + idx);
                var barEl = document.getElementById('proposed-bar-' + idx);
                var deltaEl = document.getElementById('delta-' + idx);

                if (valEl) animateValue(valEl, value);
                if (barEl) barEl.style.width = value + '%';

                if (deltaEl) {
                    var diff = Math.round((DATA.proposed[metric.key] - DATA.existing[metric.key]) * 10) / 10;
                    deltaEl.innerHTML = '<i class="fas fa-arrow-up"></i> +' + diff + '% improvement';
                    deltaEl.style.display = 'inline-flex';
                }
            });

            // Check if both datasets are ready to unlock Plot Results
            checkBothGenerated();
        });
    }

    // ═══════════════════════════════════════
    // CHECK BOTH GENERATED & UNLOCK PLOT BUTTON
    // ═══════════════════════════════════════

    function checkBothGenerated() {
        if (existingGenerated && proposedGenerated) {
            if (plotBtn) {
                plotBtn.disabled = false;
                plotBtn.classList.remove('disabled-btn');
                plotBtn.classList.add('active-btn');
            }

            if (plotHintText) {
                plotHintText.innerHTML = '<i class="fas fa-check-circle text-success me-1"></i> Both datasets generated! Click <strong>Plot Results</strong> to view comparison graphs.';
            }
        }
    }

    // ═══════════════════════════════════════
    // ANIMATE NUMBER VALUE
    // ═══════════════════════════════════════

    function animateValue(el, target) {
        var start = parseFloat(el.textContent) || 0;
        var duration = 700;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            var current = (start + (target - start) * eased).toFixed(1);
            el.textContent = current + '%';
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // ═══════════════════════════════════════
    // STEP 3: PLOT RESULTS (CHARTS GENERATION)
    // ═══════════════════════════════════════

    if (plotBtn) {
        plotBtn.addEventListener('click', function () {
            if (!existingGenerated || !proposedGenerated) return;

            renderCharts();

            // Smooth scroll to charts section
            if (chartsContainer) {
                chartsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    function renderCharts() {
        // Show charts container, hide placeholder
        if (chartsContainer) chartsContainer.style.display = 'grid';
        if (chartsPlaceholder) chartsPlaceholder.style.display = 'none';

        // Destroy all existing chart instances
        Object.keys(chartInstances).forEach(function (key) {
            if (chartInstances[key]) {
                chartInstances[key].destroy();
                chartInstances[key] = null;
            }
        });

        // Detect dark theme
        var isDark = document.documentElement.classList.contains('dark-theme');
        var gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)';
        var textColor = isDark ? '#9ca3af' : '#64748b';
        var bgBorderColor = isDark ? '#111827' : '#ffffff';

        // Create charts comparing both datasets with matched button colors
        METRICS.forEach(function (metric, idx) {
            var canvasId = 'chart-' + idx;
            var canvas = document.getElementById(canvasId);
            if (!canvas) return;

            var ctx = canvas.getContext('2d');

            var config = buildChartConfig(metric, gridColor, textColor, bgBorderColor);
            chartInstances[canvasId] = new Chart(ctx, config);
        });
    }

    // ═══════════════════════════════════════
    // BUILD CHART CONFIGS
    // ═══════════════════════════════════════

    function buildChartConfig(metric, gridColor, textColor, bgBorderColor) {
        var existingVal = DATA.existing[metric.key];
        var proposedVal = DATA.proposed[metric.key];

        var cExisting = THEME_COLORS.existing.main; // #6366f1 (Indigo/Violet)
        var cProposed = THEME_COLORS.proposed.main; // #10b981 (Emerald Green)

        switch (metric.chartType) {

            // 1. Doughnut Chart (Dual Ring)
            case 'doughnut':
                return {
                    type: 'doughnut',
                    data: {
                        labels: ['Existing', 'Remaining', 'Proposed', 'Remaining'],
                        datasets: [
                            {
                                label: 'Proposed',
                                data: [proposedVal, 100 - proposedVal],
                                backgroundColor: [cProposed, gridColor],
                                borderWidth: 0,
                                borderRadius: 999,
                                hoverOffset: 6
                            },
                            {
                                label: 'Existing',
                                data: [existingVal, 100 - existingVal],
                                backgroundColor: [cExisting, gridColor],
                                borderWidth: 0,
                                borderRadius: 999,
                                hoverOffset: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '58%',
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    color: textColor,
                                    font: { family: 'Inter', size: 11, weight: '600' },
                                    padding: 16,
                                    usePointStyle: true,
                                    pointStyle: 'circle',
                                    generateLabels: function () {
                                        return [
                                            { text: 'Existing: ' + existingVal + '%', fillStyle: cExisting, strokeStyle: 'transparent', pointStyle: 'circle' },
                                            { text: 'Proposed: ' + proposedVal + '%', fillStyle: cProposed, strokeStyle: 'transparent', pointStyle: 'circle' }
                                        ];
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15,23,42,0.92)',
                                titleFont: { family: 'Inter', weight: '600' },
                                bodyFont: { family: 'Inter' },
                                cornerRadius: 10,
                                padding: 12,
                                callbacks: {
                                    label: function (ctx) {
                                        var approach = ctx.datasetIndex === 0 ? 'Proposed' : 'Existing';
                                        return approach + ': ' + ctx.parsed + '%';
                                    }
                                }
                            }
                        },
                        animation: { animateRotate: true, duration: 1200, easing: 'easeOutQuart' }
                    }
                };

            // 2. Vertical Bar Chart (Accuracy)
            case 'bar':
                return {
                    type: 'bar',
                    data: {
                        labels: [metric.label],
                        datasets: [
                            {
                                label: 'Existing Approach',
                                data: [existingVal],
                                backgroundColor: cExisting,
                                borderRadius: 999,
                                borderSkipped: false,
                                barThickness: 28
                            },
                            {
                                label: 'Proposed Approach',
                                data: [proposedVal],
                                backgroundColor: cProposed,
                                borderRadius: 999,
                                borderSkipped: false,
                                barThickness: 28
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        categoryPercentage: 0.6,
                        barPercentage: 0.75,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    color: textColor,
                                    font: { family: 'Inter', size: 11, weight: '600' },
                                    padding: 16,
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15,23,42,0.92)',
                                cornerRadius: 10,
                                padding: 12,
                                titleFont: { family: 'Inter', weight: '600' },
                                bodyFont: { family: 'Inter' },
                                callbacks: {
                                    label: function (ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y + '%'; }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true, max: 100,
                                grid: { color: gridColor },
                                ticks: { color: textColor, font: { family: 'Inter', size: 11 }, callback: function(v){ return v + '%'; } }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: '600' }, padding: 8 }
                            }
                        },
                        animation: { duration: 1000, easing: 'easeOutQuart' }
                    }
                };

            // 3. Line Chart (Dual Trend Lines)
            case 'line':
                return {
                    type: 'line',
                    data: {
                        labels: ['Baseline', 'Phase 1', 'Phase 2', 'Current', 'Projected'],
                        datasets: [
                            {
                                label: 'Existing Approach',
                                data: [
                                    Math.max(0, existingVal - 12),
                                    Math.max(0, existingVal - 7),
                                    Math.max(0, existingVal - 3),
                                    existingVal,
                                    Math.min(100, existingVal + 1)
                                ],
                                borderColor: cExisting,
                                backgroundColor: THEME_COLORS.existing.light,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 5,
                                pointBackgroundColor: bgBorderColor,
                                pointBorderColor: cExisting,
                                pointBorderWidth: 2,
                                pointHoverRadius: 7,
                                borderWidth: 2.5
                            },
                            {
                                label: 'Proposed Approach',
                                data: [
                                    Math.max(0, proposedVal - 10),
                                    Math.max(0, proposedVal - 5),
                                    Math.max(0, proposedVal - 2),
                                    proposedVal,
                                    Math.min(100, proposedVal + 3)
                                ],
                                borderColor: cProposed,
                                backgroundColor: THEME_COLORS.proposed.light,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 5,
                                pointBackgroundColor: bgBorderColor,
                                pointBorderColor: cProposed,
                                pointBorderWidth: 2.5,
                                pointHoverRadius: 7,
                                borderWidth: 2.5
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    color: textColor,
                                    font: { family: 'Inter', size: 11, weight: '600' },
                                    padding: 16,
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15,23,42,0.92)',
                                cornerRadius: 10,
                                padding: 12,
                                titleFont: { family: 'Inter', weight: '600' },
                                bodyFont: { family: 'Inter' },
                                callbacks: {
                                    label: function (ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y + '%'; }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                grid: { color: gridColor },
                                ticks: { color: textColor, font: { family: 'Inter', size: 11 }, callback: function(v){ return v + '%'; } }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
                            }
                        },
                        animation: { duration: 1200, easing: 'easeOutQuart' }
                    }
                };

            // 4. Customer Satisfaction (Sleek Horizontal Bar Pills)
            case 'radar':
                var csatLabels = ['Quality', 'Response Time', 'Resolution', 'Engagement', 'Retention'];
                var existingCsatData = [
                    Math.min(100, existingVal + 3),
                    Math.max(0, existingVal - 2),
                    Math.min(100, existingVal + 1),
                    Math.max(0, existingVal - 4),
                    Math.min(100, existingVal + 2)
                ];
                var proposedCsatData = [
                    Math.min(100, proposedVal + 3),
                    Math.max(0, proposedVal - 2),
                    Math.min(100, proposedVal + 1),
                    Math.max(0, proposedVal - 4),
                    Math.min(100, proposedVal + 2)
                ];
                return {
                    type: 'bar',
                    data: {
                        labels: csatLabels,
                        datasets: [
                            {
                                label: 'Existing Approach',
                                data: existingCsatData,
                                backgroundColor: cExisting,
                                borderRadius: 999,
                                borderSkipped: false,
                                barThickness: 10
                            },
                            {
                                label: 'Proposed Approach',
                                data: proposedCsatData,
                                backgroundColor: cProposed,
                                borderRadius: 999,
                                borderSkipped: false,
                                barThickness: 10
                            }
                        ]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        categoryPercentage: 0.75,
                        barPercentage: 0.7,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    color: textColor,
                                    font: { family: 'Inter', size: 11, weight: '600' },
                                    padding: 16,
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15,23,42,0.92)',
                                cornerRadius: 10,
                                padding: 12,
                                titleFont: { family: 'Inter', weight: '600' },
                                bodyFont: { family: 'Inter' },
                                callbacks: {
                                    label: function (ctx) { return ctx.dataset.label + ': ' + ctx.parsed.x + '%'; }
                                }
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                max: 100,
                                grid: { color: gridColor },
                                ticks: { color: textColor, font: { family: 'Inter', size: 11 }, callback: function(v){ return v + '%'; } }
                            },
                            y: {
                                grid: { display: false },
                                ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: '500' }, padding: 10 }
                            }
                        },
                        animation: { duration: 1000, easing: 'easeOutQuart' }
                    }
                };

            // 5. Cost Efficiency (Sleek Horizontal Bar Pills)
            case 'horizontalBar':
                return {
                    type: 'bar',
                    data: {
                        labels: [metric.label],
                        datasets: [
                            {
                                label: 'Existing Approach',
                                data: [existingVal],
                                backgroundColor: cExisting,
                                borderRadius: 999,
                                borderSkipped: false,
                                barThickness: 24
                            },
                            {
                                label: 'Proposed Approach',
                                data: [proposedVal],
                                backgroundColor: cProposed,
                                borderRadius: 999,
                                borderSkipped: false,
                                barThickness: 24
                            }
                        ]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        categoryPercentage: 0.75,
                        barPercentage: 0.45,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    color: textColor,
                                    font: { family: 'Inter', size: 11, weight: '600' },
                                    padding: 16,
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15,23,42,0.92)',
                                cornerRadius: 10,
                                padding: 12,
                                titleFont: { family: 'Inter', weight: '600' },
                                bodyFont: { family: 'Inter' },
                                callbacks: {
                                    label: function (ctx) { return ctx.dataset.label + ': ' + ctx.parsed.x + '%'; }
                                }
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true, max: 100,
                                grid: { color: gridColor },
                                ticks: { color: textColor, font: { family: 'Inter', size: 11 }, callback: function(v){ return v + '%'; } }
                            },
                            y: {
                                grid: { display: false },
                                ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: '600' }, padding: 10 }
                            }
                        },
                        animation: { duration: 1000, easing: 'easeOutQuart' }
                    }
                };

            default:
                return { type: 'bar', data: {}, options: {} };
        }
    }

    // ═══════════════════════════════════════
    // THEME CHANGE LISTENER
    // ═══════════════════════════════════════

    window.addEventListener('themeChanged', function () {
        if (Object.keys(chartInstances).length > 0) {
            renderCharts();
        }
    });

})();
