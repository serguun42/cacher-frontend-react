import { createRef, useEffect, useState } from 'react';
import { FadeIn, FadeOut } from '../util/animations';
import dispatcher from '../util/dispatcher';
import './MediaViewer.css';
import Ripple from './Ripple';

/**
 * @typedef {Object} MediaPayload
 * @property {string} media URL to media
 * @property {"photo" | "video"} type URL to media
 * @property {number} width
 * @property {number} height
 * @property {string} [description]
 */
/**
 * @typedef {Object} MediaContainer
 * @property {boolean} shown
 * @property {number} width
 * @property {number} height
 */

/** @type {MediaPayload} */
const DEFAULT_MEDIA_STATE = Object.freeze({
  media: '',
  type: 'photo',
  width: 800,
  height: 600,
  description: '',
});

/** @type {MediaContainer} */
const DEFAULT_CONTAINER_STATE = Object.freeze({
  width: 800,
  height: 600,
});

export default function MediaViewer() {
  /** @type {[MediaPayload]} */
  const [mediaState, setMediaState] = useState({ ...DEFAULT_MEDIA_STATE });
  /** @type {[MediaContainer]} */
  const [containerState, setContainerState] = useState({ ...DEFAULT_CONTAINER_STATE });
  /** @type {import("react").RefObject<HTMLElement>} */
  const mediaRef = createRef();

  /**
   * @param {MediaPayload} mediaPayload
   */
  const watchMediaEvent = (mediaPayload) => {
    setMediaState({ ...DEFAULT_MEDIA_STATE, ...mediaPayload });

    const WINDOW_WIDTH = window.innerWidth;
    const WINDOW_HEIGHT = window.innerHeight;
    const WINDOW_RATIO = WINDOW_WIDTH / WINDOW_HEIGHT;
    const CONTAINER_WIDTH = mediaPayload.width;
    const CONTAINER_HEIGHT = mediaPayload.height;
    const CONTAINER_RATIO = CONTAINER_WIDTH / CONTAINER_HEIGHT;

    let finalWidth = 0;
    let finalHeight = 0;

    if (WINDOW_RATIO >= 1) {
      if (CONTAINER_RATIO >= WINDOW_RATIO) {
        if (WINDOW_WIDTH * 0.8 >= CONTAINER_WIDTH) {
          finalWidth = CONTAINER_WIDTH;
          finalHeight = CONTAINER_HEIGHT;
        } else {
          finalWidth = WINDOW_WIDTH * 0.8;
          finalHeight = finalWidth / CONTAINER_RATIO;
        }
      } else if (WINDOW_HEIGHT * 0.8 >= CONTAINER_HEIGHT) {
        finalWidth = CONTAINER_WIDTH;
        finalHeight = CONTAINER_HEIGHT;
      } else {
        finalHeight = WINDOW_HEIGHT * 0.8;
        finalWidth = finalHeight * CONTAINER_RATIO;
      }
    } else if (CONTAINER_RATIO <= WINDOW_RATIO) {
      if (WINDOW_HEIGHT * 0.8 >= CONTAINER_HEIGHT) {
        finalWidth = CONTAINER_WIDTH;
        finalHeight = CONTAINER_HEIGHT;
      } else {
        finalHeight = WINDOW_HEIGHT * 0.8;
        finalWidth = finalHeight * CONTAINER_RATIO;
      }
    } else if (WINDOW_WIDTH * 0.8 >= CONTAINER_WIDTH) {
      finalWidth = CONTAINER_WIDTH;
      finalHeight = CONTAINER_HEIGHT;
    } else {
      finalWidth = WINDOW_WIDTH * 0.8;
      finalHeight = finalWidth / CONTAINER_RATIO;
    }

    setContainerState({
      shown: true,
      width: finalWidth,
      height: finalHeight,
    });
  };

  const hide = () => setContainerState({ ...containerState, shown: false });

  /**
   * @param {KeyboardEvent} e
   */
  const onKeyDown = (e) => {
    if ((e.key === 'Escape' || e.code === 'Escape') && containerState.shown) hide();
  };

  useEffect(() => {
    dispatcher.link('media', watchMediaEvent);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      dispatcher.unlink('media', watchMediaEvent);
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  useEffect(() => {
    if (!('shown' in containerState)) return;

    if (containerState.shown) FadeIn(mediaRef.current, 400);
    else FadeOut(mediaRef.current, 400);
  }, [containerState.shown]);

  return (
    <div className="media-container" ref={mediaRef}>
      <div className="media-obfuscator default-pointer" onClick={hide} />
      <div className="media-close-button default-pointer" onClick={hide}>
        <i className="material-icons">close</i>
        <Ripple inheritTextColor />
      </div>
      <div
        className="media-body"
        style={{
          width: containerState.width,
          height: containerState.height,
        }}
      >
        {mediaState.type === 'photo' ? <img src={mediaState.media} className="media-body__img" /> : null}
        {mediaState.description ? <div className="media-body__description">{mediaState.description}</div> : null}
      </div>
    </div>
  );
}
