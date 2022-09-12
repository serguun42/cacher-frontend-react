import PropTypes from 'prop-types';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import GetForm from '../util/get-form';
import CommentContainer from './CommentContainer';
import './CommentsList.css';

/**
 * @param {import("../../types/comment").Comment[]} allComments
 * @param {import("../../types/comment").Comment} currentComment
 * @returns {boolean}
 */
const IsLast = (allComments, currentComment) => {
  if (!currentComment.replyTo) return false;

  const lastCommentInBranch = allComments.findLast(
    (compairingComment) => compairingComment.replyTo === currentComment.replyTo
  );

  return lastCommentInBranch.id === currentComment.id;
};

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

  /** @type {[Set<number>]} */
  const [hiddenBranchDepth] = useState(new Set());

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
        comments.map((comment, commentIndex) => {
          const isLast = IsLast(comments, comment);

          hiddenBranchDepth.delete(comment.level);
          if (isLast && comment.level) hiddenBranchDepth.add(comment.level - 1);
          if (!comment.replyTo) while (hiddenBranchDepth.size) hiddenBranchDepth.clear();

          return (
            <CommentContainer
              comment={comment}
              isLast={isLast}
              hiddenBranchDepths={[...hiddenBranchDepth]}
              entryId={entryId}
              authorId={authorId}
              key={`comment-${comment.id}-${commentIndex.toString()}`}
            />
          );
        })
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
