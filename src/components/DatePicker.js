import { createRef, useEffect, useState } from 'react';
import { FadeIn, FadeOut } from '../util/animations';
import dispatcher from '../util/dispatcher';
import Ripple from './Ripple';
import './DatePicker.css';

/**
 * @typedef {Object} DatePickerPayload
 * @property {string} title
 * @property {(date: string) => void} acceptAction
 * @property {() => void} denyAction
 */

/** @type {DatePickerPayload} */
const DEFAULT_DATE_PICKER_STATE = Object.freeze({
  title: null,
  acceptAction: null,
});

export default function DatePicker() {
  /** @type {[DatePickerPayload & {shown: boolean}]} */
  const [datePickerState, setDatePickerState] = useState({ ...DEFAULT_DATE_PICKER_STATE });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [datePickerID] = useState(`${Math.floor(Math.random() * 1e8)}${Date.now()}`);
  /** @type {import("react").RefObject<HTMLElement>} */
  const datePickerRef = createRef();

  /**
   * @param {DatePickerPayload} datePickerPayload
   */
  const watchDatePickerEvent = (datePickerPayload) => {
    setDate(new Date().toISOString().split('T')[0]);
    setDatePickerState({ ...DEFAULT_DATE_PICKER_STATE, ...datePickerPayload, shown: true });
  };

  const deny = () => {
    datePickerState.denyAction();
    setDatePickerState({ ...datePickerState, shown: false });
  };

  const accept = () => {
    datePickerState.acceptAction(
      date
        .split('-')
        .map((part) => part.padStart(2, '0'))
        .join('-')
    );
    setDatePickerState({ ...datePickerState, shown: false });
  };

  /**
   * @param {KeyboardEvent} e
   */
  const onKeyDown = (e) => {
    if ((e.key === 'Escape' || e.code === 'Escape') && datePickerState.shown) deny();
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
    if (!('shown' in datePickerState)) return;

    if (datePickerState.shown) FadeIn(datePickerRef.current, 400);
    else FadeOut(datePickerRef.current, 400);
  }, [datePickerState.shown]);

  return (
    <div className="date-picker-container" ref={datePickerRef}>
      <div className="date-picker-obfuscator default-pointer" onClick={deny} />
      <div className="date-picker-body">
        {datePickerState.title ? <div className="date-picker__title">{datePickerState.title}</div> : null}
        <div className="date-picker__inputs default-scroll-color">
          <div className="date-picker__inputs-wrapper">
            <div className="date-picker__input-area">
              <input
                type="number"
                id={`${datePickerID}-1`}
                value={date.split('-')[0]}
                maxLength="4"
                onInput={(e) => {
                  setDate(`${e.target.value}-${date.split('-')[1]}-${date.split('-')[2]}`);
                }}
              />
              <label className="default-no-select" htmlFor={`${datePickerID}-1`}>
                год
              </label>
            </div>
            <div className="date-picker__input-area">
              <input
                type="number"
                id={`${datePickerID}-2`}
                value={date.split('-')[1]}
                maxLength="2"
                onInput={(e) => {
                  setDate(`${date.split('-')[0]}-${e.target.value}-${date.split('-')[2]}`);
                }}
              />
              <label className="default-no-select" htmlFor={`${datePickerID}-2`}>
                месяц
              </label>
            </div>
            <div className="date-picker__input-area">
              <input
                type="number"
                id={`${datePickerID}-3`}
                value={date.split('-')[2]}
                maxLength="2"
                onInput={(e) => {
                  setDate(`${date.split('-')[0]}-${date.split('-')[1]}-${e.target.value}`);
                }}
              />
              <label className="default-no-select" htmlFor={`${datePickerID}-3`}>
                день
              </label>
            </div>
          </div>
        </div>
        <div className="date-picker__actions">
          <div className="date-picker__action default-pointer default-no-select" onClick={deny}>
            Не устанавливать
            <Ripple />
          </div>
          <div className="date-picker__action default-pointer default-no-select" onClick={accept}>
            Установить
            <Ripple />
          </div>
        </div>
      </div>
    </div>
  );
}
