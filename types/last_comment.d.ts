interface Creator {
  id: number;
  name: string;
  url: string;
}

interface ImageData {
  uuid: string;
  width: number;
  height: number;
  size: number;
  type: string;
  color: string;
  hash: string;
  external_service: any[];
}

interface LastCommentImage {
  type: string;
  data: ImageData;
}

interface LastCommentMediumData {
  uuid: string;
  width: number;
  height: number;
  size: number;
  type: string;
  color: string;
  hash: string;
  external_service: any[];
  url: string;
  title: string;
  description: string;
  image: LastCommentImage;
  v?: number;
}

interface LastCommentMedium {
  type: string;
  data: LastCommentMediumData;
}

export interface LastComment {
  date: Date;
  creator: Creator;
  post_id: number;
  comment_id: number;
  reply_to_id: number;
  text: string;
  media: LastCommentMedium[];
}

export default LastComment;
