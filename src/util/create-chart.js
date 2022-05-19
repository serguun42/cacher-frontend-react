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
          data: sizeByDaysReversed.map((coll) => coll.count),
          fill: true,
          ...CHART_COLORS,
        },
      ],
    },
  });
}
