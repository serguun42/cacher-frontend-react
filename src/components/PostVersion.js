import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from '../util/html/avatar';
import PostBlock from './PostBlock';
import PostInfoLine from './PostInfoLine';
import './PostVersion.css';

/**
 * @param {{ title: string }} props
 */
function EditorialTitle({ title }) {
  if (!title) return null;
  if (typeof title !== 'string') return null;

  const wordsWithDelimiters = title.trim().split(/(\s)/g);
  const lastWord = wordsWithDelimiters.pop();

  return (
    <>
      {wordsWithDelimiters.join('')}
      <div className="post-version__title__editorial">
        {lastWord}
        <i className="post-version__title__editorial-icon material-icons">done</i>
      </div>
    </>
  );
}

EditorialTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

/**
 * @param {{ postVersion: import("../../types/post_version").PostVersion, showAbout: boolean }} props
 */
export default function PostVersion({ postVersion, showAbout }) {
  return (
    <div className="post-version">
      <PostInfoLine postVersion={postVersion} showAbout={showAbout} />

      {postVersion.title ? (
        <h3 className="post-version__title default-title-font">
          {postVersion.isEditorial ? EditorialTitle({ title: postVersion.title || '' }) : postVersion.title}
        </h3>
      ) : null}

      {postVersion.blocks.map((block, blockIndex) => (
        /**
         * https://reactjs.org/docs/lists-and-keys.html#keys
         * Aka 'last resort', since blocks could be identical (incl. type and payload)
         */
        <PostBlock block={block} key={`block-${block.type}-${blockIndex.toString()}`} />
      ))}

      <div className="post-version__stats">
        <div
          className={`post-version__stats__pos ${
            postVersion.likes?.summ > 0
              ? 'karma--positive'
              : postVersion.likes?.summ < 0
              ? 'karma--negative'
              : 'karma--neutral'
          } default-no-select`}
        >
          <svg
            className="post-version__icon post-version__icon--heart"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              // eslint-disable-next-line max-len
              d="M2.262 7.84c.62-2.258 2.483-4.337 5.614-4.337 1.83 0 3.093.682 3.883 1.13.082.046.163.096.241.146.078-.05.16-.1.24-.147.791-.447 2.055-1.13 3.884-1.13 3.13 0 4.993 2.08 5.614 4.338.598 2.175.17 4.796-1.364 6.71-1.302 1.623-3.068 3.052-4.517 4.056-.735.509-1.42.931-1.971 1.234-.273.15-.535.284-.767.386-.114.05-.247.104-.386.149-.09.03-.38.123-.733.123-.354 0-.642-.094-.732-.123-.14-.045-.273-.1-.387-.15a9.849 9.849 0 01-.767-.385 23.244 23.244 0 01-1.97-1.234c-1.45-1.004-3.216-2.433-4.518-4.057-1.534-1.913-1.962-4.534-1.364-6.71z"
              fill="url(#v_like_active_paint0_linear_889_52799)"
            />
            <defs>
              <linearGradient
                id="v_like_active_paint0_linear_889_52799"
                x1="12"
                y1="3.503"
                x2="12"
                y2="20.498"
                gradientUnits="userSpaceOnUse"
              >
                {postVersion.likes?.summ > 0 ? (
                  <>
                    <stop stopColor="#80FF80" />
                    <stop offset="1" stopColor="#13D213" />
                    <stop offset="1" stopColor="#6DFF6D" />
                  </>
                ) : postVersion.likes?.summ < 0 ? (
                  <>
                    <stop stopColor="#FF8080" />
                    <stop offset="1" stopColor="#D21313" />
                    <stop offset="1" stopColor="#FF6D6D" />
                  </>
                ) : (
                  <>
                    <stop stopColor="#808080" />
                    <stop offset="1" stopColor="#6D6D6D" />
                    <stop offset="1" stopColor="#B2B2B2" />
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>
          <span>{postVersion.likes.summ}</span>
        </div>
        {postVersion.favoritesCount ? (
          <div className="post-version__stats__pos post-version__stats__pos--bookmark default-no-select">
            <svg
              className="post-version__icon post-version__icon--bookmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {/* eslint-disable-next-line max-len */}
              <path d="M4 12.39V7a4 4 0 014-4h8a4 4 0 014 4v12.53c0 1.4-1.618 2.178-2.712 1.305l-1.635-1.305L13 17.412l-.35-.28a1 1 0 00-1.245-.002l-.021.017-.384.304-2.642 2.094-1.65 1.309C5.612 21.722 4 20.942 4 19.545v-7.154z" />
            </svg>
            <span>{postVersion.favoritesCount || 0}</span>
          </div>
        ) : null}
        {postVersion.co_author ? (
          <div className="post-version__stats__pos post-version__stats__pos--coauhor default-no-select">
            <span>
              Спасибо за <strike>на</strike>водку
            </span>
            <Link to={`/entity/${postVersion.co_author.id}`} className="post-version__stats__entity">
              <div
                className="post-version__stats__entity__avatar"
                style={{ backgroundImage: Avatar(postVersion.co_author.avatar_url) }}
              />
              <span className="post-version__stats__entity__name">{postVersion.co_author.name}</span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

PostVersion.propTypes = {
  postVersion: PropTypes.object.isRequired,
  showAbout: PropTypes.bool,
};

PostVersion.defaultProps = {
  showAbout: false,
};
