import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import DateForPost from '../util/date-for-post';
import dispatcher from '../util/dispatcher';
import Refined from '../util/html/refined';
import PopupAboutQuiz from '../util/popups/about-quiz';
import TwitterMediaToOsnovaMediaBlock from '../util/tweet-entities-to-media-block';
import './PostBlock.css';
import Ripple from './Ripple';

const IS_SAFARI =
  navigator.userAgent.search('Safari') > -1 &&
  navigator.userAgent.search('Chrome') === -1 &&
  navigator.userAgent.search(/OPR/i) === -1 &&
  navigator.userAgent.search('Edg') === -1 &&
  navigator.userAgent.search('Firefox') === -1;

/**
 * @param {string} uuid
 * @returns {boolean}
 */
const TestOsnovaUUID = (uuid) => {
  if (typeof uuid !== 'string') return false;

  return /^[0-9a-f]{32}$/i.test(uuid.replace(/-/g, ''));
};

/**
 * @param {string} uuid
 * @returns {string}
 */
const Media = (uuid) => (TestOsnovaUUID(uuid) ? `https://${process.env.REACT_APP_CDN_DOMAIN}/${uuid}/` : uuid);

/**
 * @param {string} base
 * @param {string} [format='webp']
 * @returns {string}
 */
const Format = (base, format = 'webp') =>
  base.indexOf(process.env.REACT_APP_CDN_DOMAIN) > -1
    ? `${base}-/format/${format === 'webp' && IS_SAFARI ? 'jpg' : format}/`
    : base;

/**
 * @param {string} uuid
 * @param {number} [size=100]
 * @returns {string}
 */
const Preview = (uuid, size = 100) => `${Format(Media(uuid))}-/preview/${size}/`;

/**
 * @param {{ block: import("../../types/post_version").PostBlock }} props
 */
function PostBlockVideo({ block }) {
  const [videoRequested, setVideoRequested] = useState(false);

  const videoData = block.data.video.data;
  const postContainerWidth = window.innerWidth > 800 ? 736 : window.innerWidth - 64;
  const aspect = videoData.width / videoData.height;
  const elemWidth = videoData.width > postContainerWidth ? postContainerWidth : videoData.width;
  const elemHeight = elemWidth / aspect;

  return (
    <div className="video" style={{ width: Math.round(elemWidth), height: Math.round(elemHeight) }}>
      {videoRequested && videoData.external_service.name === 'coub' ? (
        <iframe
          // eslint-disable-next-line max-len
          src={`https://coub.com/embed/${videoData.external_service.id}?muted=false&autostart=true&originalSize=false&hideTopBar=true&startWithHD=true`}
          className="video__frame"
          width={elemWidth}
          height={elemHeight}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          frameBorder="0"
          title={`Coub ${videoData.external_service.id}`}
        />
      ) : videoRequested && videoData.external_service.name === 'youtube' ? (
        <iframe
          src={`https://youtube.com/embed/${videoData.external_service.id}`}
          className="video__frame"
          width={elemWidth}
          height={elemHeight}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          frameBorder="0"
          title={`Youtube ${videoData.external_service.id}`}
        />
      ) : null}
      {videoRequested ? null : (
        <div
          className="video__thumbnail default-pointer"
          style={{ backgroundImage: `url(${Media(videoData.thumbnail.data.uuid)})` }}
          onClick={() => setVideoRequested(true)}
        >
          <div className="media-video-pseudo-play">
            <div className="material-icons">play_arrow</div>
          </div>
        </div>
      )}
    </div>
  );
}

PostBlockVideo.propTypes = {
  block: PropTypes.object.isRequired,
};

/** @returns {number} */
const GetMinAspectRatio = () => {
  const lastWindowWidth = window.innerWidth;

  if (lastWindowWidth <= 500) return 1;
  if (lastWindowWidth <= 700) return 2;

  return 3;
};

/**
 * @param {{ block: import("../../types/post_version").PostBlock }} props
 */
