import React, { useState, useEffect } from 'react';
import { getCurrentWeek, getWeekDeadline } from './weekCalculator';
import './DeadlineCountdown.css';


function DeadlineCountdown() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        function calculateTimeLeft() {
            const { week, year } = getCurrentWeek();
            const deadline = getWeekDeadline(week, year);
            const now = new Date();
            const difference = deadline - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                const nextWeek = week + 1;
                const nextDeadline = getWeekDeadline(nextWeek, year);
                const newDifference = nextDeadline - now;
                
                setTimeLeft({
                    days: Math.floor(newDifference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((newDifference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((newDifference / 1000 / 60) % 60),
                    seconds: Math.floor((newDifference / 1000) % 60)
                });
            }
        }

        calculateTimeLeft();

        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);


    
    return (
        <div className="deadline-countdown">
            <h3>Tími eftir til að skrá inn skor:</h3>
            <div className="countdown-timer">
                <div className="countdown-segment">
                    <span className="countdown-number">{timeLeft.days}</span>
                    <span className="countdown-label">Dagar</span>
                </div>
                <div className="countdown-segment">
                    <span className="countdown-number">{timeLeft.hours}</span>
                    <span className="countdown-label">Klst.</span>
                </div>
                <div className="countdown-segment">
                    <span className="countdown-number">{timeLeft.minutes}</span>
                    <span className="countdown-label">Mínútur</span>
                </div>
                <div className="countdown-segment">
                    <span className="countdown-number">{timeLeft.seconds}</span>
                    <span className="countdown-label">Sekúndur</span>
                </div>
            </div>
        </div>
    );
}

export default DeadlineCountdown;