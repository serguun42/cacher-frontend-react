import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import DateForPost from '../util/date-for-post';
import dispatcher from '../util/dispatcher';
import Refined, { StraightRefined } from '../util/html/refined';
import PopupAboutQuiz from '../util/popups/about-quiz';
import TelegramMediaToOsnovaMediaBlock from '../util/telegram-media-to-media-block';
import TwitterMediaToOsnovaMediaBlock from '../util/tweet-entities-to-media-block';
import Ripple from './Ripple';
import ScrollToAnchor from '../util/scroll-to-anchor';
import './PostBlock.css';

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
 * @param {{ block: import("../../types/post_version").PostBlockTypeVideo }} props
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
      {!videoRequested && (
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
 * @param {{ block: import("../../types/post_version").PostBlockTypeMedia }} props
 */
function PostBlockGallery({ block }) {
  if (!block?.data?.items) return null;

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
   * @typedef {import("../../types/post_version").PostMediaData & GalleryAddition} GalleryImage
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
          key={`gallery-figure-${galleryImage.uuid}`}
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
 * @param {{ block: import("../../types/post_version").PostBlockTypeMedia }} props
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
          {media.title}
          {media.title && media.author && ' – '}
          {media.author}
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
  /** @type {import("react").MutableRefObject<HTMLElement>} */
  const postBlockRef = useRef(null);
  useEffect(() => {
    if (window.location.hash.length < 1) return;

    const anchorFromHash = window.location.hash.slice(1);
    const anchorElem = postBlockRef.current;

    if (block.anchor === anchorFromHash && anchorElem) {
      ScrollToAnchor({ anchorElem });
    }
  }, [postBlockRef]);

  if (block.type === 'text')
    return (
      <p data-anchor={block.anchor || null} ref={postBlockRef}>
        {Refined(block.data.text)}
      </p>
    );

  if (block.type === 'header')
    return (
      <h4 data-anchor={block.anchor || null} ref={postBlockRef}>
        {Refined(block.data.text)}
      </h4>
    );

  if (block.type === 'media' && block.data.items)
    if (block.data.items.length === 1)
      return <PostBlockSingleMedia data-anchor={block.anchor || null} refs={postBlockRef} block={block} />;
    else return <PostBlockGallery data-anchor={block.anchor || null} refs={postBlockRef} block={block} />;

  if (block.type === 'video' && block.data?.video?.data)
    return <PostBlockVideo data-anchor={block.anchor || null} refs={postBlockRef} block={block} />;

  if (block.type === 'incut')
    return (
      <div className="incut" data-anchor={block.anchor || null} ref={postBlockRef}>
        <div className={block.data.text?.length < 300 ? 'incut__medium' : 'incut__text'}>
          {Refined(block.data.text)}
        </div>
      </div>
    );

  if (block.type === 'number')
    return (
      <div className="incut" data-anchor={block.anchor || null} ref={postBlockRef}>
        <div className="incut__bigger">{Refined(block.data.number)}</div>
        <div className="incut__text">{Refined(block.data.title)}</div>
      </div>
    );

  if (block.type === 'quote')
    return (
      <div className="incut incut-quote" data-anchor={block.anchor || null} ref={postBlockRef}>
        <div className="incut__text">{Refined(block.data.text)}</div>
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
      <div className="incut incut-person" data-anchor={block.anchor || null} ref={postBlockRef}>
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

  if (block.type === 'delimiter')
    return (
      <div className="delimiter default-no-select" data-anchor={block.anchor || null} ref={postBlockRef}>
        ***
      </div>
    );

  if (block.type === 'link' && block.data?.link?.data) {
    const fineLink = (block.data.link.data.url || '').replace(
      new RegExp(`[?]?ref=${process.env.REACT_APP_SITE_LINK.replace(/\./g, '\\.')}$`, 'i'),
      ''
    );

    const DESCRIPTION_LIMIT_CHARS = 100;
    const trimmedDescription = (block.data.link.data.description || '').replace(
      new RegExp(`^(.{${DESCRIPTION_LIMIT_CHARS}}\\S*).*`),
      '$1'
    );

    return (
      <a
        href={fineLink}
        className="rich-link"
        target="_blank"
        rel="noopener noreferrer"
        data-anchor={block.anchor || null}
        ref={postBlockRef}
      >
        {block.data.link.data.title ? (
          <div className="rich-link__title">{Refined(block.data.link.data.title)}</div>
        ) : null}
        {block.data.link.data.description ? (
          <div className="rich-link__description">
            {Refined(trimmedDescription)}
            {block.data.link.data.description !== trimmedDescription ? '…' : null}
          </div>
        ) : null}
        <div className="rich-link__fake-url">
          <i className="material-icons">launch</i> {Refined(fineLink)}
        </div>
      </a>
    );
  }

  if (block.type === 'list' && Array.isArray(block.data.items))
    return (
      <ul data-anchor={block.anchor || null} ref={postBlockRef}>
        {block.data.items.map((line) => (
          <li key={`ul-line-${line}`}>{Refined(line)}</li>
        ))}
      </ul>
    );

  if (block.type === 'quiz')
    return (
      <div className="quiz" data-anchor={block.anchor || null} ref={postBlockRef}>
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
      <div className="audio" data-anchor={block.anchor || null} ref={postBlockRef}>
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
      <div className="social" data-anchor={block.anchor || null} ref={postBlockRef}>
        <svg viewBox="0 0 24 24" className="social__logo social__logo--tweet default-no-select">
          <g>
            <path
              d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958
                1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12
                1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043
                2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737
                4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313
                3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065
                2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254
                0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"
            />
          </g>
        </svg>
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
          {Refined((tweet.full_text || tweet.text || '').replace(/https:\/\/t\.\w+\/\w+$/i, '').trim())}
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

  if (block.type === 'telegram') {
    const telegram = block.data?.telegram?.data?.tg_data;
    if (!telegram) return null;

    return (
      <div className="social" data-anchor={block.anchor || null} ref={postBlockRef}>
        <svg className="social__logo default-no-select" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="linear-gradient" x1="120" y1="240" x2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#1d93d2" />
              <stop offset="1" stopColor="#38b0e3" />
            </linearGradient>
          </defs>
          <title>Telegram_logo</title>
          <circle cx="120" cy="120" r="120" fill="url(#linear-gradient)" />
          <path
            d="M81.229,128.772l14.237,39.406s1.78,3.687,3.686,3.687,30.255-29.492,
            30.255-29.492l31.525-60.89L81.737,118.6Z"
            fill="#c8daea"
          />
          <path d="M100.106,138.878l-2.733,29.046s-1.144,8.9,7.754,0,17.415-15.763,17.415-15.763" fill="#a9c6d8" />
          <path
            d="M81.486,130.178,52.2,120.636s-3.5-1.42-2.373-4.64c.232-.664.7-1.229,2.1-2.2,6.489-4.523,
            120.106-45.36,120.106-45.36s3.208-1.081,5.1-.362a2.766,2.766,0,0,1,1.885,2.055,9.357,9.357,0,0,1,.254,
            2.585c-.009.752-.1,1.449-.169,2.542-.692,11.165-21.4,94.493-21.4,94.493s-1.239,4.876-5.678,
            5.043A8.13,8.13,0,0,1,146.1,172.5c-8.711-7.493-38.819-27.727-45.472-32.177a1.27,1.27,0,0,
            1-.546-.9c-.093-.469.417-1.05.417-1.05s52.426-46.6,53.821-51.492c.108-.379-.3-.566-.848-.4-3.482,
            1.281-63.844,39.4-70.506,43.607A3.21,3.21,0,0,1,81.486,130.178Z"
            fill="#fff"
          />
        </svg>
        <div className="social__user">
          <div className="social__avatar" style={{ backgroundImage: `url(${telegram.author.avatar_url})` }} />
          <a className="social__username" href={telegram.author.url} target="_blank" rel="noopener noreferrer">
            {telegram.author.name}
          </a>
          <a className="social__date" href={telegram.url} target="_blank" rel="noopener noreferrer">
            <span>{DateForPost(telegram.datetime)}</span>
            <i className="material-icons">open_in_new</i>
          </a>
        </div>
        <div className="social__text">{StraightRefined(telegram.text || '')}</div>
        {telegram.photos?.length || telegram.videos?.length ? (
          // eslint-disable-next-line no-bitwise
          (telegram.photos?.length === 1) ^ (telegram.videos?.length === 1) ? (
            <PostBlockSingleMedia block={TelegramMediaToOsnovaMediaBlock(telegram)} />
          ) : (
            <PostBlockGallery block={TelegramMediaToOsnovaMediaBlock(telegram)} />
          )
        ) : null}
      </div>
    );
  }

  if (block.type === 'instagram')
    return (
      <div className="incut" data-anchor={block.anchor || null} ref={postBlockRef}>
        <a href={block.data?.instagram?.data?.box_data?.url} target="_blank" rel="noopener noreferrer">
          Пост в Instagram
        </a>
        <span>
          . Однако API Основы не даёт никаких данных о посте кроме прямой ссылки, API Инстаграма не существует в
          природе, а прикручивать собственный{' '}
          <a href="https://github.com/serguun42/Social-Picker-API" target="_blank" rel="noopener noreferrer">
            Social Picker API
          </a>{' '}
          ради одного типа блока просто лень.
        </span>
      </div>
    );

  if (block.type === 'code')
    return (
      <pre data-anchor={block.anchor || null} ref={postBlockRef}>
        {Refined(block.data.text)}
      </pre>
    );

  if (block.data?.text)
    return (
      <p data-anchor={block.anchor || null} ref={postBlockRef}>
        {Refined(block.data.text)}
      </p>
    );

  return null;
}

PostBlock.propTypes = {
  block: PropTypes.object.isRequired,
};
