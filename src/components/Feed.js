import { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Ripple from './Ripple';
import FeedPost from './FeedPost';
import './Feed.css';

/**
 * @typedef {Object} FeedComponentProps
 * @property {import("../../types/feed_post").FeedPost[]} feedPosts
 * @property {(trueNumberOfPostsInFeed: number) => {}} callback
 * @property {boolean} [noAdding]
 * @property {boolean} [notFound]
 * @property {number} [commentId]
 */
/**
 * @param {FeedComponentProps} props
 */
export default function Feed({ feedPosts, callback, noAdding, notFound, commentId }) {
  if (!Array.isArray(feedPosts)) return null;

  const [calledCallbackAt, setCalledCallbackAt] = useState(0);

  useLayoutEffect(() => {}, [notFound]);

  feedPosts = feedPosts.filter((value, index, array) => index === array.findIndex((comp) => comp.id === value.id));

  return (
    <div className="feed">
      {feedPosts.map((feedPost) => (
        <FeedPost feedPost={feedPost} key={feedPost.id} commentId={commentId} />
      ))}
      {!noAdding ? (
        <div
          className="feed__more default-pointer default-no-select"
          onClick={
            !notFound
              ? () => {
                  if (calledCallbackAt !== feedPosts.length) {
                    callback(feedPosts.length);
                    setCalledCallbackAt(feedPosts.length);
                  }
                }
              : null
          }
        >
          {notFound ? (
            <>
              <i className="material-icons feed__more__icon">hide_source</i>
              <div className="feed__more__text">Не найдено</div>
            </>
          ) : (
            <>
              <i className="material-icons feed__more__icon">zoom_in</i>
              <div className="feed__more__text">Найти ещё</div>
            </>
          )}
          <Ripple />
        </div>
      ) : null}
    </div>
  );
}

Feed.propTypes = {
  feedPosts: PropTypes.arrayOf(PropTypes.object).isRequired,
  callback: PropTypes.func.isRequired,
  noAdding: PropTypes.bool,
  notFound: PropTypes.bool,
  commentId: PropTypes.number,
};

Feed.defaultProps = {
  noAdding: false,
  notFound: false,
  commentId: 0,
};
