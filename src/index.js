import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './pages/Home';
import Swagger from './pages/Swagger';
import NotFound from './pages/NotFound';
import ScrollToTop from './util/scroll-to-top';
import store from './store';
import Dispatcher from './util/dispatcher';
import { checkSystemOnMediaChange } from './util/theme';

const styleBlockWithPrimary =
  document.getElementById('primary') || document.head.appendChild(document.createElement('style'));
styleBlockWithPrimary.id = 'style-block-with-primary';
styleBlockWithPrimary.innerHTML = `:root {\n--primary: ${process.env.REACT_APP_PRIMARY_COLOR};\n}`;

/** @param {import("./util/theme").ThemeObject} */
function ApplyThemeClassToBody(theme) {
  if (theme.isDark) document.body.classList.add('is-dark');
  else document.body.classList.remove('is-dark');
}

Dispatcher.link('themeChanged', ApplyThemeClassToBody);
ApplyThemeClassToBody(store.getState().theme);

window
  .matchMedia?.('(prefers-color-scheme: dark)')
  ?.addEventListener('change', () => store.dispatch(checkSystemOnMediaChange()));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ScrollToTop />
      <Routes>
        <Route element={<App />}>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="docs/api/swagger" element={<Swagger />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </Provider>
);
