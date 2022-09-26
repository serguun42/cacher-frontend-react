import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import DateForPost from '../util/date-for-post';
import Esc from '../util/html/escape';
import Avatar from '../util/html/avatar';
import LogMessageOrError from '../util/log';
import dispatcher from '../util/dispatcher';
import ScrollToComment from '../util/scroll-to-comment';
import './CommentInfoLine.css';

/**
 * @param {{ comment: import("../../types/comment").Comment, entryId: number, authorId: number }} props
 */
export default function CommentInfoLine({ comment, entryId, authorId }) {
  if (!comment) return null;
  if (!entryId) {
    const params = useParams();
    entryId = parseInt(params.entryId);
  }

  const commentLink = `https://${process.env.REACT_APP_SITE_LINK}/${entryId}?comment=${comment.id}`;

  return (
    <div className="comment-info-line">
      <Link
        to={`/entity/${comment.author.id}`}
        style={{
          backgroundImage: Avatar(comment.author.avatar_url),
        }}
        className="comment-info-line__avatar default-no-select"
      />
      <div className="comment-info-line__vertical">
        <div className="comment-info-line__top">
          <Link
            to={`/entity/${comment.author.id}`}
            className="comment-info-line__elem comment-info-line--highlight comment-info-line__elem--name"
          >
            <div className="comment-info-line__text">{Esc(comment.author.name)}</div>
            {comment.author.is_verified ? (
              <svg className="comment-info-line__elem__verified default-no-select" viewBox="0 0 24 24">
                <path d="M12 2C6.478 2 2 6.478 2 12s4.478 10 10 10 10-4.478 10-10S17.522 2 12 2z" fill="#4e92f1" />
                <path
                  d="M17.109 8.877a1 1 0 01-.008 1.414l-6.085 6.018a1 1 0 01-1.406 0L6.9 13.633a1 1 0
              111.405-1.423l2.008 1.982 5.383-5.323a1 1 0 011.414.008z"
                  className="path-with-dynamic-color"
                />
              </svg>
            ) : null}
          </Link>
          {comment.replyTo > 0 ? (
            <div
              className="comment-info-line__elem comment-info-line__elem--with-area
              comment-info-line--hover default-pointer"
              onClick={() => ScrollToComment({ commentId: comment.replyTo })}
            >
              <div className="material-icons comment-info-line__text comment-info-line--action">arrow_upward</div>
            </div>
          ) : null}
        </div>
        <div className="comment-info-line__bottom">
          {authorId === comment.author?.id ? (
            <div
              className={`comment-info-line__elem comment-info-line--action
              comment-info-line--highlight default-no-select`}
            >
              <span className="comment-info-line--highlight comment-info-line--mobile-hide">Автор</span>
              <i className="material-icons comment-info-line__text comment-info-line--highlight">person</i>
            </div>
          ) : null}
          <a
            className="comment-info-line__elem comment-info-line--action"
            target="_blank"
            rel="noopener noreferrer"
            href={commentLink}
          >
            <div className="comment-info-line__text">{DateForPost(comment.date)}</div>
            <i
              className={`material-icons comment-info-line__text
              comment-info-line--mobile-hide comment-info-line--hover`}
            >
              open_in_new
            </i>
          </a>
          <div
            className="comment-info-line__elem comment-info-line--action default-pointer default-no-select"
            onClick={() => {
              navigator.clipboard
                .writeText(commentLink)
                .then(() => dispatcher.call('message', 'Ссылка на коммент скопирована'))
                .catch(LogMessageOrError);
            }}
          >
            <div className="comment-info-line__text comment-info-line--mobile-hide comment-info-line--hover">
              #{comment.id}
            </div>
            <i className="material-icons comment-info-line__text comment-info-line--hover">content_copy</i>
          </div>
        </div>
      </div>
      <div className="comment-info-line__elem comment-info-line__likes default-no-select">
        <div
          className={`comment-info-line__text comment-info-line__text--karma ${
            comment.likes?.summ > 0 ? 'karma--positive' : comment.likes?.summ < 0 ? 'karma--negative' : ''
          }`}
        >
          {comment.likes?.summ > 0 ? '+' : ''}
          {comment.likes?.summ || 0}
        </div>
      </div>
    </div>
  );
}

CommentInfoLine.propTypes = {
  comment: PropTypes.object.isRequired,
  entryId: PropTypes.number,
  authorId: PropTypes.number,
};

CommentInfoLine.defaultProps = {
  entryId: 0,
  authorId: 0,
};
