import React, { useState } from 'react';
import { getCurrentWeek, getWeekDeadline } from './weekCalculator';
import { simulateDate } from './weekCalculatorDebug';

function WeekCalculatorDebugger() {
    const [testDate, setTestDate] = useState('2024-03-15');
    const [results, setResults] = useState(null);

    const runTest = () => {
        const cleanup = simulateDate(testDate);
        const currentWeek = getCurrentWeek();
        const deadline = getWeekDeadline(currentWeek.week, currentWeek.year);
        setResults({ currentWeek, deadline });
        cleanup();
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Week Calculator Debugger</h2>
            <input 
                type="date" 
                value={testDate} 
                onChange={(e) => setTestDate(e.target.value)} 
            />
            <button onClick={runTest}>Test Date</button>
            
            {results && (
                <div>
                    <h3>Results:</h3>
                    <p>Week: {results.currentWeek.week}</p>
                    <p>Year: {results.currentWeek.year}</p>
                    <p>Deadline: {results.deadline.toString()}</p>
                </div>
            )}
        </div>
    );
}

export default WeekCalculatorDebugger;