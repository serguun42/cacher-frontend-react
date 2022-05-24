import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import CommentContainer from './CommentContainer';
import './CommentsList.css';

/**
 * @param {{ comments: import("../../types/comment").Comment[] }} props
 */
export default function CommentsList({ comments, entryId }) {
  if (!entryId) {
    const params = useParams();
    entryId = parseInt(params.entryId);
  }

  if (!comments?.length)
    return (
      <div className="comments">
        <h4 className="comments-empty">Тут пусто! 🤷‍♂️</h4>
      </div>
    );

  return (
    <div className="comments">
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
