/**
 * @param {{ commentId: number } & { commentElem: HTMLElement }} prop
 * @returns {void}
 */
export default function ScrollToComment({ commentId, commentElem }) {
  if (!commentId && !commentElem) return;

  const targetCommentElem =
    commentElem instanceof HTMLElement
      ? commentElem
      : document.querySelector(`.comment-container[data-comment-id="${commentId}"]`);
  if (!targetCommentElem) return;

  const targetDispacement = targetCommentElem.getBoundingClientRect().top;
  const initialScrollTop = document.documentElement.scrollTop;
  const commentsTopBarHeight = document.querySelector('.entry-comments__upper-info')?.clientHeight || 50;

  document.documentElement.scrollTo({
    left: 0,
    top: initialScrollTop + targetDispacement - commentsTopBarHeight * 2,
    behavior: 'smooth',
  });

  targetCommentElem.classList.add('comment-container--animating');
  setTimeout(() => targetCommentElem.classList.remove('comment-container--animating'), 1500);
}
