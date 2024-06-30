import React, { useEffect, useState, useRef } from 'react';
import './SevenPoker.css';

function SevenPoker() {
  const canvasRef = useRef(null);
  const [explanations, setExplanations] = useState([]);

  useEffect(() => {
    drawPokerTable();
    setExplanations(Array.from({ length: 4 }, (_, i) => `해설 ${i + 1}`)); // 해설 개수를 변경할 수 있습니다.
  }, []);

  const drawPokerTable = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  };

  return (
    <div className="container">
      <div className="left-box">
        <canvas ref={canvasRef} width="400" height="400">
          {/* {renderBoxes(5)} */}
        </canvas>
      </div>
      <div className="right-box" style={{ gridTemplateRows: `repeat(${explanations.length}, 1fr)` }}>
        {explanations.map((explanation, index) => (
          <div key={index} className="explanation-cell">
            {explanation}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SevenPoker;
