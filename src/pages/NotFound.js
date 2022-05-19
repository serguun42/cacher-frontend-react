import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1 className="default-title-font">404 – не найдено!</h1>
      <Link to="/" className="not-found__return">
        На главную
      </Link>
    </div>
  );
}
