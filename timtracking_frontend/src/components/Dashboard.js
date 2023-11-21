import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dashboard.css';

function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [elapsedTimeChunks, setElapsedTimeChunks] = useState([]);
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);



  const fetchData = async (time_period) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);

      const response = await axios.get('http://localhost:8000/api/dashboard/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.records) {
        setUser(response.data.user);
        setElapsedTimeChunks(response.data.elapsedTimeChunks || []);
        setRecords(response.data.records || []);
      } else {
        console.error('Invalid response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {

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
          const token = localStorage.getItem('token');
          
          await axios.post('http://localhost:8000/api/dashboard/', {
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(currentTime).toISOString(),
            elapsedTime: chunk,
            user: user.id,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const updatedData = {
            elapsedTimeChunks: [...elapsedTimeChunks, chunk],
            records: [...records, { start_time: new Date(startTime).toISOString(), end_time: new Date(currentTime).toISOString() }],
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
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:8000/api/dashboard/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  const formatDateTime = (dateTimeString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };
  

  const getTotalTime = () => {
    const totalMilliseconds = elapsedTime + elapsedTimeChunks.reduce((total, chunk) => total + chunk, 0);
    return totalMilliseconds;
  };  

  const handleTimePeriodClick = (time_period) => {
    fetchData(time_period)
  }

  return (
    <div className="dashboard-container">
      <h1>Combined Dashboard</h1>
      <div className="dashboard-controls">
        <button onClick={handleStartStop} className={`control-button ${isRunning ? 'stop' : 'start'}`}>
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button onClick={handleReset} className="control-button reset">
          Reset
        </button>
      </div>
      <div className="dashboard-timer">
        <p><b>Elapsed Time:</b> {formatTime(elapsedTime)}</p>
        <ul>
          {(elapsedTimeChunks || []).map((chunk, index) => (
            <li key={index}><b>Chunk</b>  {index + 1}: {chunk}</li>
          ))}
        </ul>
        <p><b>Total Time:</b>  {getTotalTime()}</p>
      </div>
      <div className="dashboard-records">
          <h2>Tracker Records</h2>
          <div className="dashboard-controls">
            <button onClick={() => handleTimePeriodClick('day')} className="control-button">
              Day
            </button>
            <button onClick={() => handleTimePeriodClick('week')} className="control-button">
              Week
            </button>
            <button onClick={() => handleTimePeriodClick('month')} className="control-button">
              Month
            </button>
          </div>
          <table className="records-table">
            <thead>
              <tr>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {(records || []).map((record, index) => (
              <tr key={index}>
                <td>{formatDateTime(record.start_time)}</td>
                <td>{record.end_time ? formatDateTime(record.end_time) : 'Not available'}</td>
              </tr>
              ))}
            </tbody>
          </table>
      </div>


    </div>
  );
}
export default Dashboard;




