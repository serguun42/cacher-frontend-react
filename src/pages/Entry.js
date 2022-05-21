import { useParams } from 'react-router-dom';

export default function Post() {
  /** @type {{ entryId: string }} */
  const { entryId } = useParams();

  return <div className="entry">{entryId}</div>;
}
