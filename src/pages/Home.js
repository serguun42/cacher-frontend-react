import PropTypes from 'prop-types';
import { Component, createRef, StrictMode } from 'react';
import { connect } from 'react-redux';
import Feed from '../components/Feed';
import HomeIndexCard from '../components/HomeIndexCard';
import Loading from '../components/Loading';
import Ripple from '../components/Ripple';
import store from '../store';
import { GetFeedLastPosts, GetFeedStats } from '../util/api';
import CreateChart from '../util/create-chart';
import dispatcher from '../util/dispatcher';
import LogMessageOrError from '../util/log';
import { nextTheme } from '../util/theme';
import './Home.css';

class Home extends Component {
  constructor(props) {
    super(props);

    this.canvasRef = createRef();
    this.canvasSize = window.innerWidth <= 800 ? window.innerWidth - 24 : 800 - 12 * 2;

    this.state = {
      countOfAllPosts: 0,
      todayDate: new Date(),
      todayPostsCount: 0,
      todayBlogPostsCount: 0,
      todayDistinctAuthorsCount: 0,
      /** @type {import("../../types/stats_response").CountBySubsites} */
      todayCountBySubsites: [],
      /** @type {import("../../types/feed_post").FeedPost[]} */
      feedPosts: [],
    };
  }

  componentDidMount() {
    GetFeedStats()
      .then((stats) => {
        this.setState({
          countOfAllPosts: stats.countOfAllPosts,
          todayDate: new Date(stats.today.date) || new Date(),
          todayPostsCount: stats.today.count,
          todayBlogPostsCount: stats.today.blogPostsCount,
          todayDistinctAuthorsCount: stats.today.distinctAuthorsCount,
          todayCountBySubsites: stats.today.countBySubsites,
        });

        CreateChart(this.canvasRef?.current?.getContext('2d'), stats);

        return this.loadMoreLastPost();
      })
      .catch(LogMessageOrError);
  }

  /**
   * @param {number} [trueNumberOfPostsInFeed]
   * @returns {void}
   */
  loadMoreLastPost(trueNumberOfPostsInFeed = 0) {
    const { feedPosts: feedPostsFromState } = this.state;

    GetFeedLastPosts(trueNumberOfPostsInFeed || feedPostsFromState.length)
      .then((feedPostsFromAPI) => {
        this.setState({
          feedPosts: feedPostsFromState
            .concat(feedPostsFromAPI)
            .filter((value, index, array) => index === array.findIndex((comp) => comp.id === value.id)),
        });
      })
      .catch(LogMessageOrError);
  }

  render() {
    const {
      countOfAllPosts,
      todayDate,
      todayPostsCount,
      todayBlogPostsCount,
      todayDistinctAuthorsCount,
      todayCountBySubsites,
      feedPosts,
    } = this.state;

    /** @type {{ theme: import("../util/theme").ThemeObject }} */
    const { theme } = this.props;

    return (
      <StrictMode>
        <h1 className="home__title default-title-font">Cacher {process.env.REACT_APP_SITE_LONG}</h1>

        <div id="home__flex">
          <div className="home__flex__side">
            <div className="home__action-cards-container">
              <div
                className="home__action-card home__action-card--accent default-pointer"
                onClick={() => dispatcher.call('message', 'search!!!')}
              >
                <i className="material-icons">search</i>
                <div>Поиск</div>
                <Ripple inheritTextColor />
              </div>
              <div className="home__action-card default-pointer" onClick={() => store.dispatch(nextTheme())}>
                <i className="material-icons">{theme.icon}</i>
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

            <canvas
              id="home__feed-stats-canvas"
              ref={this.canvasRef}
              width={this.canvasSize}
              height={this.canvasSize / 2}
            />
          </div>

          <div className="home__flex__side">
            {feedPosts.length ? (
              <>
                <h3 className="home__title default-title-font">Последние записи</h3>
                <Feed
                  feedPosts={feedPosts}
                  callback={(trueNumberOfPostsInFeed) => this.loadMoreLastPost(trueNumberOfPostsInFeed)}
                />
              </>
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </StrictMode>
    );
  }
}

Home.propTypes = {
  theme: PropTypes.object.isRequired,
};

export default connect((state) => ({ theme: state.theme }))(Home);
