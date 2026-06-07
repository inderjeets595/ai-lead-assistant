/* ── Chart.js Theme Management ── */
let trendChart, sentimentChart, statusChart, scoreDistChart, langChart;

// Get dynamic context from JSON data payload
const dataEl = document.getElementById('analytics-data');
if (dataEl) {
    const analyticsData = JSON.parse(dataEl.textContent);

    function getThemeColors() {
        const isDark = document.documentElement.classList.contains('dark-theme');
        return {
            isDark: isDark,
            text: isDark ? '#9ca3af' : '#64748b',
            grid: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            tooltipBg: isDark ? 'rgba(17, 24, 39, 0.96)' : 'rgba(255, 255, 255, 0.96)',
            tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
            tooltipTitle: isDark ? '#f3f4f6' : '#0f172a',
            tooltipBody: isDark ? '#9ca3af' : '#475569',
            cardBg: isDark ? '#111827' : '#ffffff',
            originalSegmentBg: isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(148, 163, 184, 0.25)'
        };
    }

    function initCharts() {
        const colors = getThemeColors();
        
        // Set global defaults
        Chart.defaults.color = colors.text;
        Chart.defaults.borderColor = colors.grid;

        /* ── Trend Chart ── */
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        const trendGrad = trendCtx.createLinearGradient(0, 0, 0, 300);
        trendGrad.addColorStop(0,   'rgba(37,99,235,0.18)');
        trendGrad.addColorStop(1,   'rgba(37,99,235,0.00)');
        
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: analyticsData.dailyLabels,
                datasets: [{
                    label: 'New Leads',
                    data: analyticsData.dailyValues,
                    borderColor: '#3b82f6',
                    backgroundColor: trendGrad,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: colors.cardBg,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.45
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1200, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleColor: colors.tooltipTitle,
                        bodyColor: colors.tooltipBody,
                        padding: 10,
                        cornerRadius: 10
                    }
                },
                scales: {
                    x: { grid: { color: colors.grid }, ticks: { color: colors.text, font: { size: 11 } } },
                    y: { beginAtZero: true, ticks: { stepSize: 1, color: colors.text, font: { size: 11 } }, grid: { color: colors.grid } }
                }
            }
        });

        /* ── Sentiment Doughnut ── */
        const sentCtx = document.getElementById('sentimentChart').getContext('2d');
        sentimentChart = new Chart(sentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [
                        analyticsData.sentimentCounts.Positive, 
                        analyticsData.sentimentCounts.Neutral, 
                        analyticsData.sentimentCounts.Negative
                    ],
                    backgroundColor: ['rgba(34,197,94,0.80)', 'rgba(245,158,11,0.80)', 'rgba(239,68,68,0.80)'],
                    borderColor: colors.cardBg,
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                animation: { animateRotate: true, duration: 1200 },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 16, usePointStyle: true, font: { size: 12 }, color: colors.text }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleColor: colors.tooltipTitle,
                        bodyColor: colors.tooltipBody,
                        padding: 10,
                        cornerRadius: 10
                    }
                }
            }
        });

        /* ── Status Doughnut ── */
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Hot', 'Warm', 'Cold'],
                datasets: [{
                    data: [
                        analyticsData.statusCounts.Hot, 
                        analyticsData.statusCounts.Warm, 
                        analyticsData.statusCounts.Cold
                    ],
                    backgroundColor: ['rgba(239,68,68,0.80)', 'rgba(245,158,11,0.80)', 'rgba(37,99,235,0.80)'],
                    borderColor: colors.cardBg,
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                animation: { animateRotate: true, duration: 1400 },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 14, usePointStyle: true, font: { size: 12 }, color: colors.text }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleColor: colors.tooltipTitle,
                        bodyColor: colors.tooltipBody,
                        padding: 10,
                        cornerRadius: 10
                    }
                }
            }
        });

        /* ── Score Distribution Bar ── */
        const scoreCtx = document.getElementById('scoreDistChart').getContext('2d');
        const barGrad = scoreCtx.createLinearGradient(0, 0, 0, 200);
        barGrad.addColorStop(0, 'rgba(99,102,241,0.90)');
        barGrad.addColorStop(1, 'rgba(37,99,235,0.40)');
        scoreDistChart = new Chart(scoreCtx, {
            type: 'bar',
            data: {
                labels: ['0–20', '21–40', '41–60', '61–80', '81–100'],
                datasets: [{
                    label: 'Leads',
                    data: [
                        analyticsData.scoreDist['0-20'], 
                        analyticsData.scoreDist['21-40'], 
                        analyticsData.scoreDist['41-60'], 
                        analyticsData.scoreDist['61-80'], 
                        analyticsData.scoreDist['81-100']
                    ],
                    backgroundColor: barGrad,
                    borderColor: 'rgba(99,102,241,0.60)',
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1200, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleColor: colors.tooltipTitle,
                        bodyColor: colors.tooltipBody,
                        padding: 10,
                        cornerRadius: 10
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: colors.text, font: { size: 11 } } },
                    y: { beginAtZero: true, ticks: { stepSize: 1, color: colors.text, font: { size: 11 } }, grid: { color: colors.grid } }
                }
            }
        });

        /* ── Language Doughnut ── */
        const langCtx = document.getElementById('langChart').getContext('2d');
        langChart = new Chart(langCtx, {
            type: 'doughnut',
            data: {
                labels: ['Translated', 'Original'],
                datasets: [{
                    data: [analyticsData.translatedLeads, analyticsData.nonTranslatedLeads],
                    backgroundColor: ['rgba(59,130,246,0.82)', colors.originalSegmentBg],
                    borderColor: colors.cardBg,
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                animation: { animateRotate: true, duration: 1400 },
                plugins: { legend: { display: false } }
            }
        });
    }

    function updateChartsTheme() {
        const colors = getThemeColors();

        if (trendChart) {
            trendChart.options.scales.x.grid.color = colors.grid;
            trendChart.options.scales.x.ticks.color = colors.text;
            trendChart.options.scales.y.grid.color = colors.grid;
            trendChart.options.scales.y.ticks.color = colors.text;
            trendChart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
            trendChart.options.plugins.tooltip.borderColor = colors.tooltipBorder;
            trendChart.options.plugins.tooltip.titleColor = colors.tooltipTitle;
            trendChart.options.plugins.tooltip.bodyColor = colors.tooltipBody;
            trendChart.data.datasets[0].pointBorderColor = colors.cardBg;
            trendChart.update();
        }

        if (sentimentChart) {
            sentimentChart.options.plugins.legend.labels.color = colors.text;
            sentimentChart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
            sentimentChart.options.plugins.tooltip.borderColor = colors.tooltipBorder;
            sentimentChart.options.plugins.tooltip.titleColor = colors.tooltipTitle;
            sentimentChart.options.plugins.tooltip.bodyColor = colors.tooltipBody;
            sentimentChart.data.datasets[0].borderColor = colors.cardBg;
            sentimentChart.update();
        }

        if (statusChart) {
            statusChart.options.plugins.legend.labels.color = colors.text;
            statusChart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
            statusChart.options.plugins.tooltip.borderColor = colors.tooltipBorder;
            statusChart.options.plugins.tooltip.titleColor = colors.tooltipTitle;
            statusChart.options.plugins.tooltip.bodyColor = colors.tooltipBody;
            statusChart.data.datasets[0].borderColor = colors.cardBg;
            statusChart.update();
        }

        if (scoreDistChart) {
            scoreDistChart.options.scales.x.ticks.color = colors.text;
            scoreDistChart.options.scales.y.grid.color = colors.grid;
            scoreDistChart.options.scales.y.ticks.color = colors.text;
            scoreDistChart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
            scoreDistChart.options.plugins.tooltip.borderColor = colors.tooltipBorder;
            scoreDistChart.options.plugins.tooltip.titleColor = colors.tooltipTitle;
            scoreDistChart.options.plugins.tooltip.bodyColor = colors.tooltipBody;
            scoreDistChart.update();
        }

        if (langChart) {
            langChart.data.datasets[0].backgroundColor[1] = colors.originalSegmentBg;
            langChart.data.datasets[0].borderColor = colors.cardBg;
            langChart.update();
        }
    }

    // Initial initialization
    initCharts();

    // Listen to themeChanged event from base.html toggle
    window.addEventListener('themeChanged', updateChartsTheme);

    /* ── Health Ring Animated Counter ── */
    (function () {
        const target = analyticsData.performanceScore;
        const el = document.getElementById('healthNum');
        if (!el) return;
        let current = 0;
        const duration = 1600;
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            current = Math.round(ease * target);
            el.textContent = current + '%';
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    })();

    /* ── Animate width from data-width to bypass CSS linter double braces errors ── */
    document.querySelectorAll('.animate-width').forEach(el => {
        let val = parseFloat(el.getAttribute('data-width'));
        if (!isNaN(val)) {
            if (val < 0) val = 0;
            if (val > 100) val = 100;
            el.style.width = val + '%';
        }
    });
}

