import { StrictMode } from 'react';
import './App.css';

export default function App() {
  return (
    <StrictMode>
      <div className="app">
        <h1>Hello here in the app!</h1>
        <div>{process.env.REACT_APP_VERSION}</div>
        <pre>{JSON.stringify(process.env, false, '\t')}</pre>
      </div>
    </StrictMode>
  );
}
