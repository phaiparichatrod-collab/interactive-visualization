import { useState } from 'react';
import './styles/global.css';
import NetworkPage from './features/Network/NetworkPage';
import TestApollo from './TestApollo.jsx';


function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="app">
      <NetworkPage />
    </div>
  );
}

export default App;
