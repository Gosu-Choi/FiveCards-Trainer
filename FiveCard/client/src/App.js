import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import SevenPoker from './SevenPoker';
import Holdem from './Holdem';
import GameSelection from './GameSelection';
import FiveCardsStud from './FiveCardsStud';
import FiveCardsDraw from './FiveCardsDraw';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/GameSelection"
            element={
              <ProtectedRoute>
                <GameSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/FiveCardsStud"
            element={
              <ProtectedRoute>
                <FiveCardsStud />
              </ProtectedRoute>
            }
          />
          <Route
            path="/FiveCardsDraw"
            element={
              <ProtectedRoute>
                <FiveCardsDraw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Holdem"
            element={
              <ProtectedRoute>
                <Holdem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/SevenPoker"
            element={
              <ProtectedRoute>
                <SevenPoker />
              </ProtectedRoute>
            }
          /> 
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;