function PostBlockGallery({ block }) {
  /** @type {import("react").MutableRefObject<HTMLElement>} */
  const galleryRef = useRef(null);

  /**
   * @typedef {Object} GalleryAddition
   * @property {number} aspectRatio
   * @property {string} [title]
   * @property {string} [author]
   * @property {"photo" | "video"} type
   * @property {{ width: number, height: number, translateX: number, translateY: number }} styles
   */
  /**
   * @typedef {import("../../types/post_version").PostMedia & GalleryAddition} GalleryImage
   */
  /** @type {[GalleryImage[]]} */
  const [galleryImages, setGalleryImages] = useState([]);
  /** @type {[GalleryImage[]]} */
  const [galleryPayload, setGalleryPayload] = useState([]);
  const [imagesLeft, setImagesLeft] = useState(0);
  const [totalHeight, setTotalHeight] = useState(0);

  const onGalleryWidthChanges = (galleryWidth) => {
    if (!galleryWidth) return;

    const wrapperWidth = galleryWidth;
    const spaceBetweenImages = 8;
    const minAspectRatio = GetMinAspectRatio();

    /** @type {GalleryImage[]} */
    let row = [];
    let rows = 0;
    let rowAspectRatio = 0;
    let translateX = 0;
    let translateY = 0;

    /** @type {GalleryImage[]} */
    const images = block.data.items.map((item) => ({
      ...item.image.data,
      type: ['jpg', 'jpeg', 'png', 'webp', 'image'].includes(item.image.data.type) ? 'photo' : 'video',
      aspectRatio: item.image.data.width / item.image.data.height,
    }));

    const trimmedImages = images
      .map((image, index) => {
        /** Two lines at maximum */
        if (rows >= 2) return null;

        rowAspectRatio += parseFloat(image.aspectRatio);
        row.push(image);

        if (rowAspectRatio >= minAspectRatio || index + 1 === images.length) {
          /** Skip second line when it's barely filled */
          if (rows === 1 && index + 1 === images.length && rowAspectRatio <= minAspectRatio * 0.75) return null;

          rowAspectRatio = Math.max(rowAspectRatio, minAspectRatio);
          const totalDesiredWidthOfImages = wrapperWidth - spaceBetweenImages * (row.length - 1);
          const rowHeight = totalDesiredWidthOfImages / rowAspectRatio;

          row.forEach((imageInRow) => {
            const imageWidth = rowHeight * imageInRow.aspectRatio;
            imageInRow.styles = {
              width: imageWidth,
              height: rowHeight,
              translateX,
              translateY,
            };

            translateX += imageWidth + spaceBetweenImages;
          });

          row = [];
          rows += 1;
          rowAspectRatio = 0;
          translateY += rowHeight + spaceBetweenImages;
          translateX = 0;
        }

        return image;
      })
      .filter((image) => !!image?.styles);

    setTotalHeight(translateY - spaceBetweenImages);
    setGalleryPayload(images);
    setGalleryImages(trimmedImages);
    setImagesLeft(images.length - trimmedImages.length);
  };

  const resizeListener = () => {
    if (galleryRef.current) onGalleryWidthChanges(galleryRef.current.clientWidth);
  };

  useEffect(() => {
    if (galleryRef.current) onGalleryWidthChanges(galleryRef.current.clientWidth);

    window.addEventListener('resize', resizeListener);

    return () => window.removeEventListener('resize', resizeListener);
  }, [galleryRef]);

  return (
    <div className="media-gallery" ref={galleryRef} style={{ height: totalHeight }}>
      {galleryImages.map((galleryImage, galleryImageIndex) => (
        <div
          className="media-gallery__figure default-pointer"
          key={`gallery-figure-${galleryImageIndex.toString()}-${galleryImage.uuid}`}
          style={{
            backgroundImage: `url(${Format(Media(galleryImage.uuid))})`,
            width: galleryImage.styles.width,
            height: galleryImage.styles.height,
            transform: `translate(${galleryImage.styles.translateX}px, ${galleryImage.styles.translateY}px)`,
          }}
          onClick={() => {
            /** @type {import("./MediaViewer").GalleryPayload} */
            const galleryViewer = {
              media: galleryPayload.map((mediaPayload) => ({
                url: Format(Media(mediaPayload.uuid), mediaPayload.type === 'video' ? 'mp4' : 'webp'),
                type: mediaPayload.type,
                width: mediaPayload.width,
                height: mediaPayload.height,
                description: Refined(
                  mediaPayload.title || mediaPayload.author
                    ? `${mediaPayload.title}${mediaPayload.title && mediaPayload.author && ' – '}${mediaPayload.author}`
                    : ''
                ),
              })),
              position: galleryImageIndex,
            };

            dispatcher.call('gallery', galleryViewer);
          }}
        >
          {imagesLeft && galleryImageIndex + 1 === galleryImages.length ? (
            <div className="media-gallery__figure__left">
              <span>+{imagesLeft + 1}</span>
            </div>
          ) : galleryImage.type === 'video' ? (
            <div className="media-video-pseudo-play">
              <div className="material-icons">play_arrow</div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

PostBlockGallery.propTypes = {
  block: PropTypes.object.isRequired,
};

/**
 * @param {{ block: import("../../types/post_version").PostBlock }} props
 */
function PostBlockSingleMedia({ block }) {
  if (!block?.data?.items?.[0]) return null;

  const media = block.data.items[0];
  const type = ['jpg', 'jpeg', 'png', 'webp', 'image'].includes(media.image.data.type) ? 'photo' : 'video';

  const onClick = () => {
    /** @type {import("./MediaViewer").MediaPayload} */
    const mediaPayload = {
      url: Format(Media(media.image.data.uuid), type === 'video' ? 'mp4' : 'webp'),
      type,
      width: media.image.data.width,
      height: media.image.data.height,
      description: Refined(
        media.title || media.author ? `${media.title}${media.title && media.author && ' – '}${media.author}` : ''
      ),
    };

    dispatcher.call('media', mediaPayload);
  };

  /** @type {import("react").MutableRefObject<HTMLElement>} */
  const mediaSingleRef = useRef();
  /** @type {import("react").MutableRefObject<HTMLElement>} */
  const mediaImagePreviewRef = useRef();

  const [useWrapper, setUseWrapper] = useState(false);

  useEffect(() => {
    const mediaSingle = mediaSingleRef.current;
    const mediaImagePreview = mediaImagePreviewRef.current;

    if (!mediaSingle) return;
    if (media.image.data.width < mediaSingle.clientWidth) {
      setUseWrapper(true);
      return;
    }

    if (!mediaImagePreview) return;
    if (mediaImagePreview.clientWidth < mediaSingle.clientWidth - 50) setUseWrapper(true);
  }, [mediaSingleRef, mediaImagePreviewRef]);

  return (
    <div className="media-single" ref={mediaSingleRef}>
      <div
        className={`media-single__wrapper ${useWrapper ? 'media-single__wrapper--visible' : ''} default-pointer`}
        onClick={onClick}
      >
        <img
          className="media-single__media"
          alt=""
          src={Format(Media(media.image.data.uuid))}
          ref={mediaImagePreviewRef}
        />
        {type === 'video' ? (
          <div className="media-video-pseudo-play">
            <div className="material-icons">play_arrow</div>
          </div>
        ) : null}
      </div>
      {media.title || media.author ? (
        <div className="media-single__desc">
          {media.title ? <span>{Refined(media.title)}</span> : null}
          {media.author ? <span>{Refined(media.author)}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

PostBlockSingleMedia.propTypes = {
  block: PropTypes.object.isRequired,
};

/**
 * @param {{ block: import("../../types/post_version").PostBlock }} props
 */
export default function PostBlock({ block }) {
  if (block.type === 'text') return <p>{Refined(block.data.text)}</p>;

  if (block.type === 'header') return <h4>{Refined(block.data.text)}</h4>;

  if (block.type === 'media' && block.data.items)
    if (block.data.items.length === 1) return <PostBlockSingleMedia block={block} />;
    else return <PostBlockGallery block={block} />;

  if (block.type === 'video' && block.data?.video?.data) return <PostBlockVideo block={block} />;

  if (block.type === 'incut')
    return (
      <div className="incut">
        <div className={block.data.text?.length < 300 ? 'incut__medium' : 'incut__text'}>
          {Refined(block.data.text)}
        </div>
      </div>
    );

  if (block.type === 'number')
    return (
      <div className="incut">
        <div className="incut__bigger">{Refined(block.data.number)}</div>
        <div className="incut__text">{Refined(block.data.title)}</div>
      </div>
    );

  if (block.type === 'quote')
    return (
      <div className="incut incut-quote">
        {block.data.text ? <div className="incut__text">{Refined(block.data.text)}</div> : null}
        <div className="incut__flex-row">
          {block.data.image ? (
            <div className="incut__image" style={{ backgroundImage: `url(${Preview(block.data.image.data.uuid)})` }} />
          ) : null}
          <div className="incut__flex-col">
            {block.data.subline1 ? <div className="incut__bigger">{Refined(block.data.subline1)}</div> : null}
            {block.data.subline2 ? <div className="incut__medium">{Refined(block.data.subline2)}</div> : null}
          </div>
        </div>
      </div>
    );

  if (block.type === 'person')
    return (
      <div className="incut incut-person">
        {block.data.text ? <div className="incut__text">{Refined(block.data.text)}</div> : null}
        <div className="incut__flex-row">
          {block.data.image ? (
            <div className="incut__image" style={{ backgroundImage: `url(${Preview(block.data.image.data.uuid)})` }} />
          ) : null}
          <div className="incut__flex-col">
            {block.data.title ? <div className="incut__bigger">{Refined(block.data.title)}</div> : null}
            {block.data.description ? <div className="incut__medium">{Refined(block.data.description)}</div> : null}
          </div>
        </div>
      </div>
    );

  if (block.type === 'delimiter') return <div className="delimiter default-no-select">***</div>;

  if (block.type === 'link' && block.data?.link?.data) {
    const fineLink = (block.data.link.data.url || '').replace(
      new RegExp(`[?]?ref=${process.env.REACT_APP_SITE_LINK.replace(/\./g, '\\.')}$`, 'i'),
      ''
    );

    return (
      <a href={fineLink} className="link" target="_blank" rel="noopener noreferrer">
        <div className="link__title">{Refined(block.data.link.data.title)}</div>
        <div className="link__fake-url">{Refined(fineLink)}</div>
      </a>
    );
  }

  if (block.type === 'list' && Array.isArray(block.data.items))
    return (
      <ul>
        {block.data.items.map((line, index) => (
          <li key={`ul-line-${line}-${index.toString()}`}>{Refined(line)}</li>
        ))}
      </ul>
    );

  if (block.type === 'quiz')
    return (
      <div className="quiz">
        <div className="quiz__title">
          <div>{Refined(block.data.title)}</div>
          <div className="quiz__about default-pointer" onClick={PopupAboutQuiz}>
            <i className="material-icons">help_outline</i>
            <Ripple />
          </div>
        </div>
        <div className="quiz__options">
          {Object.keys(block.data.items).map((key) => (
            <div className="quiz__options__answer" key={`quiz-answer-${key}`}>
              {Refined(block.data.items[key])}
            </div>
          ))}
        </div>
      </div>
    );

  if (block.type === 'audio')
    return (
      <div className="audio">
        {block.data.image ? (
          <div
            className="audio__image"
            style={{ backgroundImage: `url(${Preview(block.data.image.data.uuid, 300)})` }}
          />
        ) : null}
        <div className="audio__flex">
          <div className="audio__flex__title">{Refined(block.data.title)}</div>
          <audio
            className="audio__flex__actual-audio"
            src={`https://leonardo.osnova.io/audio/${block.data.audio.data.uuid}/${block.data.audio.data.filename}`}
            controls
          />
        </div>
      </div>
    );

  if (block.type === 'tweet') {
    /** @type {import("../../types/tweet").Tweet} */
    const tweet = block.data?.tweet?.data?.tweet_data;
    if (!tweet) return null;

    return (
      <div className="social">
        <div className="social__user">
          <div className="social__avatar" style={{ backgroundImage: `url(${tweet.user.profile_image_url_https})` }} />
          <div className="social__fullname">{tweet.user.name}</div>
          <a
            className="social__username"
            href={`https://twitter.com/${tweet.user.screen_name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{tweet.user.screen_name}
          </a>
          <a
            className="social__date"
            href={`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{DateForPost(tweet.created_at)}</span>
            <i className="material-icons">open_in_new</i>
          </a>
        </div>
        <div className="social__text">
          {Refined((tweet.full_text || '').replace(/https:\/\/t\.\w+\/\w+$/i, '').trim())}
        </div>
        {tweet.extended_entities?.media?.length ? (
          <div className="social__media">
            {tweet.extended_entities?.media?.length === 1 ? (
              <PostBlockSingleMedia block={TwitterMediaToOsnovaMediaBlock(tweet.extended_entities)} />
            ) : (
              <PostBlockGallery block={TwitterMediaToOsnovaMediaBlock(tweet.extended_entities)} />
            )}
          </div>
        ) : null}
      </div>
    );
  }

  if (block.type === 'telegram')
    return (
      <div className="incut">
        Тут пост в Telegram, но эмбеды очень много кушоють и вообще лагают, шо атас! Поэтому{' '}
        <a href={block.data.telegram.data.tg_data.url} target="_blank" rel="noopener noreferrer">
          просто прямая ссылка на пост
        </a>
      </div>
    );

  if (block.type === 'instagram')
    return (
      <div className="incut">
        Тут пост в Instagram, но эмбеды очень много кушоють и вообще лагают, шо атас! Поэтому{' '}
        <a href={block.data.instagram.data.box_data.url} target="_blank" rel="noopener noreferrer">
          просто прямая ссылка на пост
        </a>
      </div>
    );

  if (block.type === 'code') return <pre>{Refined(block.data.text)}</pre>;

  if (block.data?.text) return <p>{Refined(block.data.text)}</p>;

  return null;
}

PostBlock.propTypes = {
  block: PropTypes.object.isRequired,
};
