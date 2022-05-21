import { createRef, useEffect, useState } from 'react';
import { FadeIn, FadeOut } from '../util/animations';
import dispatcher from '../util/dispatcher';
import Ripple from './Ripple';
import './Popup.css';

/**
 * @typedef {Object} PopupPayload
 * @property {string} [title] Popup title, can be omited
 * @property {(string | import("react").Component)[]} messages Layout ready lines
 * @property {boolean} [isBig=false]
 * @property {boolean} [hideable=true] Pass `true` to hide by user with no effect
 * @property {string} [acceptText] Accept button text, omit if there is no accept action
 * @property {() => void} [acceptAction] Action on accept, omit if there is no accept action
 */

/** @type {PopupPayload} */
const DEFAULT_POPUP_STATE = Object.freeze({
  title: null,
  messages: Object.freeze([]),
  isBig: false,
  hideable: true,
  acceptText: '',
  acceptAction: null,
});

export default function Popup() {
  /** @type {[PopupPayload & {shown: boolean}]} */
  const [popupState, setPopupState] = useState({ ...DEFAULT_POPUP_STATE });
  /** @type {import("react").RefObject<HTMLElement>} */
  const popupRef = createRef();

  /**
   * @param {PopupPayload} popupPayload
   */
  const watchPopupEvent = (popupPayload) => setPopupState({ ...DEFAULT_POPUP_STATE, ...popupPayload, shown: true });

  const hide = () => setPopupState({ ...popupState, shown: false });

  /**
   * @param {KeyboardEvent} e
   */
  const onKeyDown = (e) => {
    if ((e.key === 'Escape' || e.code === 'Escape') && popupState.shown && popupState.hideable) hide();
  };

  useEffect(() => {
    dispatcher.link('popup', watchPopupEvent);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      dispatcher.unlink('popup', watchPopupEvent);
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  useEffect(() => {
    if (!('shown' in popupState)) return;

    if (popupState.shown) FadeIn(popupRef.current, 400);
    else FadeOut(popupRef.current, 400);
  }, [popupState.shown]);

  return (
    <div className="popup-container" ref={popupRef}>
      <div
        className="popup-obfuscator default-pointer"
        onClick={() => {
          if (popupState.hideable) hide();
        }}
      />
      <div className="popup-body">
        {popupState.title ? <div className="popup__title">{popupState.title}</div> : null}
        <div className={`popup__messages ${popupState.isBig ? 'popup__messages--big' : ''} default-scroll-color`}>
          <div className="popup__messages-wrapper">
            {popupState.messages.map((message, index) => (
              <div className="popup__message-line" key={`popup-message-${message}-${index.toString()}`}>
                {message}
              </div>
            ))}
          </div>
        </div>
        <div className="popup__actions">
          {popupState.hideable ? (
            <div className="popup__action default-pointer default-no-select" onClick={hide}>
              Закрыть
              <Ripple />
            </div>
          ) : null}
          {popupState.acceptAction ? (
            <div className="popup__action default-pointer default-no-select" onClick={popupState.acceptAction}>
              {popupState.acceptText}
              <Ripple />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
