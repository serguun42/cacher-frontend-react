export type StatsResponse = {
  /* How many post in universe cacher has */
  countOfAllPosts: number;
  /* For graph */
  sizeByDays: {
    /* Date, YYYY-MM-DD format */
    date: string;
    /* Post published at that date */
    count: number;
  }[];
};

export default StatsResponse;
