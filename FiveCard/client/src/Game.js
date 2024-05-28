import React, { useEffect, useState } from 'react';

function App() {
  const [number, setNumber] = useState(null);

  useEffect(() => {
    const userNumber = prompt('Please enter a number:');
    if (userNumber !== null) {
      setNumber(userNumber);
      alert('You entered: ' + userNumber);
    } else {
      alert('No number entered. Redirecting to another page.');
      window.location.href = 'https://www.example.com';
    }
  }, []);

  if (number === null) {
    return null; // 아직 숫자를 입력받지 않았으면 아무것도 렌더링하지 않음
  }

  return (
    <div className="container">
      <h1>Welcome to the Number Input Page</h1>
      <p>Your number is: {number}</p>
    </div>
  );
}

export default App;