import { createRef, useEffect, useState } from 'react';
import { FadeIn, FadeOut } from '../util/animations';
import dispatcher from '../util/dispatcher';
import Ripple from './Ripple';
import './DatePicker.css';
import InputArea from './InputArea';
import DateForPost, { MONTHS_FULL_INFINITIVE, SHORT_DAY_OF_WEEK } from '../util/date-for-post';

/** @typedef {{ value: null | number, inRange: boolean, starting: boolean, ending: boolean }[]} WeekLayout */
/** @typedef {WeekLayout[]} MonthLayout */
/**
 * @typedef {Object} DatePickerPayload
 * @property {(start?: string, end?: string) => void} acceptAction
 * @property {() => void} denyAction
 */
/**
 * @typedef {Object} DatePickerState
 * @property {'calendar' | 'text'} type
 * @property {string} start
 * @property {string} end
 */

const DEFAULT_DATE_PICKER_TYPE = 'calendar';

const START_YEAR = 2011;
const ALL_YEARS = Array.from({ length: new Date().getFullYear() - START_YEAR + 1 }, (_, idx) => START_YEAR + idx);

export default function DatePicker() {
  const [timesOpened, setTimesOpened] = useState(0);

  const [shown, setShown] = useState(null);
  /** @type {['calendar' | 'text']} */
  const [type, setType] = useState(DEFAULT_DATE_PICKER_TYPE);

  /** @type {[DatePickerPayload]} */
  const [payload, setPayload] = useState({});

  /** @type {[{ year: number, month: number, cells: MonthLayout }]} */
  const [calendarView, setCalendarView] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    cells: [],
  });
  const [start, setStart] = useState(new Date().toISOString().split('T')[0]);
  const [end, setEnd] = useState(new Date().toISOString().split('T')[0]);

  /** @type {import("react").RefObject<HTMLElement>} */
  const datePickerRef = createRef();

  /**
   * @param {DatePickerPayload} datePickerPayload
   */
  const watchDatePickerEvent = (datePickerPayload) => {
    setTimesOpened(timesOpened + 1);
    setType(DEFAULT_DATE_PICKER_TYPE);
    setPayload(datePickerPayload);
    setCalendarView({ year: new Date().getFullYear(), month: new Date().getMonth(), cells: calendarView.cells });
    setStart(new Date().toISOString().split('T')[0]);
    setEnd(new Date().toISOString().split('T')[0]);
    setShown(true);
  };

  /**
   * Sets proper cells state for calendar view
   *
   * @returns {void}
   */
  const BuildLayout = () => {
    /**
     * @param {number} year
     * @param {number} month
     * @returns {number}
     */
    const daysInMonth = (year, month) => 32 - new Date(year, month, 32).getDate();

    if (start && end && start > end) {
      const tempStart = start;
      setStart(end);
      setEnd(tempStart);
    }

    /**
     * @param {number} year
     * @param {number} month
     * @param {number} date
     * @param {boolean} [isFakeCell]
     * @returns {boolean}
     */
    const isInRange = (year, month, date, isFakeCell = false) => {
      if (!start || !end) return false;

      const checking = new Date(year, month, date);
      const startDate = new Date(start);
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
      const endDate = new Date(end);
      endDate.setHours(0);
      endDate.setMinutes(0);
      endDate.setSeconds(0);
      endDate.setMilliseconds(0);

      if (checking.getTime() === startDate.getTime() && isFakeCell) return false;
      if (checking.getTime() === endDate.getTime() && isFakeCell) return false;

      return checking.getTime() >= startDate.getTime() && checking.getTime() <= endDate.getTime();
    };

    /**
     * @param {number} year
     * @param {number} month
     * @param {number} date
     * @returns {boolean}
     */
    const isStart = (year, month, date) => {
      if (!start) return false;

      const checking = new Date(year, month, date);
      const startDate = new Date(start);
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);

      return checking.getTime() === startDate.getTime();
    };

    /**
     * @param {number} year
     * @param {number} month
     * @param {number} date
     * @returns {boolean}
     */
    const isEnd = (year, month, date) => {
      if (!end) return false;

      const checking = new Date(year, month, date);
      const endDate = new Date(end);
      endDate.setHours(0);
      endDate.setMinutes(0);
      endDate.setSeconds(0);
      endDate.setMilliseconds(0);

      return checking.getTime() === endDate.getTime();
    };

    /**
     * @param {number} year
     * @param {number} month
     * @returns {MonthLayout}
     */
    const buildMonth = (year, month) => {
      const daysInThisMonth = daysInMonth(year, month);
      const firstDayInThisMonth = new Date(year, month).getDay() || 7;
      let date = 1;

      /** @type {MonthLayout} */
      const layout = [];

      for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
        /** @type {WeekLayout} */
        const week = [];
        layout.push(week);

        for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
          if (rowIndex === 0 && columnIndex < firstDayInThisMonth - 1)
            week.push({
              value: -(columnIndex + 1),
              inRange: isInRange(year, month, 1, true),
              starting: false,
              ending: false,
            });
          else if (date > daysInThisMonth)
            week.push({
              value: -(daysInThisMonth + columnIndex),
              inRange: isInRange(year, month, daysInThisMonth, true),
              starting: false,
              ending: false,
            });
          else {
            week.push({
              value: date,
              inRange: isInRange(year, month, date),
              starting: isStart(year, month, date),
              ending: isEnd(year, month, date),
            });

            ++date;
          }
        }
      }

      return layout.filter((week) => !week.every((day) => day?.value < 1));
    };

    const monthLayout = buildMonth(calendarView.year, calendarView.month);
    setCalendarView({ ...calendarView, cells: monthLayout });
  };

  /**
   * @param {number} date
   */
  const SelectDate = (date) => {
    if (!date) return;
    date = date.toString().padStart(2, '0');
    const clickMonth = (calendarView.month + 1).toString().padStart(2, '0');

    const clickingDate = `${calendarView.year}-${clickMonth}-${date}`;
    if (start && end) {
      setStart('');
      setEnd('');
    } else if (!start) setStart(clickingDate);
    else if (!end) setEnd(clickingDate);
    else {
      setStart('');
      setEnd('');
    }
  };

  /** @type {import("react").RefObject<HTMLElement>} */
  const yearPick = createRef();

  const ShowAllYears = () => {
    if (yearPick.current) FadeIn(yearPick.current, 400, { display: 'grid' });
  };

  const TurnPreviousMonth = () => {
    if (calendarView.month === 0) setCalendarView({ ...calendarView, month: 11, year: calendarView.year - 1 });
    else setCalendarView({ ...calendarView, month: calendarView.month - 1 });
  };

  const TurnNextMonth = () => {
    if (calendarView.month === 11) setCalendarView({ ...calendarView, month: 0, year: calendarView.year + 1 });
    else setCalendarView({ ...calendarView, month: calendarView.month + 1 });
  };

  useEffect(() => BuildLayout(), [calendarView.year, calendarView.month, start, end]);

  const SwitchType = () => {
    if (type === 'text') setType('calendar');
    else setType('text');
  };

  const Deny = () => {
    payload.denyAction();
    setShown(false);
  };

  const Accept = () => {
    if (typeof payload.acceptAction === 'function')
      payload.acceptAction(
        typeof start === 'string' && start
          ? start
              .split('-')
              .map((part) => part.padStart(2, '0'))
              .join('-')
          : null,
        typeof end === 'string' && end
          ? end
              .split('-')
              .map((part) => part.padStart(2, '0'))
              .join('-')
          : null
      );
    setShown(false);
  };

  /**
   * @param {KeyboardEvent} e
   */
  const onKeyDown = (e) => {
    if ((e.key === 'Escape' || e.code === 'Escape') && shown) Deny();
  };

  useEffect(() => {
    dispatcher.link('datePicker', watchDatePickerEvent);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      dispatcher.unlink('datePicker', watchDatePickerEvent);
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  useEffect(() => {
    if (typeof shown !== 'boolean') return;

    if (shown) FadeIn(datePickerRef.current, 400);
    else FadeOut(datePickerRef.current, 400);
  }, [shown]);

  return (
    <div className="date-picker-container" ref={datePickerRef}>
      <div className="date-picker-obfuscator default-pointer" onClick={Deny} />
      <div className="date-picker-body">
        <div className="date-picker__head default-no-select">
          <div className="date-picker__small-title">Выберите даты</div>

          <div className="date-picker__head-line">
            <div className="date-picker__big-title">
              {start === end ? (
                <span
                  className={`date-picker__big-title__position ${
                    !start ? 'date-picker__big-title__position--faded' : ''
                  }`}
                >
                  {start ? DateForPost(start, false, true) : 'Не указано'}
                </span>
              ) : (
                <>
                  <span
                    className={`date-picker__big-title__position ${
                      !start ? 'date-picker__big-title__position--faded' : ''
                    }`}
                  >
                    {(start && DateForPost(start, false, true)) || 'Начало'}
                  </span>
                  <span> – </span>
                  <span
                    className={`date-picker__big-title__position ${
                      !end ? 'date-picker__big-title__position--faded' : ''
                    }`}
                  >
                    {(end && DateForPost(end, false, true)) || 'Конец'}
                  </span>
                </>
              )}
            </div>
            <div className="date-picker__switch default-pointer" onClick={SwitchType}>
              <i className="material-icons">{type === 'text' ? 'calendar_today' : 'edit'}</i>
              <Ripple inheritTextColor />
            </div>
          </div>
        </div>

        {type === 'text' ? (
          <div className="date-picker__inputs">
            <InputArea
              label="Начало"
              preset={start}
              setState={setStart}
              placeholder="ГГГГ-ММ-ДД"
              noClean
              noMargin
              key={`input-start-${timesOpened}`}
            />
            <InputArea
              label="Конец"
              preset={end}
              setState={setEnd}
              placeholder="ГГГГ-ММ-ДД"
              noClean
              noMargin
              key={`input-end-${timesOpened}`}
            />
          </div>
        ) : (
          <div className="date-picker__calendar">
            <div className="date-picker__calendar__select">
              <div className="date-picker__select-button default-pointer default-no-select" onClick={ShowAllYears}>
                <div className="date-picker__select-button__label">
                  {MONTHS_FULL_INFINITIVE[calendarView.month]} {calendarView.year}
                </div>
                <div className="material-icons">arrow_drop_down</div>
                <Ripple inheritTextColor />
              </div>
              <div className="date-picker__calendar__turn">
                <div
                  className="date-picker__select-button default-pointer default-no-select"
                  onClick={TurnPreviousMonth}
                >
                  <div className="material-icons">chevron_left</div>
                  <Ripple inheritTextColor />
                </div>
                <div className="date-picker__select-button default-pointer default-no-select" onClick={TurnNextMonth}>
                  <div className="material-icons">chevron_right</div>
                  <Ripple inheritTextColor />
                </div>
              </div>
            </div>
            <div className="date-picker__calendar__month default-no-select">
              {SHORT_DAY_OF_WEEK.map((dayOfWeek) => (
                <div className="date-picker__calendar__day-of-week" key={dayOfWeek}>
                  {dayOfWeek}
                </div>
              ))}

              {calendarView.cells.map((row) =>
                row.map((cell) => (
                  <div
                    className="date-picker__calendar__date default-pointer"
                    key={cell.value}
                    onClick={() => SelectDate(cell.value)}
                  >
                    {cell.inRange && (
                      <div className="date-picker__calendar__date__range">
                        {!cell.starting && <div className="date-picker__calendar__date__range--pad-left" />}
                        {!cell.ending && <div className="date-picker__calendar__date__range--pad-right" />}
                      </div>
                    )}
                    {cell.value > 0 && (
                      <div
                        className={`date-picker__calendar__date__text ${
                          cell.starting || cell.ending ? 'date-picker__calendar__date__text--bordering' : ''
                        }`}
                      >
                        {cell.value}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="date-picker__calendar__year-pick default-scroll-color" ref={yearPick}>
              {ALL_YEARS.map((year) => (
                <div
                  className={`date-picker__calendar__year-pick__single default-pointer default-no-select ${
                    year === calendarView.year ? 'date-picker__calendar__year-pick__single--selected' : ''
                  }`}
                  key={year}
                  onClick={() => {
                    setCalendarView({ ...calendarView, year });
                    FadeOut(yearPick.current, 400);
                  }}
                >
                  {year}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="date-picker__actions">
          <div className="date-picker__action default-pointer default-no-select" onClick={Deny}>
            Отмена
            <Ripple />
          </div>
          <div className="date-picker__action default-pointer default-no-select" onClick={Accept}>
            Применить
            <Ripple />
          </div>
        </div>
      </div>
    </div>
  );
}
