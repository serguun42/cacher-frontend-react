/**
 * @param {{ commentId: number } & { commentElem: HTMLElement }} prop
 * @returns {void}
 */
export default function ScrollToComment({ commentId, commentElem }) {
  if (!commentId && !commentElem) return;

  const behavior = commentId ? 'smooth' : undefined;

  const targetCommentElem =
    commentElem instanceof HTMLElement
      ? commentElem
      : document.querySelector(`.comment-container[data-comment-id="${commentId}"]`);
  if (!targetCommentElem) return;

  targetCommentElem.scrollIntoView({ block: 'center', behavior });

  targetCommentElem.classList.add('comment-container--animating');
  setTimeout(() => targetCommentElem.classList.remove('comment-container--animating'), 1500);
}
