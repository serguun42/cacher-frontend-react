/**
 * @param {string} uuid
 * @returns {boolean}
 */
const TestOsnovaUUID = (uuid) => {
  if (typeof uuid !== 'string') return false;

  return /^[0-9a-f]{32}$/i.test(uuid.replace(/-/g, ''));
};

/**
 * @param {string} anySource
 * @returns {string}
 */
const GeneralSource = (anySource) => {
  if (typeof anySource !== 'string') return anySource;

  if (anySource.indexOf(process.env.REACT_APP_CDN_DOMAIN) < 0) return anySource;

  const uuid = new URL(anySource).pathname.split('/')?.[1];
  if (TestOsnovaUUID(uuid)) return uuid;

  return anySource;
};

/**
 * @typedef {Object} TelegramPostMedia
 * @property {{ width: number, height: number, leonardo_url: string }[]} [photos]
 * @property {{ width: number, height: number, src: string }[]} [videos]
 */
/**
 * @param {TelegramPostMedia} props
 * @returns {import("../../types/post_version").PostBlock}
 */
export default function TelegramMediaToOsnovaMediaBlock({ photos, videos }) {
  /** @type {import("../../types/post_version").PostBlockItem[]} */
  const commonPostBlockItem = [];

  if (Array.isArray(photos))
    photos.forEach((photo) => {
      const uuid = GeneralSource(photo.leonardo_url);

      /** @type {import("../../types/post_version").PostBlockItem} */
      const mediaItem = {
        title: '',
        image: {
          type: 'image',
          data: {
            uuid,
            width: photo.width,
            height: photo.height,
            type: 'image',
          },
        },
      };

      commonPostBlockItem.push(mediaItem);
    });

  if (Array.isArray(videos))
    videos.forEach((video) => {
      const uuid = GeneralSource(video.src);

      /** @type {import("../../types/post_version").PostBlockItem} */
      const mediaItem = {
        title: '',
        image: {
          type: 'image',
          data: {
            uuid,
            width: video.width,
            height: video.height,
            type: 'mp4',
          },
        },
      };

      commonPostBlockItem.push(mediaItem);
    });

  if (commonPostBlockItem.length)
    return {
      type: 'media',
      data: {
        items: commonPostBlockItem,
      },
    };

  return null;
}
