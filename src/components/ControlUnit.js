import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import store from '../store';
import { nextTheme } from '../store/theme';
import Ripple from './Ripple';
import './ControlUnit.css';
import OpenSearch from '../util/open-search';
import LogMessageOrError from '../util/log';

export default function ControlUnitToHide() {
  const navigate = useNavigate();
  const themeState = useSelector((state) => state.theme);
  const location = useLocation();

  if (location.pathname === '' || location.pathname === '/' || location.pathname === '/index.html') return null;

  return (
    <div className="control-unit">
      <button
        type="button"
        className="control-unit__button"
        title="Поиск"
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
