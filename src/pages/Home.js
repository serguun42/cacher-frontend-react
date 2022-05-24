import { useEffect, useState, createRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Feed from '../components/Feed';
import HomeIndexCard from '../components/HomeIndexCard';
import Loading from '../components/Loading';
import Ripple from '../components/Ripple';
import store from '../store';
import { GetFeedLastPosts, GetFeedStats } from '../util/api';
import CreateChart from '../util/create-chart';
import OpenSearch from '../util/open-search';
import LogMessageOrError from '../util/log';
import { nextTheme } from '../store/theme';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  /** @type {import("react").RefObject<HTMLCanvasElement>} */
  const canvasRef = createRef();
  const canvasSize = window.innerWidth <= 800 ? window.innerWidth - 24 : 800 - 12 * 2;

  /** @type {{ theme: import("../store/theme").ThemeObject }} */
  const themeState = useSelector((state) => state.theme);
  const [countOfAllPosts, setCountOfAllPosts] = useState(0);
  const [todayDate, setTodayDate] = useState(new Date());
  const [todayPostsCount, setTodayPostsCount] = useState(0);
  const [todayBlogPostsCount, setTodayBlogPostsCount] = useState(0);
  const [todayDistinctAuthorsCount, setTodayDistinctAuthorsCount] = useState(0);
  /** @type {[import("../../types/stats_response").CountBySubsites]} */
  const [todayCountBySubsites, setTodayCountBySubsites] = useState([]);
  /** @type {[import("../../types/feed_post").FeedPost[]]} */
  const [feedPosts, setFeedPosts] = useState([]);

  /**
   * @param {number} [trueNumberOfPostsInFeed]
   * @returns {void}
   */
  const LoadMoreLastPost = (trueNumberOfPostsInFeed = 0) => {
    GetFeedLastPosts(trueNumberOfPostsInFeed || feedPosts.length)
      .then((feedPostsFromAPI) => {
        setFeedPosts(
          feedPosts
            .concat(feedPostsFromAPI)
            .filter((value, index, array) => index === array.findIndex((comp) => comp.id === value.id))
        );
      })
      .catch(LogMessageOrError);
  };

  useEffect(() => {
    GetFeedStats()
      .then((stats) => {
        setCountOfAllPosts(stats.countOfAllPosts);
        setTodayDate(new Date(stats.today.date) || new Date());
        setTodayPostsCount(stats.today.count);
        setTodayBlogPostsCount(stats.today.blogPostsCount);
        setTodayDistinctAuthorsCount(stats.today.distinctAuthorsCount);
        setTodayCountBySubsites(stats.today.countBySubsites);

        CreateChart(canvasRef?.current?.getContext('2d'), stats);

        return LoadMoreLastPost();
      })
      .catch(LogMessageOrError);
  }, []);

  return (
    <>
      <h1 className="home__title default-title-font">Cacher {process.env.REACT_APP_SITE_LONG}</h1>

      <div id="home__flex">
        <div className="home__flex__side">
          <div className="home__action-cards-container">
            <div
              className="home__action-card home__action-card--accent default-pointer default-no-select"
              onClick={(e) =>
                OpenSearch(e.currentTarget)
                  .then(() => navigate('/search'))
                  .catch(LogMessageOrError)
              }
            >
              <i className="material-icons">search</i>
              <div>Поиск</div>
              <Ripple inheritTextColor />
            </div>
            <div
              className="home__action-card default-pointer default-no-select"
              onClick={() => store.dispatch(nextTheme())}
            >
              <i className="material-icons">{themeState.icon}</i>
              <div>Переключить тему</div>
              <Ripple />
            </div>
          </div>

          {countOfAllPosts ? (
            <HomeIndexCard
              todayDate={todayDate}
              blogPostsCount={todayBlogPostsCount}
              countBySubsites={todayCountBySubsites}
              countOfAllPosts={countOfAllPosts}
              distinctAuthorsCount={todayDistinctAuthorsCount}
              todayPostsCount={todayPostsCount}
            />
          ) : null}

          <canvas id="home__feed-stats-canvas" ref={canvasRef} width={canvasSize} height={canvasSize / 2} />
        </div>

        <div className="home__flex__side">
          {feedPosts.length ? (
            <>
              <h3 className="home__title default-title-font">Последние записи</h3>
              <Feed
                feedPosts={feedPosts}
                callback={(trueNumberOfPostsInFeed) => LoadMoreLastPost(trueNumberOfPostsInFeed)}
              />
            </>
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </>
  );
}
