module.exports = {
    legend: {
        display: false,
        labels: {
            defaultFontFamily: 'Open Sans'
        }
    },
    layout: {
        padding: {
            bottom: -20,
            top: 0
        }
    },
    scales: {
        gridLines: {
            showBorder: false
        },
        yAxes: [
            {
                position: 'right',
                ticks: {
                    suggestedMax: 300,
                    beginAtZero: false,
                    stepSize: 100
                }
            }
        ],
        xAxes: [
            {
                display: false,
                drawBorder: false,
                ticks: {
                    display: false
                }
            }
        ]
    },
    tooltips: {
        custom(tooltip) {
            if (!tooltip) return;
            tooltip.displayColors = false;
        },
        callbacks: {
            label(value) {
                return `€${value.yLabel}`;
            }
        }
    }
};
