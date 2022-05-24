import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import store from '../store';
import { nextTheme } from '../store/theme';
import Ripple from './Ripple';
import OpenSearch from '../util/open-search';
import LogMessageOrError from '../util/log';
import './ControlUnit.css';

export default function ControlUnitToHide() {
  const navigate = useNavigate();
  const themeState = useSelector((state) => state.theme);
  const location = useLocation();

  /** @type {import("react").MutableRefObject<HTMLElement>} */
  const searchButtonRef = useRef();

  /**
   * @param {KeyboardEvent} e
   */
  const onKeyDown = (e) => {
    if (e.code === 'KeyS' && store.getState().hotkeys.hotkeysActive && searchButtonRef.current)
      OpenSearch(searchButtonRef.current)
        .then(() => navigate('/search'))
        .catch(LogMessageOrError);
  };

  useState(() => {
    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div
      className="control-unit"
      style={{
        display:
          location.pathname === '' || location.pathname === '/' || location.pathname === '/index.html' ? 'none' : '',
      }}
    >
      <button
        type="button"
        className="control-unit__button"
        title="Поиск"
        ref={searchButtonRef}
        onClick={(e) =>
          OpenSearch(e.currentTarget)
            .then(() => navigate('/search'))
            .catch(LogMessageOrError)
        }
      >
        <i className="material-icons">search</i>
        <Ripple inheritTextColor />
      </button>
      <button
        type="button"
        className="control-unit__button control-unit__button--inverted"
        title="Главная"
        onClick={() => navigate('/')}
      >
        <i className="material-icons">home</i>
        <Ripple inheritTextColor />
      </button>
      <button
        type="button"
        className="control-unit__button control-unit__button--inverted"
        onClick={() => store.dispatch(nextTheme())}
        title={themeState.name}
      >
        <i className="material-icons">{themeState.icon}</i>
        <Ripple inheritTextColor />
      </button>
    </div>
  );
}
