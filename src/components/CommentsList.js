import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import GetForm from '../util/get-form';
import CommentContainer from './CommentContainer';
import './CommentsList.css';

/**
 * @param {{ comments: import("../../types/comment").Comment[], entryId: number, authorId: number }} props
 */
export default function CommentsList({ comments, entryId, authorId }) {
  if (!comments?.length)
    return (
      <div className="comments">
        <h4 className="comments__empty">Тут пусто! 🤷‍♂️</h4>
      </div>
    );

  if (!entryId) {
    const params = useParams();
    entryId = parseInt(params.entryId);
  }

  return (
    <div className="comments">
      <div className="comments__count">
        {comments.length} {GetForm(comments.length, ['комментарий', 'комментария', 'комментариев'])}
      </div>
      {
        /**
         * https://reactjs.org/docs/lists-and-keys.html#keys
         * Aka 'last resort', since blocks could be identical (incl. type and payload)
         */
        comments.map((comment, commentIndex) => (
          <CommentContainer
            comment={comment}
            entryId={entryId}
            authorId={authorId}
            key={`comment-${comment.id}-${commentIndex.toString()}`}
          />
        ))
      }
    </div>
  );
}

CommentsList.propTypes = {
  comments: PropTypes.array,
  entryId: PropTypes.number,
  authorId: PropTypes.number,
};

CommentsList.defaultProps = {
  comments: [],
  entryId: 0,
  authorId: 0,
};
