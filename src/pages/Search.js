import { createRef, useEffect, useState } from 'react';
import { createSearchParams, useLocation, useSearchParams } from 'react-router-dom';
import Chip from '../components/Chip';
import DatePicker from '../components/DatePicker';
import Feed from '../components/Feed';
import InputArea from '../components/InputArea';
import Loading from '../components/Loading';
import Ripple from '../components/Ripple';
import { FadeIn, FadeOut } from '../util/animations';
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

  const [regexFilter, setRegexFilter] = useState(false);
  const [caseSensetiveFilter, setCaseSensetiveFilter] = useState(false);
  const [dateStartFilter, setDateStartFilter] = useState('');
  const [dateEndFilter, setDateEndFilter] = useState('');
  const [dateFilterLabel, setDateFilterLabel] = useState('');

  useEffect(() => {
    setDateFilterLabel(
      !dateStartFilter && !dateEndFilter
        ? 'Указать даты'
        : dateStartFilter && !dateEndFilter
        ? `Искать с ${DateForPost(dateStartFilter, false, true).toLowerCase()}`
        : !dateStartFilter && dateEndFilter
        ? `Искать до ${DateForPost(dateEndFilter, false, true).toLowerCase()}`
        : dateEndFilter === dateStartFilter
        ? `Искать только ${DateForPost(dateStartFilter, false, true).toLowerCase()}`
        : `Искать с ${DateForPost(dateStartFilter, false, true).toLowerCase()} до ${DateForPost(
            dateEndFilter,
            false,
            true
          ).toLowerCase()}`
    );
  }, [dateStartFilter, dateEndFilter]);

  const [notFound, setNotFound] = useState(false);
  const [noAdding, setNoAdding] = useState(true);
  const [loadCounter, setLoadCounter] = useState(0);
  /** @type {[import("../../types/feed_post").FeedPost[]]} */
  const [feedPosts, setFeedPosts] = useState([]);
  const [commentId, setCommentId] = useState(0);

  const [isSmallScreen, setSmallScreen] = useState(window.innerWidth < 500);
  /** @type {import("react").RefObject<HTMLElement>} */
  const allFiltersRef = createRef();
  const [additionalEntityIdFilter, setAdditionalEntityIdFilter] = useState(0);
  const [additionalUrlFilter, setAdditionalUrlFilter] = useState('');

  /**
   * @param {string} newValue
   */
  const SetAdditionalEntityIdFilterWrapper = (newValue) => {
    if (!newValue || typeof newValue !== 'string') {
      setAdditionalEntityIdFilter(0);
      return;
    }

    if (TestUrl(newValue)) {
      const parsedUrl = SafeURL(newValue);
      const match = parsedUrl.pathname.match(/^\/[us]\/(?<userId>\d+)/);
      const additionalEntityIdRaw = match?.groups?.userId || 0;
      if (parseInt(additionalEntityIdRaw)) setAdditionalEntityIdFilter(parseInt(additionalEntityIdRaw));
    } else if (parseInt(newValue)) setAdditionalEntityIdFilter(parseInt(newValue));
  };

  /**
   * @param {string} newValue
   */
  const SetAdditionalUrlFilterWrapper = (newValue) => {
    if (!newValue || typeof newValue !== 'string' || !TestUrl(newValue)) setAdditionalUrlFilter('');
    else setAdditionalUrlFilter(newValue);
  };

  const ShowAllFilters = () => FadeIn(allFiltersRef.current, 400, { display: 'block' });
  const HideAllFilters = () => FadeOut(allFiltersRef.current, 400);

  useEffect(() => {
    /** @param {KeyboardEvent} e */
    const OnKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') HideAllFilters();
    };
    const OnResizeChange = () => setSmallScreen(window.innerWidth < 500);

    window.addEventListener('keydown', OnKeyDown);
    window.addEventListener('resize', OnResizeChange);

    return () => {
      window.removeEventListener('keydown', OnKeyDown);
      window.removeEventListener('resize', OnResizeChange);
    };
  });

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    setUserInput(searchQuery);
    setEntryId(0);
    setEntityId(0);
    setUrl('');
    setText('');
    setRegexFilter(searchParams.has('regex'));
    setCaseSensetiveFilter(searchParams.has('case-sensetive'));
    setDateStartFilter(searchParams.get('date-start'));
    setDateEndFilter(searchParams.get('date-end'));
    setNotFound(false);
    setNoAdding(true);
    setLoadCounter(loadCounter + 1);
    setFeedPosts([]);
    setCommentId(0);
    setAdditionalEntityIdFilter(searchParams.get('additionalEntityId') || 0);
    setAdditionalUrlFilter(searchParams.get('additionalUrl') || '');

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
      setDateStartFilter('');
      setDateEndFilter('');
    } else {
      /**
       * @param {string} date
       * @returns {boolean}
       */
      const CheckDateFormat = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

      /** @type {import("../components/DatePicker").DatePickerPayload} */
      const dateRangeSetterPayload = {
        acceptAction(start, end) {
          if (start) {
            if (!CheckDateFormat(start)) {
              dispatcher.call('message', 'Неверный формат даты 🤷‍♂️');
              setDateStartFilter('');
            } else setDateStartFilter(start);
          } else setDateStartFilter('');

          if (end) {
            if (!CheckDateFormat(end)) {
              dispatcher.call('message', 'Неверный формат даты 🤷‍♂️');
              setDateEndFilter('');
            } else setDateEndFilter(end);
          } else setDateEndFilter('');
        },
        denyAction() {
          setDateStartFilter('');
          setDateEndFilter('');
        },
      };

      dispatcher.call('datePicker', dateRangeSetterPayload);
    }
  };

  const SearchWithParams = () => {
    if (!userInput) return;

    const paramsToApply = {
      q: userInput,
      regex: regexFilter,
      'case-sensetive': caseSensetiveFilter,
      'date-start': dateStartFilter,
      'date-end': dateEndFilter,
      additionalEntityId: additionalEntityIdFilter,
      additionalUrl: additionalUrlFilter,
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
      SearchByUrl({ url, skip: feedPosts.length, 'date-start': dateStartFilter, 'date-end': dateEndFilter })
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
        regex: regexFilter,
        'case-sensetive': caseSensetiveFilter,
        'date-start': dateStartFilter,
        'date-end': dateEndFilter,
        additionalEntityId: additionalEntityIdFilter || null,
        additionalUrl: additionalUrlFilter || null,
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
    <>
      <div className="search">
        <div className="search__card">
          <div className="search__input-line">
            <InputArea
              preset={userInput}
              label="Поиск"
              placeholder="Заголовок, автор, ссылка, т.д."
              setState={setUserInput}
              autofocus={!userInput}
              enterHandler={SearchWithParams}
              key={location.search}
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
              <div className="search__transparent-chip default-pointer default-no-select" onClick={PopupAboutSearch}>
                <i className="material-icons">help_outline</i>
                <div className="search__transparent-chip__label">О поиске</div>
                <Ripple />
              </div>

              {!isSmallScreen && <Chip state={regexFilter} setState={setRegexFilter} label="Регулярные выражения" />}
              {!isSmallScreen && (
                <Chip
                  state={!!dateStartFilter || !!dateEndFilter}
                  setState={SwitchDateRanges}
                  label={dateFilterLabel}
                />
              )}

              <div className="search__transparent-chip default-pointer default-no-select" onClick={ShowAllFilters}>
                <i className="material-icons">filter_alt</i>
                <div className="search__transparent-chip__label">{isSmallScreen ? 'Фильтры' : 'Все фильтры'}</div>
                <Ripple />
              </div>
            </div>
          </div>
        </div>

        {entityId ? (
          <Entity
            entityId={entityId}
            dateStart={dateStartFilter}
            dateEnd={dateEndFilter}
            key={`${entityId}-${loadCounter}`}
          />
        ) : (
          <Feed
            feedPosts={feedPosts}
            callback={() => LoadMorePosts()}
            noAdding={noAdding}
            notFound={notFound}
            commentId={commentId}
          />
        )}

        {isLoading && <Loading />}

        <DatePicker />
      </div>

      <div className="search__all-filters" ref={allFiltersRef}>
        <div className="search__all-filters-obfuscator" onClick={HideAllFilters} />
        <div className="search__all-filters-body">
          <h4 className="default-title-font default-no-select">Все фильтры</h4>

          <div className="search__all-filters__chips">
            <Chip state={regexFilter} setState={setRegexFilter} label="Регулярные выражения" />
            <Chip state={!!dateStartFilter || !!dateEndFilter} setState={SwitchDateRanges} label={dateFilterLabel} />
            <Chip state={caseSensetiveFilter} setState={setCaseSensetiveFilter} label="Чувствительность к регистру" />
          </div>

          <div className="search__all-filters__input">
            <InputArea
              preset={(additionalEntityIdFilter && additionalEntityIdFilter.toString()) || ''}
              label="Ограничить по ID (напр. юзер)"
              placeholder="Не знаешь – оставь пустым"
              setState={SetAdditionalEntityIdFilterWrapper}
              key={location.search}
              noMargin
            />
          </div>

          <div className="search__all-filters__input">
            <InputArea
              preset={additionalUrlFilter}
              label="Ограничить по ссылке (подсайт)"
              placeholder="Не знаешь – оставь пустым"
              setState={SetAdditionalUrlFilterWrapper}
              key={location.search}
              noMargin
            />
          </div>

          <div className="search__transparent-chip default-pointer default-no-select" onClick={HideAllFilters}>
            <i className="material-icons">done</i>
            <div className="search__transparent-chip__label">Применить фильтры</div>
            <Ripple />
          </div>
        </div>
      </div>
    </>
  );
}
