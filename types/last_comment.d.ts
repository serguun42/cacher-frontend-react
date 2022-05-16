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

interface Image {
  type: string;
  data: ImageData;
}

interface MediumData {
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
  image: Image;
  v?: number;
}

interface Medium {
  type: string;
  data: MediumData;
}

export interface LastComment {
  date: Date;
  creator: Creator;
  post_id: number;
  comment_id: number;
  reply_to_id: number;
  text: string;
  media: Medium[];
}

export default LastComment;
