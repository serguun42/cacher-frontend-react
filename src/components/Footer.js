import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import store from '../store';
import dispatcher from '../util/dispatcher';
import PopupAboutHotkeys from '../util/popups/hotkeys';
import { nextTheme } from '../store/theme';
import './Footer.css';

export default function Footer() {
  const footerLinks = [
    { icon: 'home', href: '/', text: 'Главная', router: true },
    { icon: 'contact_mail', href: 'https://serguun42.ru/?contacts', text: 'Контакты' },
    { icon: 'dashboard', href: 'https://serguun42.ru/guide', text: 'Все сервисы' },
    { icon: 'code', href: 'https://serguun42.ru/about', text: 'Разработка – @serguun42' },
  ];

  const changeTheme = () => store.dispatch(nextTheme());
  const clearCache = () => dispatcher.call('clearCache');

  const themeState = useSelector((state) => state.theme);

  return (
    <footer className="footer">
      <section className="footer__section footer__section--logo">
        <img
          className="footer__logo-img"
          src={`${process.env.PUBLIC_URL}/img/${process.env.REACT_APP_SITE_CODE}/icons/round/256x256.png`}
          draggable="false"
          onContextMenu={() => false}
          alt={`Cacher ${process.env.REACT_APP_SITE_SHORT}`}
        />
        <div className="footer__logo-desc">
          <div className="footer__logo-desc__title default-title-font">Cacher {process.env.REACT_APP_SITE_SHORT}</div>
          <div>
            <i className="material-icons">copyright</i>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </section>

      <section className="footer__section">
        {footerLinks.map((link) =>
          link.router ? (
            <Link className="footer__section__item" to={link.href} key={link.href}>
              <i className="material-icons">{link.icon}</i>
              <span>{link.text}</span>
            </Link>
          ) : (
            <a
              className="footer__section__item"
              target="_blank"
              rel="noopener noreferrer"
              href={link.href}
              key={link.href}
            >
              <i className="material-icons">{link.icon}</i>
              <span>{link.text}</span>
            </a>
          )
        )}
      </section>

      <section className="footer__section">
        <div className="footer__section__item default-pointer">
          <i className="material-icons">open_in_new</i>
          <a href={process.env.REACT_APP_OTHER_CACHER_LINK} target="_self" rel="noopener noreferrer">
            {process.env.REACT_APP_OTHER_CACHER_NAME}
          </a>
        </div>

        <div className="footer__section__item default-no-select default-pointer" onClick={() => changeTheme()}>
          <i className="material-icons">{themeState.icon}</i>
          <span>{themeState.name}</span>
        </div>

        <div className="footer__section__item default-no-select default-pointer" onClick={() => clearCache()}>
          <i className="material-icons">delete_outline</i>
          <span>Очистить кэш</span>
        </div>

        <div className="footer__section__item default-no-select default-pointer" onClick={PopupAboutHotkeys}>
          <i className="material-icons">keyboard</i>
          <span>Горячие клавиши</span>
        </div>
      </section>

      <section className="footer__section">
        <div className="footer__section__item">
          <svg
            className="octicon default-no-select"
            height="32"
            viewBox="0 0 16 16"
            version="1.1"
            width="32"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              // eslint-disable-next-line max-len
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          <a href="https://github.com/serguun42/cacher-frontend-react" target="_blank" rel="noopener noreferrer">
            Github
          </a>
        </div>

        <div className="footer__section__item default-pointer">
          <i className="material-icons">api</i>
          <Link to="/docs/api/swagger">Swagger API</Link>
        </div>

        <div className="footer__section__item default-pointer">
          <i className="material-icons">api</i>
          <a href={`${process.env.PUBLIC_URL}/docs/redoc.html`} target="_blank" rel="noopener noreferrer">
            Redoc API
          </a>
        </div>
      </section>
    </footer>
  );
}