/* ═══════════════════════════════════════════════════════════
   AI ACCURACY ANALYTICS — Chart Initialization
   Reads from <script id="accuracy-data"> — fully isolated.
   Existing chart variables / functions are NOT referenced.
═══════════════════════════════════════════════════════════ */
(function () {
    const accDataEl = document.getElementById('accuracy-data');
    if (!accDataEl) return;   // guard: don't run on empty-state page

    const accData = JSON.parse(accDataEl.textContent);

    // Reuse theme helper from the outer scope (both scripts share the page)
    function getAccThemeColors() {
        const isDark = document.documentElement.classList.contains('dark-theme');
        return {
            isDark,
            text:         isDark ? '#9ca3af' : '#64748b',
            grid:         isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            tooltipBg:    isDark ? 'rgba(17,24,39,0.96)'   : 'rgba(255,255,255,0.96)',
            tooltipBorder:isDark ? 'rgba(255,255,255,0.08)':'rgba(15,23,42,0.08)',
            tooltipTitle: isDark ? '#f3f4f6' : '#0f172a',
            tooltipBody:  isDark ? '#9ca3af' : '#475569',
            cardBg:       isDark ? '#111827' : '#ffffff',
        };
    }

    let accTrendChart, accBreakdownChart;

    function initAccuracyCharts() {
        const colors = getAccThemeColors();

        /* ── Accuracy Trend Line Chart ── */
        const trendCtx = document.getElementById('accuracyTrendChart');
        if (trendCtx) {
            const trendGrad = trendCtx.getContext('2d').createLinearGradient(0, 0, 0, 250);
            trendGrad.addColorStop(0, 'rgba(20,184,166,0.20)');
            trendGrad.addColorStop(1, 'rgba(20,184,166,0.00)');

            accTrendChart = new Chart(trendCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: accData.trendLabels,
                    datasets: [{
                        label: 'Accuracy %',
                        data: accData.trendValues,
                        borderColor: '#14b8a6',
                        backgroundColor: trendGrad,
                        borderWidth: 2.5,
                        pointBackgroundColor: '#14b8a6',
                        pointBorderColor: colors.cardBg,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.45
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 1200, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: colors.tooltipBg,
                            borderColor: colors.tooltipBorder,
                            borderWidth: 1,
                            titleColor: colors.tooltipTitle,
                            bodyColor: colors.tooltipBody,
                            padding: 10,
                            cornerRadius: 10,
                            callbacks: {
                                label: ctx => ` ${ctx.parsed.y}% accurate`
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: colors.grid },
                            ticks: { color: colors.text, font: { size: 11 } }
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                color: colors.text,
                                font: { size: 11 },
                                callback: v => v + '%'
                            },
                            grid: { color: colors.grid }
                        }
                    }
                }
            });
        }

        /* ── Accuracy Breakdown Grouped Bar Chart ── */
        const breakCtx = document.getElementById('accuracyBreakdownChart');
        if (breakCtx) {
            accBreakdownChart = new Chart(breakCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Hot Lead', 'Warm Lead', 'Cold Lead'],
                    datasets: [
                        {
                            label: 'Correct',
                            data: [
                                accData.breakdown.Hot.correct,
                                accData.breakdown.Warm.correct,
                                accData.breakdown.Cold.correct
                            ],
                            backgroundColor: 'rgba(34,197,94,0.80)',
                            borderColor: 'rgba(34,197,94,0.95)',
                            borderWidth: 1,
                            borderRadius: 6,
                            borderSkipped: false
                        },
                        {
                            label: 'Incorrect',
                            data: [
                                accData.breakdown.Hot.incorrect,
                                accData.breakdown.Warm.incorrect,
                                accData.breakdown.Cold.incorrect
                            ],
                            backgroundColor: 'rgba(239,68,68,0.78)',
                            borderColor: 'rgba(239,68,68,0.95)',
                            borderWidth: 1,
                            borderRadius: 6,
                            borderSkipped: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 1200, easing: 'easeOutQuart' },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 16,
                                usePointStyle: true,
                                font: { size: 12 },
                                color: colors.text
                            }
                        },
                        tooltip: {
                            backgroundColor: colors.tooltipBg,
                            borderColor: colors.tooltipBorder,
                            borderWidth: 1,
                            titleColor: colors.tooltipTitle,
                            bodyColor: colors.tooltipBody,
                            padding: 10,
                            cornerRadius: 10
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: colors.text, font: { size: 11 } }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: colors.text, font: { size: 11 } },
                            grid: { color: colors.grid }
                        }
                    }
                }
            });
        }
    }

    function updateAccuracyChartsTheme() {
        const colors = getAccThemeColors();

        if (accTrendChart) {
            accTrendChart.options.scales.x.grid.color  = colors.grid;
            accTrendChart.options.scales.x.ticks.color = colors.text;
            accTrendChart.options.scales.y.grid.color  = colors.grid;
            accTrendChart.options.scales.y.ticks.color = colors.text;
            accTrendChart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
            accTrendChart.options.plugins.tooltip.borderColor     = colors.tooltipBorder;
            accTrendChart.options.plugins.tooltip.titleColor      = colors.tooltipTitle;
            accTrendChart.options.plugins.tooltip.bodyColor       = colors.tooltipBody;
            accTrendChart.data.datasets[0].pointBorderColor       = colors.cardBg;
            accTrendChart.update();
        }

        if (accBreakdownChart) {
            accBreakdownChart.options.plugins.legend.labels.color = colors.text;
            accBreakdownChart.options.scales.x.ticks.color = colors.text;
            accBreakdownChart.options.scales.y.grid.color  = colors.grid;
            accBreakdownChart.options.scales.y.ticks.color = colors.text;
            accBreakdownChart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
            accBreakdownChart.options.plugins.tooltip.borderColor     = colors.tooltipBorder;
            accBreakdownChart.options.plugins.tooltip.titleColor      = colors.tooltipTitle;
            accBreakdownChart.options.plugins.tooltip.bodyColor       = colors.tooltipBody;
            accBreakdownChart.update();
        }
    }

    // Initialize charts
    initAccuracyCharts();

    // Sync to the same themeChanged event as the rest of the dashboard
    window.addEventListener('themeChanged', updateAccuracyChartsTheme);

})();
