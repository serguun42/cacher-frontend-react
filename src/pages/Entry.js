import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentsList from '../components/CommentsList';
import Loading from '../components/Loading';
import PostVersion from '../components/PostVersion';
import Ripple from '../components/Ripple';
import Switcher from '../components/Switcher';
import { GetEntry } from '../util/api';
import DateForPost from '../util/date-for-post';
import LogMessageOrError from '../util/log';
import PopupAboutSchedule from '../util/popups/about-schedule';
import './Entry.css';

/**
 * @param {import("../../types/last_comment").LastComment[]} lastComments
 * @returns {import("../../types/comment").Comment[]}
 */
const TransformLastCommentsToRegular = (lastComments) => {
  /** @type {import("../../types/comment").Comment[]} */
  const commentsAscendingOrder = lastComments
    .map(
      /** @returns {import("../../types/comment").Comment} */ (lastComment) => ({
        author: {
          id: lastComment.creator.id,
          name: lastComment.creator.name,
        },
        id: lastComment.comment_id,
        date: Math.round(new Date(lastComment.date).getTime() / 1e3),
        dateRFC: lastComment.date,
        html: lastComment.text.replace(
          /\[@(\d+)\|([^\]]+)\]/g,
          `<a href="https://${process.env.REACT_APP_SITE_LINK}/u/$1" target="_blank" rel="noopener noreferrer">@$2</a>`
        ),
        text: lastComment.text,
        replyTo: lastComment.reply_to_id,
        attaches: lastComment.media,
        media: lastComment.media,
        level: 0,
        likes: null,
      })
    )
    .sort((prev, next) => prev.id - next.id);

  /** @type {import("../../types/comment").Comment[]} */
  const rebuiltComments = [];

  commentsAscendingOrder.forEach((comment) => {
    if (!comment) return;

    const movingComment = comment;

    if (!comment.replyTo) rebuiltComments.push(movingComment);
    else {
      let indexOfParent = rebuiltComments.findIndex((commentToFind) => commentToFind.id === comment.replyTo);
      if (indexOfParent < 0) indexOfParent = commentsAscendingOrder.length - 1;

      movingComment.level = (rebuiltComments[indexOfParent]?.level || 0) + 1;

      rebuiltComments.splice(indexOfParent + 1, 0, movingComment);
    }
  });

  return rebuiltComments;
};

/** Second is not 1000 ms because it's Unix Timestamp */
const SECOND_FROM_API = 1;
const MINUTE = SECOND_FROM_API * 60;
const HOUR = MINUTE * 60;

export default function Entry() {
  /** @type {{ entryId: string }} */
  const { entryId } = useParams();

  const [everFetched, setEverFetched] = useState(false);
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
        entryFromAPI.comments ??= {};

        if (entryFromAPI.commentsVersion !== 'v2') {
          entryFromAPI.commentsVersion = 'v2';
          entryFromAPI.comments = {
            [new Date(entryFromAPI.commentsFetchedDate).getTime()]: entryFromAPI.comments,
          };
        }

        if (entryFromAPI.lastComments)
          entryFromAPI.lastComments = TransformLastCommentsToRegular(entryFromAPI.lastComments);

        setEverFetched(true);
        setEntry(entryFromAPI);

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
      .catch(LogMessageOrError);
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

  return entry.id ? (
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
            key={commentsVersion}
          />
        </div>
      ) : null}
    </>
  ) : (
    <Loading />
  );
}
