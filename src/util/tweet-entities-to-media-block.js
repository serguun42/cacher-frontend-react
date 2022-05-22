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
  if (anySource.indexOf(process.env.REACT_APP_CDN_DOMAIN) < 0) return anySource;

  const uuid = new URL(anySource).pathname.split('/')?.[1];
  if (TestOsnovaUUID(uuid)) return uuid;

  return anySource;
};

/**
 *
 * @param {import("../../types/tweet").ExtendedEntities} extendedEntities
 * @returns {import("../../types/post_version").PostBlock}
 */
export default function TwitterMediaToOsnovaMediaBlock(extendedEntities) {
  if (!extendedEntities) return null;
  const { media } = extendedEntities;
  if (!media?.length) return null;

  return {
    type: 'media',
    data: {
      items: media
        .map((medium) => {
          if (medium.type === 'photo') {
            const uuid = GeneralSource(medium.media_url_https);

            const bestSize = Object.values(medium.sizes)
              .sort((prev, next) => prev.w - next.w)
              .pop();

            /** @type {import("../../types/post_version").PostBlockItem} */
            const mediaItem = {
              title: '',
              image: {
                type: 'image',
                data: {
                  uuid,
                  width: bestSize.w,
                  height: bestSize.h,
                  type: 'image',
                },
              },
            };

            return mediaItem;
          }

          if (medium.type === 'video' || medium.type === 'animated_gif') {
            if (!medium.video_info?.variants) return null;

            const videoVariant =
              medium.video_info?.variants.sort((prev, next) => prev.bitrate - next.bitrate)?.pop()?.url || '';

            if (!videoVariant) return null;

            const uuid = GeneralSource(videoVariant);

            const bestSize = Object.values(medium.sizes)
              .sort((prev, next) => prev.w - next.w)
              .pop();

            /** @type {import("../../types/post_version").PostBlockItem} */
            const mediaItem = {
              title: '',
              image: {
                type: 'image',
                data: {
                  uuid,
                  width: bestSize.w,
                  height: bestSize.h,
                  type: 'mp4',
                },
              },
            };

            return mediaItem;
          }

          return null;
        })
        .filter(Boolean),
    },
  };
}
