import PropTypes from 'prop-types';
import PostBlock from './PostBlock';
import PostInfoLine from './PostInfoLine';
import './PostVersion.css';

/**
 * @param {{ postVersion: import("../../types/post_version").PostVersion, showAbout: boolean }} props
 */
export default function PostVersion({ postVersion, showAbout }) {
  return (
    <div className="post-version">
      <PostInfoLine postVersion={postVersion} showAbout={showAbout} />

      {postVersion.title ? (
        <h3 className="post-version__title default-title-font">
          {postVersion.title}
          {postVersion.isEditorial ? <i className="post-version__title__is-editorial material-icons">done</i> : null}
        </h3>
      ) : null}

      {postVersion.blocks.map((block) => (
        <PostBlock block={block} key={`block-${block.type}-${block.data.text || JSON.stringify(block.data.items)}`} />
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
