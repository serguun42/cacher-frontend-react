import { createRef, useEffect, useState } from 'react';
import { FadeIn, FadeOut } from '../util/animations';
import dispatcher from '../util/dispatcher';
import LogMessageOrError from '../util/log';
import Ripple from './Ripple';
import './MediaViewer.css';

/**
 * @typedef {Object} MediaPayload
 * @property {string} url URL to media
 * @property {"photo" | "video"} type URL to media
 * @property {number} width
 * @property {number} height
 * @property {string} [description]
 */
/**
 * @typedef {Object} GalleryPayload
 * @property {MediaPayload[]} media
 * @property {number} position
 */
/**
 * @typedef {Object} MediaContainer
 * @property {boolean} shown
 * @property {number} width
 * @property {number} height
 */

/** @type {MediaPayload} */
const DEFAULT_MEDIA_STATE = Object.freeze({
  url: '',
  type: 'photo',
  width: 800,
  height: 600,
  description: '',
});

/** @type {MediaContainer} */
const DEFAULT_CONTAINER_STATE = Object.freeze({
  width: 800,
  height: 600,
  gallery: null,
});

export default function MediaViewer() {
  /** @type {[MediaPayload]} */
  const [mediaState, setMediaState] = useState({ ...DEFAULT_MEDIA_STATE });
  /** @type {[MediaContainer]} */
  const [containerState, setContainerState] = useState({ ...DEFAULT_CONTAINER_STATE });
  /** @type {[GalleryPayload]} */
  const [galleryState, setGalleryState] = useState({});
  /** @type {import("react").RefObject<HTMLElement>} */
  const containerRef = createRef();
  /** @type {import("react").RefObject<HTMLVideoElement | HTMLImageElement>} */
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
    const MAX_RATIO = 0.8;

    let finalWidth = 0;
    let finalHeight = 0;

    if (WINDOW_RATIO >= 1) {
      if (CONTAINER_RATIO >= WINDOW_RATIO) {
        if (WINDOW_WIDTH * MAX_RATIO >= CONTAINER_WIDTH) {
          finalWidth = CONTAINER_WIDTH;
          finalHeight = CONTAINER_HEIGHT;
        } else {
          finalWidth = WINDOW_WIDTH * MAX_RATIO;
          finalHeight = finalWidth / CONTAINER_RATIO;
        }
      } else if (WINDOW_HEIGHT * MAX_RATIO >= CONTAINER_HEIGHT) {
        finalWidth = CONTAINER_WIDTH;
        finalHeight = CONTAINER_HEIGHT;
      } else {
        finalHeight = WINDOW_HEIGHT * MAX_RATIO;
        finalWidth = finalHeight * CONTAINER_RATIO;
      }
    } else if (CONTAINER_RATIO <= WINDOW_RATIO) {
      if (WINDOW_HEIGHT * MAX_RATIO >= CONTAINER_HEIGHT) {
        finalWidth = CONTAINER_WIDTH;
        finalHeight = CONTAINER_HEIGHT;
      } else {
        finalHeight = WINDOW_HEIGHT * MAX_RATIO;
        finalWidth = finalHeight * CONTAINER_RATIO;
      }
    } else if (WINDOW_WIDTH * MAX_RATIO >= CONTAINER_WIDTH) {
      finalWidth = CONTAINER_WIDTH;
      finalHeight = CONTAINER_HEIGHT;
    } else {
      finalWidth = WINDOW_WIDTH * MAX_RATIO;
      finalHeight = finalWidth / CONTAINER_RATIO;
    }

    setContainerState({
      shown: true,
      width: finalWidth,
      height: finalHeight,
    });
  };

  /**
   * @param {GalleryPayload} galleryPayload
   */
  const watchGalleryEvent = (galleryPayload) => {
    if (!galleryPayload.position) galleryPayload.position = 0;

    setGalleryState(galleryPayload);
    watchMediaEvent(galleryPayload.media[galleryPayload.position]);
  };

  const hide = () => {
    setContainerState({ ...containerState, shown: false });
    setGalleryState([]);

    const mediaElem = mediaRef.current;
    if (mediaElem && 'pause' in mediaElem) mediaElem.pause();
  };

  /**
   * @param {KeyboardEvent} e
   */
  const onKeyDown = (e) => {
    if ((e.key === 'Escape' || e.code === 'Escape') && containerState.shown) hide();

    if (galleryState.media?.length) {
      if ((e.key === 'ArrowRight' || e.code === 'ArrowRight') && containerState.shown)
        watchGalleryEvent({
          media: galleryState.media,
          position: galleryState.position + 1 >= galleryState.media.length ? 0 : galleryState.position + 1,
        });
      else if ((e.key === 'ArrowLeft' || e.code === 'ArrowLeft') && containerState.shown)
        watchGalleryEvent({
          media: galleryState.media,
          position: galleryState.position - 1 < 0 ? galleryState.media.length - 1 : galleryState.position - 1,
        });
    }
  };

  useEffect(() => {
    dispatcher.link('media', watchMediaEvent);
    dispatcher.link('gallery', watchGalleryEvent);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      dispatcher.unlink('media', watchMediaEvent);
      dispatcher.unlink('gallery', watchGalleryEvent);
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  useEffect(() => {
    if (!('shown' in containerState)) return;

    if (containerState.shown)
      FadeIn(containerRef.current, 400).then(() => {
        const mediaElem = mediaRef.current;
        if (mediaElem instanceof HTMLVideoElement && mediaState.type === 'video') {
          mediaElem.volume = 0.3;
          mediaElem.play().catch(LogMessageOrError);
        }
      });
    else
      FadeOut(containerRef.current, 400).then(() => {
        setMediaState({ ...DEFAULT_MEDIA_STATE });
        const mediaElem = mediaRef.current;
        if (mediaElem && 'src' in mediaElem) mediaElem.src = null;
      });
  }, [containerState.shown]);

  return (
    <div className="media-container" ref={containerRef}>
      <div className="media-obfuscator default-pointer" onClick={hide} />
      {galleryState.media?.length ? (
        <>
          <div
            className="media-gallery-turn-button default-pointer media-gallery-turn-button--previous"
            onClick={() => {
              watchGalleryEvent({
                media: galleryState.media,
                position: galleryState.position - 1 < 0 ? galleryState.media.length - 1 : galleryState.position - 1,
              });
            }}
          >
            <div className="media-gallery-turn-button__icon">
              <div className="material-icons">chevron_left</div>
              <Ripple inheritTextColor />
            </div>
          </div>
          <div
            className="media-gallery-turn-button default-pointer media-gallery-turn-button--next"
            onClick={() => {
              watchGalleryEvent({
                media: galleryState.media,
                position: galleryState.position + 1 >= galleryState.media.length ? 0 : galleryState.position + 1,
              });
            }}
          >
            <div className="media-gallery-turn-button__icon">
              <div className="material-icons">chevron_right</div>
              <Ripple inheritTextColor />
            </div>
          </div>
        </>
      ) : null}
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
        {mediaState.type === 'photo' && <img src={mediaState.url} className="media-body__media" ref={mediaRef} />}
        {mediaState.type === 'video' && (
          <video src={mediaState.url} className="media-body__media" controls ref={mediaRef} />
        )}
        <div className="media-body__lower-bar">
          <div className="media-body__description">{mediaState.description || ''}</div>
          {galleryState.media?.length ? (
            <div className="media-body__controls default-no-select">
              {galleryState.position + 1} из {galleryState.media?.length}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
