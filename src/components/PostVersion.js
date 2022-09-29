import PropTypes from 'prop-types';
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
            postVersion.likes.summ ? (postVersion.likes.summ > 0 ? 'karma--positive' : 'karma--negative') : ''
          } default-no-select`}
        >
          <span>Оценка поста: {postVersion.likes.summ}</span>
        </div>
        {postVersion.favoritesCount ? (
          <div className="post-version__stats__pos post-version__stats__pos--saved default-no-select">
            <span>Добавили в закладки: {postVersion.favoritesCount || 0}</span>
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
