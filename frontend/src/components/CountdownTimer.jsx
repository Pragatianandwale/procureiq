import React, { useState, useEffect } from 'react';

function CountdownTimer() {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, color: 'green' });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const marketOpen = new Date();
      marketOpen.setHours(6, 30, 0, 0);

      // If current time is past 6:30 AM, set to next day
      if (now.getHours() > 6 || (now.getHours() === 6 && now.getMinutes() >= 30)) {
        marketOpen.setDate(marketOpen.getDate() + 1);
      }

      const diff = marketOpen - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const totalMinutes = hours * 60 + minutes;

      let color = 'green';
      if (totalMinutes <= 30) {
        color = 'red';
      } else if (totalMinutes <= 60) {
        color = 'yellow';
      }

      setTimeRemaining({ hours, minutes, color });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className={`px-4 py-2 rounded-lg border-2 ${colorClasses[timeRemaining.color]}`}>
      <div className="text-sm font-medium">Bangkok Market Opens In</div>
      <div className="text-2xl font-bold">
        {timeRemaining.hours}h {timeRemaining.minutes}m
      </div>
      <div className="text-xs">6:30 AM IST</div>
    </div>
  );
}

export default CountdownTimer;
