/**
 * @param {import("../../types/last_comment").LastComment[]} lastComments
 * @param {{ [userId: number]: string }} usersIdToTheirAvatars
 * @returns {import("../../types/comment").Comment[]}
 */
const TransformLastCommentsToRegular = (lastComments, usersIdToTheirAvatars) => {
  /** @type {import("../../types/comment").Comment[]} */
  const commentsAscendingOrder = lastComments
    .map(
      /** @returns {import("../../types/comment").Comment} */ (lastComment) => ({
        author: {
          id: lastComment.creator.id,
          name: lastComment.creator.name,
          avatar_url: usersIdToTheirAvatars[lastComment.creator.id] || null,
        },
        id: lastComment.comment_id,
        date: Math.round(new Date(lastComment.date).getTime() / 1e3),
        dateRFC: lastComment.date,
        html: lastComment.text.replace(
          /\[@(\d+)\|([^\]]+)\]/g,
          `<a href="https://${process.env.REACT_APP_SITE_LINK}/u/$1" target="_blank" rel="noopener noreferrer">@$2</a>`
        ),
        text: lastComment.text,
        replyTo: lastComment.reply_to_id,
        attaches: lastComment.media,
        media: lastComment.media,
        level: 0,
        likes: null,
      })
    )
    .sort((prev, next) => prev.id - next.id);

  /** @type {import("../../types/comment").Comment[]} */
  const rebuiltComments = [];

  commentsAscendingOrder.forEach((comment) => {
    if (!comment) return;

    const movingComment = comment;

    if (!comment.replyTo) rebuiltComments.push(movingComment);
    else {
      let indexOfParent = rebuiltComments.findIndex((commentToFind) => commentToFind.id === comment.replyTo);
      if (indexOfParent < 0) indexOfParent = commentsAscendingOrder.length - 1;

      movingComment.level = (rebuiltComments[indexOfParent]?.level || 0) + 1;

      rebuiltComments.splice(indexOfParent + 1, 0, movingComment);
    }
  });

  return rebuiltComments;
};

/**
 * @param {import("../../types/entry").Entry} entry
 * @returns {void}
 */
const TransformEntryComments = (entry) => {
  entry.comments ??= {};

  if (entry.commentsVersion !== 'v2' && entry.commentsFetchedDate) {
    entry.commentsVersion = 'v2';

    const commentsFetchedDateMS = new Date(entry.commentsFetchedDate).getTime();
    if (commentsFetchedDateMS)
      entry.comments = {
        [commentsFetchedDateMS]: entry.comments,
      };
  }

  /** @type {{ [userId: number]: string }} */
  const usersIdToTheirAvatars = {};
  Object.keys(entry.comments).forEach((commentsVersion) =>
    entry.comments[commentsVersion].forEach((comment) => {
      usersIdToTheirAvatars[comment.author.id] = comment.author.avatar_url;
    })
  );

  if (entry.lastComments)
    entry.lastComments = TransformLastCommentsToRegular(entry.lastComments, usersIdToTheirAvatars);
};

export default TransformEntryComments;
