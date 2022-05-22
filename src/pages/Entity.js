import { createRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Feed from '../components/Feed';
import Loading from '../components/Loading';
import { SlideDown, SlideUp } from '../util/animations';
import { GetEntityNames, SearchByEntityId } from '../util/api';
import Avatar from '../util/html/avatar';
import LogMessageOrError from '../util/log';
import './Entity.css';

export default function Entity() {
  /** @type {{ entityId: string }} */
  const { entityId } = useParams();
  const [everFetched, setEverFetched] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [lastEntityName, setLastEntityName] = useState('');
  /** @type {[string[]]} */
  const [entityPreviousNames, setEntityPreviousNames] = useState([]);
  const [entityAvatar, setEntityAvatar] = useState('');
  const [lastEntityAvatar, setLastEntityAvatar] = useState('');
  /** @type {[import("../../types/feed_post").FeedPost[]]} */
  const [entityPosts, setEntityPosts] = useState([]);

  const [shownPreviousNames, setShownPreviousNames] = useState(false);
  /** @type {import("react").RefObject<HTMLElement>} */
  const previousNamesRef = createRef();

  const SwitchPreviousNames = () => {
    if (shownPreviousNames) SlideUp(previousNamesRef.current, 400);
    else SlideDown(previousNamesRef.current, 400, { display: 'block' });

    setShownPreviousNames(!shownPreviousNames);
  };

  const [notFound, setNotFound] = useState(false);

  const LoadMorePosts = () => {
    SearchByEntityId({ entityId, skip: entityPosts.length })
      .then((entityPostsFromAPI) => {
        if (!entityPostsFromAPI?.length) setNotFound(true);

        const entityPostsToSet = entityPosts
          .concat(entityPostsFromAPI)
          .filter((value, index, array) => index === array.findIndex((comp) => comp.id === value.id));

        const entityNameToSet =
          entityPostsToSet[0]?.subsite.id === parseInt(entityId)
            ? entityPostsToSet[0]?.subsite?.name
            : entityPostsToSet[0]?.author?.name;
        const entityAvatarToSet =
          entityPostsToSet[0]?.subsite.id === parseInt(entityId)
            ? entityPostsToSet[0]?.subsite?.avatar_url
            : entityPostsToSet[0]?.author?.avatar_url;

        setEntityName(entityNameToSet);
        setEntityAvatar(entityAvatarToSet);
        setEntityPosts(entityPostsToSet);

        setEverFetched(true);
      })
      .catch(LogMessageOrError);
  };

  const GetPreviousNames = () => {
    return GetEntityNames(entityId).then((entityNamesAndAvatars) => {
      if (!lastEntityName) setLastEntityName(entityNamesAndAvatars.names[entityNamesAndAvatars.names.length - 1]);
      if (!lastEntityAvatar && entityNamesAndAvatars.last_avatar)
        setLastEntityAvatar(entityNamesAndAvatars.last_avatar);

      setEntityPreviousNames(entityNamesAndAvatars.names);
    });
  };

  useEffect(() => {
    setEverFetched(false);
    setEntityName('');
    setEntityAvatar('');
    setEntityPosts([]);
    setEntityPreviousNames([]);
    setShownPreviousNames(false);
    setNotFound(false);
  }, [entityId]);

  useEffect(() => {
    if (!everFetched) {
      LoadMorePosts();
      GetPreviousNames();
    }
  }, [everFetched]);

  return (
    <>
      <div className="entity">
        {entityName || lastEntityName ? (
          <div className="entity__entry-card">
            <div className="entity__entry-card__primary">
              {entityAvatar || lastEntityAvatar ? (
                <div
                  className="entity__entry-card__avatar"
                  style={{ backgroundImage: Avatar(entityAvatar || lastEntityAvatar) }}
                />
              ) : null}
              <div className="entity__entry-card__texts">
                <a
                  className="entity__entry-card__title default-title-font"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://${process.env.REACT_APP_SITE_LINK}/u/${entityId}`}
                >
                  <div>{entityName || lastEntityName}</div>
                  <i className="material-icons">open_in_new</i>
                </a>
                {entityPreviousNames.length > 1 ? (
                  <div
                    className="entity__entry-card__show-previous-names default-pointer"
                    onClick={() => SwitchPreviousNames()}
                  >
                    {shownPreviousNames ? 'Спрятать ники' : 'Показать все ники'}
                    <i className="material-icons">{shownPreviousNames ? 'unfold_less' : 'unfold_more'}</i>
                  </div>
                ) : null}
              </div>
            </div>
            {entityPreviousNames.length > 1 ? (
              <div
                className="entity__entry-card__previous-names default-pointer"
                ref={previousNamesRef}
                onClick={() => SwitchPreviousNames()}
              >
                <ul>
                  {entityPreviousNames.map((previousName) => (
                    <li key={`entity-${entityId}-previous-name-${previousName}`}>{previousName}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <Feed feedPosts={entityPosts} callback={() => LoadMorePosts()} noAdding={!everFetched} notFound={notFound} />
      </div>
      {!everFetched ? <Loading /> : null}
    </>
  );
}
