import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import PostInfoLine from './PostInfoLine';
import './FeedPost.css';
import Esc from '../util/html/escape';

/**
 * @param {{ feedPost: import("../../types/feed_post").FeedPost, commentId?: number }} props
 */
export default function FeedPost({ feedPost, commentId }) {
  const postLink = `/post/${feedPost.id}${commentId ? `?comment=${commentId}` : ''}`;

  return (
    <div className="feed-post default-pointer">
      <PostInfoLine postVersion={feedPost} showAbout={false} />

      <Link to={postLink} className="feed-post__link">
        {feedPost.title ? <div className="feed-post__header">{Esc(feedPost.title)}</div> : null}
        {feedPost.intro ? <div className="feed-post__intro">{Esc(feedPost.intro)}</div> : null}
        {!feedPost.title && !feedPost.intro ? (
          <div className="feed-post__intro feed-post__intro--empty default-no-select">
            Заголовок и введение отсутсвуют
          </div>
        ) : null}
      </Link>
    </div>
  );
}

FeedPost.propTypes = {
  feedPost: PropTypes.object.isRequired,
  commentId: PropTypes.number,
};

FeedPost.defaultProps = {
  commentId: 0,
};
