import { StrictMode } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import RippleButton from './components/RippleButton';
import store from './store';
import { nextTheme } from './util/theme';

export default function App() {
  const navigate = useNavigate();
  const themeState = useSelector((state) => state.theme);

  return (
    <StrictMode>
      <div id="app">
        <div id="control-unit">
          <RippleButton className="control-unit__button" title="Поиск">
            <i className="material-icons">search</i>
          </RippleButton>
          <RippleButton
            className="control-unit__button control-unit__button--inverted"
            title="Главная"
            onClick={() => navigate('/')}
          >
            <i className="material-icons">home</i>
          </RippleButton>
          <RippleButton
            className="control-unit__button control-unit__button--inverted"
            onClick={() => store.dispatch(nextTheme())}
            title={`Тема: ${themeState.name}`}
          >
            <i className="material-icons">{themeState.icon}</i>
          </RippleButton>
        </div>
        <div id="content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </StrictMode>
  );
}
