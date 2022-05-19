export type FeedPost = {
  id: number;
  date: number;
  title: string;
  intro: string;
  url: string;
  author: {
    id: number;
    name: string;
    url: string;
    avatar_url: string;
  };
  subsite: {
    id: number;
    name: string;
    url: string;
    avatar_url: string;
  };
};
