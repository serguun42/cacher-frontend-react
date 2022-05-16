export type IndexDocType = {
  id: number;
  collection: string;
  date: number;
  title: string;
  intro: string;
  url: string;
  author_id: number;
  author_name: string;
  author_url: string;
  author_avatar_url: string;
  subsite_id: number;
  subsite_name: string;
  subsite_url: string;
  subsite_avatar_url: string;
};

export default IndexDocType;
