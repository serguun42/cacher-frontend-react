import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import DateForPost from '../util/date-for-post';
import PopupAboutSchedule from '../util/popups/about-schedule';
import Ripple from './Ripple';
import './PostInfoLine.css';
import Esc from '../util/html/escape';
import Avatar from '../util/html/avatar';
import SafeURL from '../util/safe-url';

/**
 * @param {{ postVersion: import("../../types/post_version").PostVersion, showAbout: boolean }} props
 */
export default function PostInfoLine({ postVersion, showAbout }) {
  return (
    <div className="post-info-line">
      {postVersion.subsite ? (
        <Link to={`/entity/${postVersion.subsite.id}`} className="post-info-line__elem">
          <div
            style={{
              backgroundImage: Avatar(postVersion.subsite.avatar_url),
            }}
            className="post-info-line__elem__img default-no-select"
          />
          <div className="post-info-line__elem__text">{Esc(postVersion.subsite.name || '—')}</div>
          {postVersion.subsite.is_verified ? (
            <svg className="post-info-line__elem__verified default-no-select" viewBox="0 0 24 24">
              <path d="M12 2C6.478 2 2 6.478 2 12s4.478 10 10 10 10-4.478 10-10S17.522 2 12 2z" fill="#4e92f1" />
              <path
                d="M17.109 8.877a1 1 0 01-.008 1.414l-6.085 6.018a1 1 0 01-1.406 0L6.9 13.633a1 1 0
              111.405-1.423l2.008 1.982 5.383-5.323a1 1 0 011.414.008z"
                className="path-with-dynamic-color"
              />
            </svg>
          ) : null}
        </Link>
      ) : null}
      {postVersion.author?.id !== postVersion.subsite?.id ? (
        <Link to={`/entity/${postVersion.author.id}`} className="post-info-line__elem">
          <div
            style={{
              backgroundImage: Avatar(postVersion.author.avatar_url),
            }}
            className="post-info-line__elem__img default-no-select"
          />
          <div className="post-info-line__elem__text">{Esc(postVersion.author.name || '—')}</div>
          {postVersion.author.is_verified ? (
            <svg className="post-info-line__elem__verified default-no-select" viewBox="0 0 24 24">
              <path d="M12 2C6.478 2 2 6.478 2 12s4.478 10 10 10 10-4.478 10-10S17.522 2 12 2z" fill="#4e92f1" />
              <path
                d="M17.109 8.877a1 1 0 01-.008 1.414l-6.085 6.018a1 1 0 01-1.406 0L6.9 13.633a1 1 0
              111.405-1.423l2.008 1.982 5.383-5.323a1 1 0 011.414.008z"
                className="path-with-dynamic-color"
              />
            </svg>
          ) : null}
        </Link>
      ) : null}
      <a className="post-info-line__elem" target="_blank" rel="noopener noreferrer" href={postVersion.url}>
        <div className="post-info-line__elem__text post-info-line__link-to-original">
          {DateForPost(postVersion.date)}
        </div>
        <i className="material-icons post-info-line__elem__text post-info-line__link-to-original">open_in_new</i>
      </a>
      {process.env.REACT_APP_CUSTOM_FRONTEND_URL ? (
        <a
          className="post-info-line__elem"
          target="_blank"
          rel="noopener noreferrer"
          href={new URL(postVersion.id, SafeURL(process.env.REACT_APP_CUSTOM_FRONTEND_URL))}
        >
          <div className="post-info-line__elem__text post-info-line__link-to-original">
            {process.env.REACT_APP_CUSTOM_FRONTEND_NAME}
          </div>
          <i className="material-icons post-info-line__elem__text post-info-line__link-to-original">open_in_new</i>
        </a>
      ) : null}
      {showAbout ? (
        <div className="post-info-line__elem post-info-line__about default-pointer" onClick={PopupAboutSchedule}>
          <i className="material-icons">help_outline</i>
          <Ripple />
        </div>
      ) : null}
    </div>
  );
}

PostInfoLine.propTypes = {
  postVersion: PropTypes.object.isRequired,
  showAbout: PropTypes.bool,
};

PostInfoLine.defaultProps = {
  showAbout: false,
};
