import PropTypes from 'prop-types';
import { useRef, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ScrollToComment from '../util/scroll-to-comment';
import { StraightRefined } from '../util/html/refined';
import dispatcher from '../util/dispatcher';
import CommentInfoLine from './CommentInfoLine';
import PostBlock from './PostBlock';
import './CommentContainer.css';

/**
 * @typedef {object} CommentContainerProps
 * @property {import("../../types/comment").Comment} comment
 * @property {boolean} isLast
 * @property {number[]} hiddenBranchDepths
 * @property {number[]} parentComments
 * @property {number} entryId
 * @property {number} authorId
 */
/**
 * @param {CommentContainerProps} props
 */
export default function CommentContainer({ comment, isLast, hiddenBranchDepths, parentComments, entryId, authorId }) {
  if (!comment) return null;
  if (!entryId) {
    const params = useParams();
    entryId = parseInt(params.entryId);
  }

  const [searchParams] = useSearchParams();

  /** @type {import("react").MutableRefObject<HTMLElement>} */
  const commentRef = useRef(null);
  useEffect(() => {
    const commentIdFromQuery = parseInt(searchParams.get('comment'));
    const commentElem = commentRef.current;

    if (comment.id === commentIdFromQuery && commentElem) {
      ScrollToComment({ commentElem });
    }
  }, [commentRef]);

  const commentVisibleDepth = Math.min(comment.level, 5);

  const [isHighlighted, setHighlighted] = useState(false);
  const [highlightDepth, setHighlightDepth] = useState(-1);

  /**
   * @param {number} branchDepth
   * @param {number} parentCommentId
   */
  const OnBranchOver = (branchDepth, parentCommentId) => {
    if (!parentComments.includes(parentCommentId)) return;

    setHighlighted(true);
    setHighlightDepth(branchDepth);
  };

  /**
   * @param {number} branchDepth
   * @param {number} parentCommentId
   */
  const OnBranchLeave = (branchDepth) => {
    setHighlighted(false);
    setHighlightDepth(branchDepth);
  };

  /**
   * @param {number} branchDepth
   */
  const OnMouseOver = (branchDepth) => {
    dispatcher.call('branchOver', branchDepth, parentComments[branchDepth]);
  };

  /**
   * @param {number} branchDepth
   */
  const OnMouseLeave = (branchDepth) => {
    dispatcher.call('branchLeave', branchDepth, parentComments[branchDepth]);
  };

  useEffect(() => {
    dispatcher.link('branchOver', OnBranchOver);
    dispatcher.link('branchLeave', OnBranchLeave);

    return () => {
      dispatcher.unlink('branchOver', OnBranchOver);
      dispatcher.unlink('branchLeave', OnBranchLeave);
    };
  });

  return (
    <div className="comment-container" data-comment-id={comment.id} ref={commentRef}>
      <div className="comment-branches">
        {Array.from({ length: commentVisibleDepth }, (_, idx) => (
          <div
            className={`comment-branch ${isLast && commentVisibleDepth === idx + 1 ? 'comment-branch--tail' : ''} ${
              commentVisibleDepth < comment.level ? 'comment-branch--infinite-tail' : ''
            } ${hiddenBranchDepths.includes(idx) ? 'comment-branch--hidden' : ''} ${
              isHighlighted && highlightDepth === idx ? 'comment-branch--is-highlighted' : ''
            }`}
            key={`comment-${comment.id}-${comment.is_pinned}-level-${idx}`}
            onMouseOver={() => OnMouseOver(idx)}
            onMouseLeave={() => OnMouseLeave(idx)}
            onFocus={() => OnMouseOver(idx)}
            onBlur={() => OnMouseLeave(idx)}
          />
        ))}
      </div>
      <div className="comment">
        <CommentInfoLine comment={comment} entryId={entryId} authorId={authorId} />
        <div className="comment__text">
          {StraightRefined(
            comment.html
              .split('\n')
              .map((line) => {
                const splitted = line.split(`<span class="quote__content">`);
                if (splitted.length === 1) return line;
                return `<span><span>&gt;${splitted[1]}`;
              })
              .join('\n') || ''
          )}
        </div>
        {comment.donate ? (
          <div className="comment__donate default-no-select">
            {comment.donate.count}
            {' '}₽
          </div>
        ) : null}
        {comment.attaches?.length ? (
          <>
            {comment.attaches.filter((attach) => attach.type === 'image').length ? (
              <PostBlock
                block={{
                  type: 'media',
                  data: {
                    items: comment.attaches
                      .filter((attach) => attach.type === 'image')
                      .map((attach) => ({
                        image: attach,
                      })),
                  },
                }}
                key={`attach-images-${comment.id}`}
              />
            ) : null}
            {comment.attaches
              .filter((attach) => ['link', 'video', 'tweet', 'telegram', 'instagram'].includes(attach.type))
              .map((attach) => (
                <PostBlock
                  block={{
                    type: attach.type,
                    data: {
                      [attach.type]: attach,
                    },
                  }}
                  key={`attach-${attach.type}-${attach.data?.uuid || attach.data?.url}-${comment.id}`}
                />
              ))}
          </>
        ) : null}
      </div>
    </div>
  );
}

CommentContainer.propTypes = {
  comment: PropTypes.object.isRequired,
  isLast: PropTypes.bool,
  hiddenBranchDepths: PropTypes.arrayOf(PropTypes.number),
  parentComments: PropTypes.arrayOf(PropTypes.number),
  entryId: PropTypes.number,
  authorId: PropTypes.number,
};

CommentContainer.defaultProps = {
  isLast: false,
  hiddenBranchDepths: [],
  parentComments: [],
  entryId: 0,
  authorId: 0,
};
