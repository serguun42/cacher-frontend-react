import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import MediaViewer from '../components/MediaViewer';
import PostVersion from '../components/PostVersion';
import Ripple from '../components/Ripple';
import Switcher from '../components/Switcher';
import { GetEntry } from '../util/api';
import DateForPost from '../util/date-for-post';
import LogMessageOrError from '../util/log';
import PopupAboutSchedule from '../util/popups/about-schedule';
import './Entry.css';

/** Second is not 1000 ms because it's Unix Timestamp */
const SECOND_FROM_API = 1;
const MINUTE = SECOND_FROM_API * 60;
const HOUR = MINUTE * 60;

export default function Post() {
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

  useEffect(() => {
    setEverFetched(false);
    setEntry({});
    setEntryVersions([]);
  }, [entryId]);

  const LoadEntryFromAPI = () => {
    GetEntry(entryId)
      .then((entryFromAPI) => {
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
      })
      .catch(LogMessageOrError);
  };

  useEffect(() => {
    if (!everFetched) LoadEntryFromAPI();
  }, [everFetched]);

  /**
   * @param {VersionEnum} key
   */
  const SwitcherOnSelect = (key) => {
    setPostVersion(key);
  };

  return entry.id ? (
    <div className="entry">
      {entryVersions.length > 1 ? (
        <div className="entry__upper-info">
          <Switcher data={entryVersions} onOptionSelect={SwitcherOnSelect} prefix="Версия: " />

          <div className="entry__about default-pointer" onClick={PopupAboutSchedule}>
            <i className="material-icons">help</i>
            <Ripple />
          </div>
        </div>
      ) : (
        <div />
      )}
      {entry[postVersion] ? (
        <PostVersion postVersion={entry[postVersion]} showAbout={entryVersions.length <= 1} key={postVersion} />
      ) : null}
      <MediaViewer />
    </div>
  ) : (
    <Loading />
  );
}
