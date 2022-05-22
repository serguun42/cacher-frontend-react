import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './pages/Home';
import Swagger from './pages/Swagger';
import NotFound from './pages/NotFound';
import Message from './components/Message';
import ScrollToTop from './util/scroll-to-top';
import store from './store';
import dispatcher from './util/dispatcher';
import { checkSystemOnMediaChange } from './util/theme';
import './util/set-primary';
import './util/message';
import Entity from './pages/Entity';
import Entry from './pages/Entry';
import Popup from './components/Popup';

/** @param {import("./util/theme").ThemeObject} */
function ApplyThemeClassToBody(theme) {
  if (theme.isDark) document.body.classList.add('is-dark');
  else document.body.classList.remove('is-dark');
}

dispatcher.link('themeChanged', ApplyThemeClassToBody);
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
            <Route path="/entity/:entityId" element={<Entity />} />
            <Route path="/post/:entryId" element={<Entry />} />
            <Route path="docs/api/swagger" element={<Swagger />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <Message />
    <Popup />
  </Provider>
);
