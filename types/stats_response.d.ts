export type CountBySubsites = {
  /** Subsite id */
  id: number;
  /** Subsite name */
  name: string;
  /** Subsite avatar image url */
  avatar_url: string;
  /** Posts published today in this subsite */
  count: number;
}[];

export type StatsResponse = {
  /** How many post in universe cacher has */
  countOfAllPosts: number;
  /** Special stats for today */
  today: {
    /** Date, YYYY-MM-DD format */
    date: string;
    /** Posts published today */
    count: number;
    /** Posts initially published to blogs today */
    blogPostsCount: number;
    /** Active posters count today */
    distinctAuthorsCount: number;
    /** Posts today by subsites */
    countBySubsites: CountBySubsites;
  };
  /** For graph, does not include last day ('today') */
  sizeByDays: {
    /** Date, YYYY-MM-DD format */
    date: string;
    /** Posts published at that date */
    count: number;
  }[];
};

export default StatsResponse;
