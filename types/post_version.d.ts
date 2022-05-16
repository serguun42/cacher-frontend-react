export interface PostAvatar {
  type: string;
  data: PostMedia;
}

export interface PostAuthor {
  id: number;
  url: string;
  name: string;
  type: number;
  avatar: PostAvatar;
  avatar_url: string;
  is_online: boolean;
  is_verified: boolean;
  is_subscribed: boolean;
}

export interface PostBadge {
  type: string;
  text: string;
  background: string;
  color: string;
  border: string;
}

export interface PostCover {
  additionalData: {
    size: number;
    type: string;
    uuid: string;
  };
  size: {
    width: number;
    height: number;
  };
  thumbnailUrl: string;
  type: number;
  url: string;
  size_simple: string;
}

export interface PostLikes {
  is_liked: number;
  count: number;
  summ: number;
  is_hidden: boolean;
}

export interface PostSubsite {
  id: number;
  url: string;
  type: number;
  name: string;
  description: string;
  avatar: PostAvatar;
  avatar_url: string;
  head_cover: string;
  is_verified: boolean;
  is_enable_writing: boolean;
  is_subscribed: boolean;
  is_subscribed_to_new_posts: boolean;
}

export interface PostMedia {
  uuid: string;
  width: number;
  height: number;
  size: number;
  type: string;
  color: string;
  hash: string;
  external_service: any[];
}

export interface PostImage {
  type: string;
  data: PostMedia;
}

export interface PostBlockItem {
  title: string;
  author: string;
  image: PostImage;
}

export interface PostBlockData {
  text: string;
  text_truncated: string;
  items: PostBlockItem[];
  with_background?: boolean;
  with_border?: boolean;
}

export interface PostBlock {
  type: string;
  data: PostBlockData;
  cover: boolean;
  anchor: string;
}

export interface PostVersion {
  id: number;
  url: string;
  author: PostAuthor;
  badges: PostBadge[];
  commentsCount: number;
  commentsSeenCount?: any;
  favoritesCount: number;
  cover: PostCover;
  date: number;
  dateRFC: string;
  date_favorite?: any;
  last_modification_date: number;
  hitsCount: number;
  intro: string;
  introInFeed?: any;
  isEnabledComments: boolean;
  isEnabledLikes: boolean;
  isFavorited: boolean;
  isRepost: boolean;
  likes: PostLikes;
  subsite: PostSubsite;
  similar: any[];
  title: string;
  type: number;
  commentatorsAvatars: string[];
  webviewUrl?: any;
  isPinned: boolean;
  highlight: string;
  blocks: PostBlock[];
  subscribedToTreads: boolean;
  is_show_thanks: boolean;
  is_still_updating: boolean;
  is_filled_by_editors: boolean;
  isEditorial: boolean;
  audioUrl?: any;
  hotness: number;
  commentEditor: {
    enabled: boolean;
  };
  summarize: string;
}

export default PostVersion;
