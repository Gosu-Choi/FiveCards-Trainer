import { useState, useRef } from 'react';

export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const historyRef = useRef(history);

  const historization = (historydata) => {
    historyRef.current = [...history, historydata];
    setHistory(prevHistory => [...prevHistory, historydata]);
  };

  const historyexport = (number) => {
    return historyRef.current.slice(-number);
  };

  return { historization, historyexport, historyRef };
};