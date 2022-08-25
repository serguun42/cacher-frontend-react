import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ScrollToComment from '../util/scroll-to-comment';
import { StraightRefined } from '../util/html/refined';
import CommentInfoLine from './CommentInfoLine';
import PostBlock from './PostBlock';
import './CommentContainer.css';

/**
 * @param {{ comment: import("../../types/comment").Comment, entryId: number, authorId: number }} props
 */
export default function CommentContainer({ comment, entryId, authorId }) {
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

  return (
    <div className="comment-container" data-comment-id={comment.id} ref={commentRef}>
      {Array.from({ length: Math.min(comment.level, 5) }, (_, idx) => (
        <div className="comment-dots" key={`comment-${comment.id}-${comment.is_pinned}-level-${idx}`} />
      ))}
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
  entryId: PropTypes.number,
  authorId: PropTypes.number,
};

CommentContainer.defaultProps = {
  entryId: 0,
  authorId: 0,
};
