import PropTypes from 'prop-types';
import { StraightRefined } from '../util/html/refined';
import CommentInfoLine from './CommentInfoLine';
import './Comments.css';
import PostBlock from './PostBlock';

/**
 * @param {{ comments: import("../../types/comment").Comment[] }} props
 */
export default function Comments({ comments, entryId }) {
  if (!comments?.length)
    return (
      <div className="comments">
        <h4 className="comments-empty">Тут пусто! 🤷‍♂️</h4>
      </div>
    );

  return (
    <div className="comments">
      {comments.map((comment, commentIndex) => (
        <div
          className="comment-container"
          key={`comment-${comment.id}-${commentIndex.toString()}`}
          data-comment-id={comment.id}
        >
          {Array.from({ length: Math.min(comment.level, 5) }, (_, idx) => (
            <div className="comment-dots" key={`comment-${comment.id}-level-${idx}`} />
          ))}
          <div className="comment">
            <CommentInfoLine comment={comment} entryId={entryId} />
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
                    key={`attach-images-${comment.id}-${commentIndex.toString()}`}
                  />
                ) : null}
                {comment.attaches
                  .filter((attach) => ['link', 'video', 'tweet', 'telegram', 'instagram'].includes(attach.type))
                  .map((attach, attachIndex) => (
                    <PostBlock
                      block={{
                        type: attach.type,
                        data: {
                          [attach.type]: attach,
                        },
                      }}
                      key={`attach-link-${comment.id}-${commentIndex.toString()}-${attachIndex.toString()}`}
                    />
                  ))}
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

Comments.propTypes = {
  comments: PropTypes.array,
  entryId: PropTypes.number.isRequired,
};

Comments.defaultProps = {
  comments: [],
};
