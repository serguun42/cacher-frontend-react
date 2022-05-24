import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import GetForm from '../util/get-form';
import CommentContainer from './CommentContainer';
import './CommentsList.css';

/**
 * @param {{ comments: import("../../types/comment").Comment[] }} props
 */
export default function CommentsList({ comments, entryId }) {
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
};

CommentsList.defaultProps = {
  comments: [],
  entryId: 0,
};
