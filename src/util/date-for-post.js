export const MONTHS_FULL_INFINITIVE = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export const MONTHS_SHORT_GENETIVE = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июня',
  'июля',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

export const SHORT_DAY_OF_WEEK = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

/**
 * @param {number | string | Date} date
 * @param {boolean} [toISO = false]
 * @param {boolean} [onlyDate = false]
 * @returns {string}
 */
export default function DateForPost(date, toISO = false, onlyDate = false) {
  if (!date) date = new Date();

  const postDate =
    date instanceof Date
      ? date
      : typeof date === 'string'
      ? new Date(date)
      : new Date(date < 1e7 ? date * 1e6 : date * 1e3);

  if (!postDate.getTime()) return '…';

  if (toISO) {
    if (onlyDate) return postDate.toISOString().split('T')[0];

    return postDate.toISOString();
  }

  const day = 86400e3;
  const offsetInMS = new Date().getTimezoneOffset() * 60 * 1e3;
  const nowForComparison = Date.now() - offsetInMS;
  const postForComparison = postDate.getTime() - offsetInMS;
  const isToday = postForComparison - (postForComparison % day) === nowForComparison - (nowForComparison % day);
  const isYesterday =
    postForComparison - (postForComparison % day) === nowForComparison - (nowForComparison % day) - day;
  const timeString = `${postDate.getHours().toString().padStart(2, '0')}:${postDate
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  if (isToday) {
    if (onlyDate) return 'Сегодня';

    return timeString;
  }

  if (isYesterday) {
    if (onlyDate) return 'Вчера';

    return `Вчера, ${timeString}`;
  }

  if (Date.now() - postDate.getTime() < 30 * day) {
    if (onlyDate) return `${postDate.getDate()} ${MONTHS_SHORT_GENETIVE[postDate.getMonth()]}`;

    return `${postDate.getDate()} ${MONTHS_SHORT_GENETIVE[postDate.getMonth()]}, ${timeString}`;
  }

  if (postDate.getFullYear() === new Date().getFullYear()) {
    if (onlyDate) return `${postDate.getDate()} ${MONTHS_SHORT_GENETIVE[postDate.getMonth()]}`;

    return `${postDate.getDate()} ${MONTHS_SHORT_GENETIVE[postDate.getMonth()]}, ${timeString}`;
  }

  if (onlyDate) return `${postDate.getDate()} ${MONTHS_SHORT_GENETIVE[postDate.getMonth()]} ${postDate.getFullYear()}`;

  return `${postDate.getDate()} ${MONTHS_SHORT_GENETIVE[postDate.getMonth()]} ${postDate.getFullYear()}, ${timeString}`;
}
