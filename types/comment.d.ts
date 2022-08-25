export interface CommentAuthor {
  id: number;
  name: string;
  avatar_url: string;
  type: number;
  is_verified: boolean;
  is_online: boolean;
  online_status_text: string;
}

export interface CommentLikes {
  is_liked: number;
  count: number;
  summ: number;
}

export interface CommentMedium {
  type: number;
  imageUrl: string;
  additionalData: {
    type: string;
    url: string;
    hasAudio: boolean;
  };
  size: {
    width: number;
    height: number;
    ratio: number;
  };
}

export type CommentAttachTypeMedia = import('./post_version').PostMedia;

export type CommentAttachTypeVideo = import('./post_version').PostVideo;

export type CommentAttachTypeTweet = {
  type: 'tweet';
  data: {
    tweet_data: import('./tweet').Tweet;
    tweet_data_encoded: string;
    version: string;
  };
};

export type CommentAttachTypeTelegram = {
  type: 'telegram';
  data: {
    tg_data: import('./telegram_post').TelegramPost;
    tg_data_encoded: string;
  };
};

export type CommentAttachTypeLink = {
  type: 'link';
  data: {
    url: string;
    title: string;
    description: string;
    image?: PostMedia;
    v: 1;
  };
};

export type CommentAttachTypeDefault = {
  type: 'default';
  data: {};
};

export type CommentAttach =
  | CommentAttachTypeMedia
  | CommentAttachTypeVideo
  | CommentAttachTypeTweet
  | CommentAttachTypeTelegram
  | CommentAttachTypeLink
  | CommentAttachTypeDefault;

export interface Comment {
  id: number;
  author: CommentAuthor;
  date: number;
  dateRFC: string;
  isFavorited: boolean;
  date_favorite?: any;
  isEdited: boolean;
  likes: CommentLikes;
  media: CommentMedium[];
  level: number;
  is_pinned: boolean;
  is_ignored: boolean;
  is_removed: boolean;
  replyTo: number;
  text: string;
  text_wo_md: string;
  html: string;
  attaches: CommentAttach[];
  source_id: number;
  entry?: any;
  highlight: string;
  donate?: { count: number };
}

export default Comment;
