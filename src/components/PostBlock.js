import PropTypes from 'prop-types';
import { useState } from 'react';
import dispatcher from '../util/dispatcher';
import Refined from '../util/html/refined';
import './PostBlock.css';

const IS_SAFARI =
  navigator.userAgent.search('Safari') > -1 &&
  navigator.userAgent.search('Chrome') === -1 &&
  navigator.userAgent.search(/OPR/i) === -1 &&
  navigator.userAgent.search('Edg') === -1 &&
  navigator.userAgent.search('Firefox') === -1;

/**
 * @param {string} uuid
 * @returns {string}
 */
const Media = (uuid) => `https://${process.env.REACT_APP_CDN_DOMAIN}/${uuid}/`;

/**
 * @param {string} uuid
 * @param {number} [size=100]
 * @returns {string}
 */
const Preview = (uuid, size = 100) => `${Media(uuid)}-/preview/${size}/${IS_SAFARI ? '' : '-/format/webp/'}`;

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
          className="video__thumbnail"
          style={{ backgroundImage: `url(${Media(videoData.thumbnail.data.uuid)})` }}
          onClick={() => setVideoRequested(true)}
        />
      )}
    </div>
  );
}

PostBlockVideo.propTypes = {
  block: PropTypes.object.isRequired,
};

/**
 * @param {{ block: import("../../types/post_version").PostBlock }} props
 */
export default function PostBlock({ block }) {
  if (block.type === 'text') return <p>{Refined(block.data.text)}</p>;

  if (block.type === 'header') return <h4>{Refined(block.data.text)}</h4>;

  if (block.type === 'media' && block.data.items)
    if (block.data.items.length === 1) {
      const media = block.data.items[0];

      if (
        media.image.data.type === 'jpg' ||
        media.image.data.type === 'jpeg' ||
        media.image.data.type === 'png' ||
        media.image.data.type === 'webp' ||
        media.image.data.type === 'image'
      )
        return (
          <div className="media-single">
            <img
              className="media-single__img"
              src={Media(media.image.data.uuid)}
              onClick={() => {
                /** @type {import("./MediaViewer").MediaPayload} */
                const mediaViewer = {
                  media: Media(media.image.data.uuid),
                  type: 'photo',
                  width: media.image.data.width,
                  height: media.image.data.height,
                  description: Refined(
                    media.title || media.author
                      ? `${media.title}${media.title && media.author && ' – '}${media.author}`
                      : ''
                  ),
                };

                dispatcher.call('media', mediaViewer);
              }}
            />
            {media.title || media.author ? (
              <div className="media-single__desc">
                {media.title ? <span>{Refined(media.title)}</span> : null}
                {media.author ? <span>{Refined(media.author)}</span> : null}
              </div>
            ) : null}
          </div>
        );

      return (
        <div className="media-single">
          <video className="media-single__vid" src={Media(media.image.data.uuid)} controls />
          {media.title || media.author ? (
            <div className="media-single__desc">
              {media.title ? <span>{Refined(media.title)}</span> : null}
              {media.author ? <span>{Refined(media.author)}</span> : null}
            </div>
          ) : null}
        </div>
      );
    } else {
      return (
        <div
          className="media-container"
          style={{
            width: `calc(var(--media-container-child-size) * ${
              block.data.items.filter((media) => !!media.image).length
            } + 8px * ${block.data.items.filter((media) => !!media.image).length - 1} + 16px)`,
          }}
        >
          {block.data.items.map((media, index) => (
            <div
              className={
                media.image.data.type === 'jpg' ||
                media.image.data.type === 'jpeg' ||
                media.image.data.type === 'png' ||
                media.image.data.type === 'webp' ||
                media.image.data.type === 'image'
                  ? 'media-container__img'
                  : 'media-container__vid'
              }
              style={{ backgroundImage: `url(${Preview(media.image.data.uuid)})` }}
              key={`media-gallery-${media.image.data.uuid}-${index.toString()}`}
              onClick={() => {
                /** @type {import("./MediaViewer").MediaPayload} */
                const mediaViewer = {
                  media: Media(media.image.data.uuid),
                  type: 'photo',
                  width: media.image.data.width,
                  height: media.image.data.height,
                  description: Refined(
                    media.title || media.author
                      ? `${media.title}${media.title && media.author && ' – '}${media.author}`
                      : ''
                  ),
                };

                dispatcher.call('media', mediaViewer);
              }}
            >
              <div className="media-container__child__dummy" />
            </div>
          ))}
        </div>
      );
    }

  if (block.type === 'video' && block.data?.video?.data) return <PostBlockVideo block={block} />;

  if (block.type === 'incut')
    return (
      <div className="incut">
        <div className={block.data.text?.length < 100 ? 'incut__medium' : 'incut__text'}>
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

  if (block.type === 'delimiter') return <div className="delimiter">***</div>;

  if (block.type === 'link' && block.data?.link?.data)
    return (
      <a href={block.data.link.data.url} className="link" target="_blank" rel="noopener noreferrer">
        <div className="link__title">{Refined(block.data.link.data.title)}</div>
        <div className="link__fake-url">{Refined(block.data.link.data.url)}</div>
      </a>
    );

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
        <div className="quiz__title">{Refined(block.data.title)}</div>
        <div className="quiz__subtitle">
          Это, конечно, опрос, но чтобы узнать результаты, мне надо для каждого опроса делать запрос – тогда всё точно
          ляжет. Поэтому без результатов 🤷‍♂️
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

  if (block.type === 'tweet')
    return (
      <div className="incut">
        Тут твит от @${block.data.tweet.data.tweet_data.user.screen_name}, но эмбеды очень много кушоють и вообще
        лагают, шо атас! Поэтому{' '}
        <a
          // eslint-disable-next-line max-len
          href={`https://twitter.com/${block.data.tweet.data.tweet_data.user.screen_name}/status/${block.data.tweet.data.tweet_data.id_str}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          просто прямая ссылка на твит
        </a>
      </div>
    );

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
