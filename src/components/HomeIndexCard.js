import PropTypes from 'prop-types';
import { createRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SlideDown, SlideUp } from '../util/animations';
import GetForm from '../util/get-form';
import Avatar from '../util/html/avatar';
import './HomeIndexCard.css';
import Ripple from './Ripple';

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

/**
 * @param {{ subsite: import("../../types/stats_response").CountBySubsites, todayPostsCount: number }} props
 */
function CountBySubsite({ subsite, todayPostsCount }) {
  return (
    <div className="home-info-card__subsite-chart__row">
      <Link
        to={`/entity/${subsite.id}`}
        className="home-info-card__subsite-chart__row__img"
        style={{ backgroundImage: Avatar(subsite.avatar_url) }}
      />
      <Link
        to={`/entity/${subsite.id}`}
        className="home-info-card__subsite-chart__row__text home-info-card__subsite-chart__row__text--link"
      >
        {subsite.name}
      </Link>
      <div className="home-info-card__subsite-chart__row__line">
        <div
          className="home-info-card__subsite-chart__row__indicator"
          style={{ width: `${(Math.log(subsite.count) / Math.log(todayPostsCount)) * 100}%` }}
        />
      </div>
      <div className="home-info-card__subsite-chart__row__count">{BeautifulCount(subsite.count)}</div>
    </div>
  );
}

CountBySubsite.propTypes = {
  subsite: PropTypes.object.isRequired,
  todayPostsCount: PropTypes.number.isRequired,
};

/**
 * @typedef {Object} HomeIndexCardProps
 * @property {Date} todayDate
 * @property {number} countOfAllPosts
 * @property {number} todayPostsCount
 * @property {number} blogPostsCount
 * @property {number} distinctAuthorsCount
 * @property {import("../../types/stats_response").CountBySubsites} countBySubsites
 */
/**
 * @param {HomeIndexCardProps} props
 */
export default function HomeIndexCard({
  todayDate,
  countOfAllPosts,
  todayPostsCount,
  blogPostsCount,
  distinctAuthorsCount,
  countBySubsites,
}) {
  const [shownMore, setShownMore] = useState(false);
  const moreRef = createRef();

  countBySubsites = countBySubsites.sort((prev, next) => next.count - prev.count);

  return (
    <div className="home-info-card">
      <div className="home-info-card__title default-title-font">
        {process.env.REACT_APP_SITE_IS_ARCHIVED === 'true' ? 'Последний день' : 'Сегодня'} – {todayDate.getDate()}&nbsp;
        {MONTHS_FULL[todayDate.getMonth()]}
      </div>

      <div className="home-info-card__subsite-chart" title="Логарифмическая шкала">
        <div className="home-info-card__subsite-chart__row">
          <i className="home-info-card__subsite-chart__row__img material-icons">today</i>
          <div className="home-info-card__subsite-chart__row__text">
            За день {GetForm(todayPostsCount, ['собран', 'собрано', 'собрано'])}
          </div>
          <div className="home-info-card__subsite-chart__row__line">
            <div className="home-info-card__subsite-chart__row__indicator" style={{ width: '100%' }} />
          </div>
          <div className="home-info-card__subsite-chart__row__count">{BeautifulCount(todayPostsCount)}</div>
          <div className="home-info-card__subsite-chart__row__special">
            {GetForm(todayPostsCount, ['пост', 'поста', 'постов'])}
          </div>
        </div>
        <div className="home-info-card__subsite-chart__row">
          <i className="home-info-card__subsite-chart__row__img material-icons">drive_file_rename_outline</i>
          <div className="home-info-card__subsite-chart__row__text">Блоги</div>
          <div className="home-info-card__subsite-chart__row__line">
            <div
              className="home-info-card__subsite-chart__row__indicator"
              style={{ width: `${(Math.log(blogPostsCount) / Math.log(todayPostsCount)) * 100}%` }}
            />
          </div>
          <div className="home-info-card__subsite-chart__row__count">{BeautifulCount(blogPostsCount)}</div>
          <div className="home-info-card__subsite-chart__row__special">
            {GetForm(blogPostsCount, ['пост', 'поста', 'постов'])}
          </div>
        </div>
        {countBySubsites.slice(0, 5).map((subsite) => (
          <CountBySubsite subsite={subsite} todayPostsCount={todayPostsCount} key={`chart-subsite-id-${subsite.id}`} />
        ))}
        <div className="home-info-card__subsite-chart__more" ref={moreRef}>
          {countBySubsites.slice(5).map((subsite) => (
            <CountBySubsite
              subsite={subsite}
              todayPostsCount={todayPostsCount}
              key={`chart-subsite-id-${subsite.id}`}
            />
          ))}
        </div>
        {countBySubsites.length > 5 ? (
          <div
            className="home-info-card__subsite-chart__switch default-pointer default-no-select"
            onClick={() => {
              if (shownMore) {
                SlideUp(moreRef.current, 400);
                document.documentElement.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              } else SlideDown(moreRef.current, 400, { display: 'block' });

              setShownMore(!shownMore);
            }}
          >
            <div>{shownMore ? 'Свернуть' : 'Развернуть'}</div>
            <i className="material-icons">{shownMore ? 'unfold_less' : 'unfold_more'}</i>
            <Ripple />
          </div>
        ) : null}
      </div>

      <div className="home-info-card__quick-lines">
        <div className="home-info-card__quick-line">
          <i className="material-icons">supervisor_account</i>
          <div>
            {BeautifulCount(distinctAuthorsCount)}&nbsp;
            {GetForm(distinctAuthorsCount, ['активный автор', 'активных автора', 'активных авторов'])} за день
          </div>
        </div>

        <div className="home-info-card__quick-line">
          <i className="material-icons">all_inclusive</i>
          <div>
            Всего в базе – {BeautifulCount(countOfAllPosts)}&nbsp;
            {GetForm(countOfAllPosts, ['пост', 'поста', 'постов'])}
          </div>
        </div>
      </div>
    </div>
  );
}

HomeIndexCard.propTypes = {
  todayDate: PropTypes.object.isRequired,
  countOfAllPosts: PropTypes.number.isRequired,
  todayPostsCount: PropTypes.number.isRequired,
  blogPostsCount: PropTypes.number.isRequired,
  distinctAuthorsCount: PropTypes.number.isRequired,
  countBySubsites: PropTypes.array.isRequired,
};
