import { Outlet } from 'react-router-dom';
import Footer from './components/Footer';
import ControlUnit from './components/ControlUnit';
import './App.css';

export default function App() {
  return (
    <>
      <div id="app">
        <ControlUnit />
        <div id="content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
}
