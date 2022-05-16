export default interface StatsResponse {
  /* How many post in universe cacher has */
  countOfAllPosts: number;
  /* For graph */
  sizeByDays: {
    /* Date, YYYY-MM-DD format */
    name: string;
    /* Post published at that date */
    count: number;
  }[]
}
