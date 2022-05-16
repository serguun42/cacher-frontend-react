export interface CommentAuthor {
  id: number;
  name: string;
  avatar_url: string;
  is_verified: boolean;
  type: number;
  is_online: boolean;
  online_status_text: string;
}

export interface CommentLikes {
  is_liked: number;
  count: number;
  summ: number;
}

export interface CommentAdditionalData {
  type: string;
  url: string;
  hasAudio: boolean;
}

export interface CommentMediaSize {
  width: number;
  height: number;
  ratio: number;
}

export interface CommentMedium {
  type: number;
  imageUrl: string;
  additionalData: CommentAdditionalData;
  size: CommentMediaSize;
}

export interface CommentAttachData {
  uuid: string;
  width: number;
  height: number;
  size: number;
  type: string;
  color: string;
  hash: string;
  external_service: any[];
}

export interface CommentAttach {
  type: string;
  data: CommentAttachData;
}

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
  donate?: any;
}

export default Comment;
