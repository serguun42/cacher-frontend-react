import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import DateForPost from '../util/date-for-post';
import PopupAboutSchedule from '../util/popups/about-schedule';
import './PostVersion.css';
import Ripple from './Ripple';

/**
 * @param {{ postVersion: import("../../types/post_version").PostVersion, showAbout: boolean }} props
 */
export default function PostVersion({ postVersion, showAbout }) {
  return (
    <div className="post-version">
      <div className="post-version__info">
        <Link to={`/entity/${postVersion.subsite.id}`} className="post-version__info__elem">
          <div
            style={{
              backgroundImage: `url(${postVersion.subsite.avatar_url}${
                postVersion.subsite.avatar_url.indexOf(process.env.REACT_APP_CDN_DOMAIN) > -1
                  ? '-/format/jpg/-/scale_crop/64x64/'
                  : ''
              })`,
            }}
            className="post-version__info__elem__img default-no-select"
          />
          <div className="post-version__info__elem__text">{postVersion.subsite.name}</div>
        </Link>
        {postVersion.author.id !== postVersion.subsite.id ? (
          <Link to={`/entity/${postVersion.author.id}`} className="post-version__info__elem">
            <div
              style={{
                backgroundImage: `url(${postVersion.author.avatar_url}${
                  postVersion.author.avatar_url.indexOf(process.env.REACT_APP_CDN_DOMAIN) > -1
                    ? '-/format/jpg/-/scale_crop/64x64/'
                    : ''
                })`,
              }}
              className="post-version__info__elem__img default-no-select"
            />
            <div className="post-version__info__elem__text">{postVersion.author.name}</div>
          </Link>
        ) : null}
        <a className="post-version__info__elem" target="_blank" rel="noopener noreferrer" href={postVersion.url}>
          <div className="post-version__info__elem__text post-version__info__elem__text--date">
            {DateForPost(postVersion.date)}
          </div>
          <i className="material-icons post-version__info__elem__text post-version__info__elem__text--date">
            open_in_new
          </i>
        </a>

        {showAbout ? (
          <div className="post-version__info__elem post-version__about default-pointer" onClick={PopupAboutSchedule}>
            <i className="material-icons">info</i>
            <Ripple />
          </div>
        ) : null}
      </div>
      {postVersion.title ? <h3 className="post-version__title default-title-font">{postVersion.title}</h3> : null}
    </div>
  );
}

PostVersion.propTypes = {
  postVersion: PropTypes.object.isRequired,
  showAbout: PropTypes.bool,
};

PostVersion.defaultProps = {
  showAbout: false,
};
