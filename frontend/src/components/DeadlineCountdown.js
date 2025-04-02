import React, { useState, useEffect } from 'react';
import { getCurrentWeek, getWeekDeadline } from './weekCalculator';

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
        <div className="max-w-7xl mx-auto p-6 bg-secondary rounded-lg shadow-md">
            <div className="w-full flex justify-center mb-2">
                <h2 className="text-3xl font-medium text-white">
                    Tími eftir til að skrá inn skor:
                </h2>
            </div>
            <div className="flex justify-center items-center space-x-8">
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-medium text-accent">{timeLeft.days}</span>
                    <span className="text-sm text-neutral">Dagar</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-medium text-accent">{timeLeft.hours}</span>
                    <span className="text-sm text-neutral">Klst.</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-medium text-accent">{timeLeft.minutes}</span>
                    <span className="text-sm text-neutral">Mínútur</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-medium text-accent">{timeLeft.seconds}</span>
                    <span className="text-sm text-neutral">Sekúndur</span>
                </div>
            </div>
        </div>
    );
}

export default DeadlineCountdown;