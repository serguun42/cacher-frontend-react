import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from 'chart.js';
import LogMessageOrError from './log';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement);

const MONTHS_SHORT_GENETIVE = ['янв', 'фев', 'мар', 'апр', 'мая', 'июня', 'июля', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import("../../types/stats_response").StatsResponse} stats
 * @returns {void}
 */
export default function CreateChart(context, stats) {
  if (!context) return LogMessageOrError(new Error(`No <canvasContext> in canvas:`), this.canvasRef);

  const sizeByDaysReversed = stats.sizeByDays.reverse();
  const CHART_COLORS = {
    borderColor: getComputedStyle(document.body).getPropertyValue('--primary')?.trim(),
    backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-faded')?.trim(),
    gridColor: 'rgba(128, 128, 128, 0.1)',
  };

  // eslint-disable-next-line no-new
  new Chart(context, {
    type: 'line',
    data: {
      labels: stats.sizeByDays.map(
        (coll) => `${new Date(coll.date).getDate()} ${MONTHS_SHORT_GENETIVE[new Date(coll.date).getMonth()]}`
      ),
      datasets: [
        {
          cubicInterpolationMode: 'monotone',
          borderColor: CHART_COLORS.borderColor,
          borderWidth: 1,
          data: sizeByDaysReversed.map((coll) => coll.count),
          fill: 'origin',
          label: 'Количество постов',
          pointBackgroundColor: CHART_COLORS.borderColor,
          pointBorderWidth: 2,
          pointStyle: 'circle',
        },
      ],
    },
    options: {
      scales: {
        y: {
          grace: '10%',
          grid: {
            color: CHART_COLORS.gridColor,
          },
          title: {
            display: true,
            text: 'Количество постов',
          },
        },
        x: {
          grid: {
            color: CHART_COLORS.gridColor,
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: window.innerWidth > 500 ? 15 : 10,
          },
        },
      },
    },
  });
}
