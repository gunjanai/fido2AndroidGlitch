import './App.css';
import Login from './components/Login';
import Registration from './components/Registration';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<Login />} />
          <Route path='/register' element={<Registration />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
