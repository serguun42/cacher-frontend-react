import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommentsList from '../components/CommentsList';
import Loading from '../components/Loading';
import PostVersion from '../components/PostVersion';
import Ripple from '../components/Ripple';
import Switcher from '../components/Switcher';
import { GetEntry } from '../util/api';
import DateForPost from '../util/date-for-post';
import LogMessageOrError from '../util/log';
import PopupAboutSchedule from '../util/popups/about-schedule';
import TransformEntryComments from '../util/transform-entry-comments';
import './Entry.css';

/** Second is not 1000 ms because it's Unix Timestamp */
const SECOND_FROM_API = 1;
const MINUTE = SECOND_FROM_API * 60;
const HOUR = MINUTE * 60;

export default function Entry() {
  /** @type {{ entryId: string }} */
  const { entryId } = useParams();

  const [everFetched, setEverFetched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  /** @type {[import("../../types/entry").Entry]} */
  const [entry, setEntry] = useState({});

  /** @typedef {"initial" | "tenminutes" | "onehour"} VersionEnum */
  /** @type {[{ title: string, key: VersionEnum }[]]} */
  const [entryVersions, setEntryVersions] = useState([]);
  /** @type {[VersionEnum]} */
  const [postVersion, setPostVersion] = useState('initial');

  /** @type {[{ title: string, key: string }[]]} */
  const [availableCommentsVersions, setAvailableCommentsVersions] = useState([]);
  /** @type {[string]} */
  const [commentsVersion, setCommentsVersion] = useState('');
  const [preselectedCommentsIndex, setPreselectedCommentsIndex] = useState(0);

  useEffect(() => {
    setEverFetched(false);
    setEntry({});
    setEntryVersions([]);
  }, [entryId]);

  const LoadEntryFromAPI = () => {
    GetEntry(entryId)
      .then((entryFromAPI) => {
        TransformEntryComments(entryFromAPI);

        setEntry(entryFromAPI);
        if (!entryFromAPI.initial || entryFromAPI.id === -1) {
          setNotFound(true);
          return;
        }

        /** @type {{ title: string, key: VersionEnum }[]} */
        const entryVersionsToSet = [];
        if (entryFromAPI.initial)
          entryVersionsToSet.push({ title: DateForPost(entryFromAPI.initial.date), key: 'initial' });
        if (entryFromAPI.tenminutes)
          entryVersionsToSet.push({
            title: DateForPost(entryFromAPI.tenminutes.date + MINUTE * 10),
            key: 'tenminutes',
          });
        if (entryFromAPI.onehour)
          entryVersionsToSet.push({ title: DateForPost(entryFromAPI.onehour.date + HOUR), key: 'onehour' });
        setEntryVersions(entryVersionsToSet);

        /** @type {{ title: string, key: string }[]} */
        const availableCommentsVersionsToSet = [
          entryFromAPI.lastComments?.length ? 'last' : '',
          ...Object.keys(entryFromAPI.comments),
        ]
          .filter(Boolean)
          .filter((value, index, array) => index === array.indexOf(value))
          .map((value) => ({
            title: value === 'last' ? '«живые»' : DateForPost(parseInt(value) / 1000),
            key: value,
          }));

        setAvailableCommentsVersions(availableCommentsVersionsToSet);
        const lastIndex = availableCommentsVersionsToSet.length - 1;
        setCommentsVersion(availableCommentsVersionsToSet[lastIndex]?.key);
        setPreselectedCommentsIndex(lastIndex);
      })
      .catch(LogMessageOrError)
      .finally(() => setEverFetched(true));
  };

  useEffect(() => {
    if (!everFetched) LoadEntryFromAPI();
  }, [everFetched]);

  /**
   * @param {VersionEnum} key
   */
  const SwitcherOnPostSelect = (key) => {
    setPostVersion(key);
  };

  /**
   * @param {string} key
   */
  const SwitcherOnCommentsSelect = (key) => {
    setCommentsVersion(key);
  };

  return everFetched ? (
    notFound ? (
      <div className="entry entry--not-found">
        <h3 className="entry--not-found__title default-title-font">Пост не найден!</h3>
        <Link to="/" className="entry--not-found__return">
          На главную
        </Link>
      </div>
    ) : (
      <>
        <div className="entry">
          {entryVersions.length > 1 ? (
            <div className="entry__upper-info">
              <Switcher data={entryVersions} onOptionSelect={SwitcherOnPostSelect} prefix="Версия: " />

              <div className="entry__about default-pointer" onClick={PopupAboutSchedule}>
                <i className="material-icons">help_outline</i>
                <Ripple />
              </div>
            </div>
          ) : null}

          {entry[postVersion] ? (
            <PostVersion postVersion={entry[postVersion]} showAbout={entryVersions.length <= 1} key={postVersion} />
          ) : null}
        </div>
        {availableCommentsVersions.length ? (
          <div className="entry-comments">
            <div className="entry-comments__upper-info">
              <Switcher
                data={availableCommentsVersions}
                onOptionSelect={SwitcherOnCommentsSelect}
                prefix="Комментарии: "
                preselectedIndex={preselectedCommentsIndex}
              />

              <div className="entry__about default-pointer" onClick={PopupAboutSchedule}>
                <i className="material-icons">help_outline</i>
                <Ripple />
              </div>
            </div>

            <CommentsList
              comments={commentsVersion === 'last' ? entry.lastComments : entry.comments[commentsVersion]}
              entryId={entry.id}
              authorId={entry[postVersion].author?.id}
              key={commentsVersion}
            />
          </div>
        ) : null}
      </>
    )
  ) : (
    <Loading />
  );
}
