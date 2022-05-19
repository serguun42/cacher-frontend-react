import PropTypes from 'prop-types';
import { Component, createRef, StrictMode } from 'react';
import { connect } from 'react-redux';
import Feed from '../components/Feed';
import Loading from '../components/Loading';
import Ripple from '../components/Ripple';
import store from '../store';
import { FeedLastPosts, FeedStats } from '../util/api';
import CreateChart from '../util/create-chart';
import GetForm from '../util/get-form';
import LogMessageOrError from '../util/log';
import { showMessage } from '../util/message';
import { nextTheme } from '../util/theme';
import './Home.css';

const MONTHS_FULL = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

/**
 * @param {number} count
 * @returns {string}
 */
const BeautifulCount = (count) => count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

class Home extends Component {
  constructor(props) {
    super(props);

    this.canvasRef = createRef();
    this.canvasSize =
      window.innerWidth <= 500 ? window.innerWidth - 16 : window.innerWidth <= 700 ? window.innerWidth - 32 : 700;

    this.state = {
      countOfAllPosts: 0,
      todayDate: new Date(),
      todayPostsCount: 0,
      todayBlogPostsCount: 0,
      todayDistinctAuthorsCount: 0,
      /** @type {import("../../types/feed_post").FeedPost[]} */
      feedPosts: [],
    };
  }

  componentDidMount() {
    FeedStats()
      .then((stats) => {
        this.setState({
          countOfAllPosts: stats.countOfAllPosts,
          todayDate: new Date(stats.today.date) || new Date(),
          todayPostsCount: stats.today.count,
          todayBlogPostsCount: stats.today.blogPostsCount,
          todayDistinctAuthorsCount: stats.today.distinctAuthorsCount,
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

    FeedLastPosts(trueNumberOfPostsInFeed || feedPostsFromState.length)
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
    const { countOfAllPosts, todayDate, todayPostsCount, todayBlogPostsCount, todayDistinctAuthorsCount, feedPosts } =
      this.state;

    /** @type {{ theme: import("../util/theme").ThemeObject }} */
    const { theme } = this.props;

    return (
      <StrictMode>
        <h1 className="home__title default-title-font">Cacher {process.env.REACT_APP_SITE_LONG}</h1>

        <div id="home__flex">
          <div className="home__flex__side">
            <canvas id="count-stats-canvas" ref={this.canvasRef} width={this.canvasSize} height={this.canvasSize / 2} />

            {countOfAllPosts ? (
              <div className="home__info-feed">
                <div className="home__info-card">
                  <div className="home__info-card__title default-title-font">
                    Сегодня – {todayDate.getDate()}&nbsp;{MONTHS_FULL[todayDate.getMonth()]}
                  </div>
                  <div className="home__info-card__flex">
                    <div className="home__info-card__flex__line">
                      <i className="material-icons">today</i>
                      <div>
                        {GetForm(todayPostsCount, ['Собран', 'Собрано', 'Собрано'])} {BeautifulCount(todayPostsCount)}
                        &nbsp;{GetForm(todayPostsCount, ['пост', 'поста', 'постов'])}
                      </div>
                    </div>
                    <div className="home__info-card__flex__line">
                      <i className="material-icons">drive_file_rename_outline</i>
                      <div>
                        За день {BeautifulCount(todayBlogPostsCount)}&nbsp;
                        {GetForm(todayBlogPostsCount, ['пост', 'поста', 'постов'])} в блогах
                      </div>
                    </div>
                    <div className="home__info-card__flex__line">
                      <i className="material-icons">supervisor_account</i>
                      <div>
                        {BeautifulCount(todayDistinctAuthorsCount)}&nbsp;
                        {GetForm(todayDistinctAuthorsCount, [
                          'активный автор',
                          'активных автора',
                          'активных авторов',
                        ])}{' '}
                        за&nbsp;день
                      </div>
                    </div>
                    <div className="home__info-card__flex__line">
                      <i className="material-icons">all_inclusive</i>
                      <div>
                        Всего в базе – {BeautifulCount(countOfAllPosts)}&nbsp;
                        {GetForm(countOfAllPosts, ['пост', 'поста', 'постов'])}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="home__action-cards-container">
                  <div
                    className="home__action-card home__action-card--accent default-pointer"
                    onClick={() => store.dispatch(showMessage('Line 152'))}
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
              </div>
            ) : null}
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
              <div
                className={`loader-container ${
                  window.innerWidth > 1600 ? '' : !countOfAllPosts ? 'loader-container--top-overlay' : ''
                } ${window.innerWidth <= 1600 ? '' : !countOfAllPosts ? 'loader-container--left-overlay' : ''}`}
              >
                <Loading />
              </div>
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
