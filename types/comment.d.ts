export interface Author {
  id: number;
  name: string;
  avatar_url: string;
  is_verified: boolean;
  type: number;
  is_online: boolean;
  online_status_text: string;
}

export interface Likes {
  is_liked: number;
  count: number;
  summ: number;
}

export interface AdditionalData {
  type: string;
  url: string;
  hasAudio: boolean;
}

export interface Size {
  width: number;
  height: number;
  ratio: number;
}

export interface Medium {
  type: number;
  imageUrl: string;
  additionalData: AdditionalData;
  size: Size;
}

export interface Data {
  uuid: string;
  width: number;
  height: number;
  size: number;
  type: string;
  color: string;
  hash: string;
  external_service: any[];
}

export interface Attach {
  type: string;
  data: Data;
}

export interface LoadMore {
  count: number;
  ids: any[];
  avatars: any[];
}

export interface EtcControls {
  pin_comment: boolean;
  remove: boolean;
  remove_thread: boolean;
}

export interface Comment {
  id: number;
  author: Author;
  date: number;
  dateRFC: string;
  isFavorited: boolean;
  date_favorite?: any;
  isEdited: boolean;
  likes: Likes;
  media: Medium[];
  level: number;
  is_pinned: boolean;
  is_ignored: boolean;
  is_removed: boolean;
  replyTo: number;
  text: string;
  text_wo_md: string;
  html: string;
  attaches: Attach[];
  source_id: number;
  entry?: any;
  load_more: LoadMore;
  etcControls: EtcControls;
  highlight: string;
  donate?: any;
}

export default Comment;
