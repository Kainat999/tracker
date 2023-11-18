import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [elapsedTimeChunks, setElapsedTimeChunks] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);

        const response = await axios.get('http://localhost:8000/api/dashboard/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.records) {
          setElapsedTimeChunks(response.data.elapsedTimeChunks || []);
          setRecords(response.data.records || []);
        } else {
          console.error('Invalid response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStartStop = async () => {
    const currentTime = Date.now();

    if (isRunning) {
      setIsRunning(false);

      if (startTime !== null) {
        const chunk = currentTime - startTime;

        try {
          await axios.post('http://localhost:8000/api/dashboard/', {
            start_time: startTime.toISOString(),
            end_time: currentTime.toISOString(),
            elapsedTime: chunk,
          });

          const updatedData = {
            elapsedTimeChunks: [...elapsedTimeChunks, chunk],
            records: [...records, { start_time: startTime.toISOString(), end_time: currentTime.toISOString() }],
          };

          setElapsedTimeChunks(updatedData.elapsedTimeChunks);
          setRecords(updatedData.records);
        } catch (error) {
          console.error('Error saving record:', error);
        }
      }

      setStartTime(null);
    } else {
      setStartTime(currentTime - elapsedTime);
      setIsRunning(true);
    }
  };

  const handleReset = async () => {
    try {
      await axios.delete('http://localhost:8000/api/dashboard/');
      setElapsedTimeChunks([]);
      setStartTime(null);
      setElapsedTime(0);
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes % 60).padStart(2, '0');
    const formattedSeconds = String(seconds % 60).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const getTotalTime = () => {
    const totalMilliseconds = elapsedTimeChunks.reduce((total, chunk) => total + chunk, 0);
    return formatTime(totalMilliseconds);
  };

  return (
    <div>
      <h1>Combined Dashboard</h1>
      <div>
        <button onClick={handleStartStop}>{isRunning ? 'Stop' : 'Start'}</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div>
        <p>Elapsed Time: {formatTime(elapsedTime)}</p>
        <ul>
          {(elapsedTimeChunks || []).map((chunk, index) => (
            <li key={index}>Chunk {index + 1}: {formatTime(chunk)}</li>
          ))}
        </ul>
        <p>Total Time: {getTotalTime()}</p>
      </div>
      <div>
        <h2>Tracker Records</h2>
        <ul>
          {(records || []).map((record, index) => (
            <li key={index}>
              Start Time: {record.start_time}, End Time: {record.end_time || 'Not available'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
