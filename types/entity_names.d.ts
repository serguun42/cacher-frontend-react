export type EntityNamesAndAvatarsResponse = {
  /** User or subsite id */
  id: number;
  /** Previous names from Names Cacher. Can be empty */
  names: string[];
  /** Last avatar from Names Cacher (if present) */
  last_avatar?: string;
}

export default EntityNamesAndAvatarsResponse;
