export interface Entry {
  id: number;
  initial: import('./post_version').PostVersion;
  tenminutes?: import('./post_version').PostVersion;
  onehour?: import('./post_version').PostVersion;
  comments: {
    [commentDataFetch: string]: import('./comment').Comment[];
  };
  commentsVersion: 'v2';
  lastComments?: import('./last_comment').LastComment[];
}

export type EntryGenericType = Entry;

export default EntryGenericType;
