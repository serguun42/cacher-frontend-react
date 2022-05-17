import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="page-404">
      <h1>404 – не найдено!</h1>
      <h2>
        <Link to="/">На главную</Link>
      </h2>
    </div>
  );
}
