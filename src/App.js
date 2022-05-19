import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import Ripple from './components/Ripple';
import store from './store';
import { nextTheme } from './util/theme';

export default function App() {
  const navigate = useNavigate();
  const themeState = useSelector((state) => state.theme);

  return (
    <>
      <div id="app">
        <div id="control-unit">
          <button type="button" className="control-unit__button" title="Поиск">
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
        <div id="content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
}
