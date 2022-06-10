import { useEffect, useState } from 'react';
import { createSearchParams, useLocation, useSearchParams } from 'react-router-dom';
import Chip from '../components/Chip';
import DatePicker from '../components/DatePicker';
import Feed from '../components/Feed';
import InputArea from '../components/InputArea';
import Loading from '../components/Loading';
import Ripple from '../components/Ripple';
import { SearchByPostId, SearchByText, SearchByUrl } from '../util/api';
import DateForPost from '../util/date-for-post';
import dispatcher from '../util/dispatcher';
import LogMessageOrError from '../util/log';
import PopupAboutSearch from '../util/popups/about-search';
import SafeURL from '../util/safe-url';
import Entity from './Entity';
import './Search.css';

/**
 * @param {string} urlLike
 * @returns {boolean}
 */
const TestUrl = (urlLike) => {
  if (!urlLike) return false;
  if (typeof urlLike !== 'string' && !(urlLike instanceof URL)) return false;

  try {
    const url = new URL(urlLike);
    return url.href.length > 0;
  } catch (e) {
    return false;
  }
};

export default function Search() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState(searchParams.get('q'));
  const [entryId, setEntryId] = useState(0);
  const [entityId, setEntityId] = useState(0);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [regex, setRegex] = useState(false);
  const [caseSensetive, setCaseSensetive] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [noAdding, setNoAdding] = useState(true);
  const [loadCounter, setLoadCounter] = useState(0);
  /** @type {[import("../../types/feed_post").FeedPost[]]} */
  const [feedPosts, setFeedPosts] = useState([]);
  const [commentId, setCommentId] = useState(0);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    setUserInput(searchQuery);
    setEntryId(0);
    setEntityId(0);
    setUrl('');
    setText('');
    setRegex(searchParams.has('regex'));
    setCaseSensetive(searchParams.has('case-sensetive'));
    setDateStart(searchParams.get('date-start'));
    setDateEnd(searchParams.get('date-end'));
    setNotFound(false);
    setNoAdding(true);
    setLoadCounter(loadCounter + 1);
    setFeedPosts([]);
    setCommentId(0);

    const isNumber = /^\d+$/.test(searchQuery);
    const isUrl = TestUrl(searchQuery);
    const searchingPathParts = isUrl ? SafeURL(searchQuery).pathname.split('/').filter(Boolean) : [];
    const isUserOrLowSubsite = searchingPathParts[0] === 'u' || searchingPathParts[0] === 's';
    const entityIdToSet = isUserOrLowSubsite ? parseInt(searchingPathParts[1]) : null;
    const entryIdToSet = isUserOrLowSubsite
      ? parseInt(searchingPathParts[2])
      : parseInt(searchingPathParts[1]) || parseInt(searchingPathParts[0]);

    if (entryIdToSet || isNumber) setEntryId(entryIdToSet || parseInt(searchQuery));
    else if (entityIdToSet) setEntityId(entityIdToSet);
    else if (isUrl) setUrl(searchQuery);
    else setText(searchQuery);

    if (isUrl) {
      const searchParamsWithCommentId = new URL(searchQuery).searchParams;
      if (searchParamsWithCommentId.get('comment')) setCommentId(parseInt(searchParamsWithCommentId.get('comment')));
    }
  }, [location.search]);

  /**
   * @param {boolean} dateRangesEnabled
   */
  const SwitchDateRanges = (dateRangesEnabled) => {
    if (!dateRangesEnabled) {
      setDateStart('');
      setDateEnd('');
    } else {
      /**
       * @param {string} date
       * @returns {boolean}
       */
      const CheckDateFormat = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

      const PickDateEnd = () => {
        /** @type {import("../components/DatePicker").DatePickerPayload} */
        const dateEndSetterPayload = {
          title: 'Конец диапазона дат',
          acceptAction(date) {
            if (!CheckDateFormat(date)) dispatcher.call('message', 'Неверный формат даты 🤷‍♂️');
            else setDateEnd(date);
          },
          denyAction() {
            setDateEnd('');
          },
        };

        dispatcher.call('datePicker', dateEndSetterPayload);
      };

      const PickDateStart = () => {
        /** @type {import("../components/DatePicker").DatePickerPayload} */
        const dateStartSetterPayload = {
          title: 'Начало диапазона дат',
          acceptAction(date) {
            if (!CheckDateFormat(date)) dispatcher.call('message', 'Неверный формат даты 🤷‍♂️');
            else setDateStart(date);

            setTimeout(() => PickDateEnd(), 450);
          },
          denyAction() {
            setDateStart('');

            setTimeout(() => PickDateEnd(), 450);
          },
        };

        dispatcher.call('datePicker', dateStartSetterPayload);
      };

      PickDateStart();
    }
  };

  const SearchWithParams = () => {
    if (!userInput) return;

    const paramsToApply = {
      q: userInput,
      regex,
      'case-sensetive': caseSensetive,
      'date-start': dateStart,
      'date-end': dateEnd,
    };

    const newSearchParams = createSearchParams();

    Object.keys(paramsToApply).forEach((paramName) => {
      if (paramsToApply[paramName]) newSearchParams.set(paramName, paramsToApply[paramName]);
    });

    setSearchParams(newSearchParams);
  };

  const LoadMorePosts = () => {
    /** Because it handled by <Entity> component */
    if (entityId) return;

    /**
     * @param {import("../../types/feed_post").FeedPost[]} feedPostsFromAPI
     * @returns {Promise<any>}
     */
    const responseHandler = (feedPostsFromAPI) => {
      setNotFound(!feedPostsFromAPI?.length);

      const feedPostsToSet = feedPosts
        .concat(feedPostsFromAPI)
        .filter((value, index, array) => index === array.findIndex((comp) => comp.id === value.id));

      setFeedPosts(feedPostsToSet);
    };

    setIsLoading(true);

    if (entryId)
      SearchByPostId(entryId)
        .then(responseHandler)
        .catch((e) => {
          if (e?.code === 406) dispatcher.call('message', 'Неправильный формат');

          LogMessageOrError(e);
        })
        .finally(() => {
          setIsLoading(false);
          setNoAdding(true);
        });
    else if (url)
      SearchByUrl({ url, skip: feedPosts.length, 'date-start': dateStart, 'date-end': dateEnd })
        .then(responseHandler)
        .catch((e) => {
          if (e?.code === 406) dispatcher.call('message', 'Неправильный формат ссылки 🔗');

          LogMessageOrError(e);
        })
        .finally(() => {
          setIsLoading(false);
          setNoAdding(false);
        });
    else if (text)
      SearchByText({
        text,
        skip: feedPosts.length,
        regex,
        'case-sensetive': caseSensetive,
        'date-start': dateStart,
        'date-end': dateEnd,
      })
        .then(responseHandler)
        .catch((e) => {
          if (e?.code === 406) dispatcher.call('message', 'Слишком короткий запрос 📏');

          LogMessageOrError(e);
        })
        .finally(() => {
          setIsLoading(false);
          setNoAdding(false);
        });
    else {
      setIsLoading(false);
      setNoAdding(true);
    }
  };

  useEffect(() => {
    LoadMorePosts();
  }, [loadCounter]);

  return (
    <div className="search">
      <div className="search__entry-card">
        <div className="search__input-line">
          <InputArea
            preset={userInput}
            label="Поиск"
            setState={setUserInput}
            autofocus={!userInput}
            enterHandler={SearchWithParams}
            key={location}
            noMargin
          />
          <button
            type="button"
            className={`search__button ${
              userInput ? 'search__button--active default-pointer' : 'search__button--inactive disabled'
            } default-no-select`}
            onClick={SearchWithParams}
          >
            <div className="search__button__text">Искать</div>
            <div className="material-icons">search</div>
            {userInput && <Ripple inheritTextColor />}
          </button>
        </div>
        <div className="search__switch-line default-scroll-transparent">
          <div className="search__switch-line__wrapper">
            <div className="search__about default-pointer default-no-select" onClick={PopupAboutSearch}>
              <i className="material-icons">help_outline</i>
              <div className="search__about__label">О поиске</div>
              <Ripple />
            </div>

            <Chip state={regex} setState={setRegex} label="Регулярные выражения" />
            <Chip state={caseSensetive} setState={setCaseSensetive} label="Чувствительность к регистру" />
            <Chip
              state={!!dateStart || !!dateEnd}
              setState={SwitchDateRanges}
              label={
                !dateStart && !dateEnd
                  ? 'Выбрать даты'
                  : dateStart && !dateEnd
                  ? `Искать с ${DateForPost(dateStart, false, true).toLowerCase()}`
                  : !dateStart && dateEnd
                  ? `Искать до ${DateForPost(dateEnd, false, true).toLowerCase()}`
                  : `Искать с ${DateForPost(dateStart, false, true).toLowerCase()} до ${DateForPost(
                      dateEnd,
                      false,
                      true
                    ).toLowerCase()}`
              }
            />
          </div>
        </div>
      </div>

      {entityId ? (
        <Entity entityId={entityId} dateStart={dateStart} dateEnd={dateEnd} key={`${entityId}-${loadCounter}`} />
      ) : (
        <Feed
          feedPosts={feedPosts}
          callback={() => LoadMorePosts()}
          noAdding={noAdding}
          notFound={notFound}
          commentId={commentId}
        />
      )}

      {isLoading ? <Loading /> : null}

      <DatePicker />
    </div>
  );
}
