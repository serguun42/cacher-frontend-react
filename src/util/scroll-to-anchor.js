/**
 * @param {{ anchor: string } & { anchorElem: HTMLElement }} prop
 * @returns {void}
 */
export default function ScrollToAnchor({ anchor, anchorElem }) {
  if (!anchor && !anchorElem) return;

  const behavior = anchor ? 'smooth' : undefined;

  const targetAnchorElem =
    anchorElem instanceof HTMLElement ? anchorElem : document.querySelector(`[data-anchor="${anchor}"]`);
  if (!targetAnchorElem) return;

  targetAnchorElem.scrollIntoView({ block: 'start', behavior });
}
