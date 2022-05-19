import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import DateForPost from '../util/date-for-post';
import './FeedPost.css';

/**
 * @param {{ feedPost: import("../../types/feed_post").FeedPost }} props
 */
export default function FeedPost({ feedPost }) {
  const postLink = `/post/${feedPost.id}`;

  return (
    <div className="feed-post default-pointer">
      <div className="feed-post__info">
        <Link to={`/entity/${feedPost.subsite.id}`} className="feed-post__info__elem">
          <div
            style={{
              backgroundImage: `url(${feedPost.subsite.avatar_url}${
                feedPost.subsite.avatar_url.indexOf(process.env.REACT_APP_CDN_DOMAIN) > -1
                  ? '-/format/jpg/-/scale_crop/64x64/'
                  : ''
              })`,
            }}
            className="feed-post__info__elem__img default-no-select"
          />
          <div className="feed-post__info__elem__text">{feedPost.subsite.name}</div>
        </Link>
        {feedPost.author.id !== feedPost.subsite.id ? (
          <Link to={`/entity/${feedPost.author.id}`} className="feed-post__info__elem">
            <div
              style={{
                backgroundImage: `url(${feedPost.author.avatar_url}${
                  feedPost.author.avatar_url.indexOf(process.env.REACT_APP_CDN_DOMAIN) > -1
                    ? '-/format/jpg/-/scale_crop/64x64/'
                    : ''
                })`,
              }}
              className="feed-post__info__elem__img default-no-select"
            />
            <div className="feed-post__info__elem__text">{feedPost.author.name}</div>
          </Link>
        ) : null}
        <a className="feed-post__info__elem" target="_blank" rel="noopener noreferrer" href={feedPost.url}>
          <div className="feed-post__info__elem__text feed-post__info__elem__text--date">
            {DateForPost(feedPost.date)}
          </div>
          <i className="material-icons feed-post__info__elem__text feed-post__info__elem__text--date">open_in_new</i>
        </a>
      </div>
      {feedPost.title ? (
        <Link to={postLink} className="feed-post__header">
          {feedPost.title}
        </Link>
      ) : null}
      {feedPost.intro ? (
        <Link to={postLink} className="feed-post__intro">
          {feedPost.intro}
        </Link>
      ) : null}
      {!feedPost.title && !feedPost.intro ? (
        <Link to={postLink} className="feed-post__intro feed-post__intro--empty default-no-select">
          Заголовок и введение отсутсвуют
        </Link>
      ) : null}
    </div>
  );
}

FeedPost.propTypes = {
  feedPost: PropTypes.object.isRequired,
};
