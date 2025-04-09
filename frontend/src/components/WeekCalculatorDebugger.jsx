import React, { useState } from 'react';
import { getCurrentWeek, getWeekDeadline, isBeforeDeadline } from './weekCalculator';
import { simulateDate } from './weekCalculatorDebug.js';

function WeekCalculatorDebugger() {
    const [testDate, setTestDate] = useState('2024-03-15');
    const [testTime, setTestTime] = useState('12:00');
    const [results, setResults] = useState(null);

    const runTest = () => {
        const fullDateTime = `${testDate}T${testTime}:00.000Z`;
        const cleanup = simulateDate(fullDateTime);
        
        const currentWeek = getCurrentWeek();
        const deadline = getWeekDeadline(currentWeek.week, currentWeek.year);
        const submissionDate = new Date(fullDateTime);
        
        setResults({
            currentWeek,
            deadline,
            isBeforeDeadline: isBeforeDeadline(submissionDate),
            submissionDate
        });
        
        cleanup();
    };

    const runEdgeCase = (scenario) => {
        let dateTime;
        switch(scenario) {
            case 'beforeDeadline':
                dateTime = '2024-03-17T23:59:59.998Z';
                break;
            case 'atDeadline':
                dateTime = '2024-03-17T23:59:59.999Z';
                break;
            case 'afterDeadline':
                dateTime = '2024-03-18T00:00:00.000Z';
                break;
            case 'yearEnd':
                dateTime = '2023-12-31T23:59:59.999Z';
                break;
            case 'yearStart':
                dateTime = '2024-01-01T00:00:00.000Z';
                break;
        }
        
        const cleanup = simulateDate(dateTime);
        const currentWeek = getCurrentWeek();
        const deadline = getWeekDeadline(currentWeek.week, currentWeek.year);
        const submissionDate = new Date(dateTime);
        
        setResults({
            currentWeek,
            deadline,
            isBeforeDeadline: isBeforeDeadline(submissionDate),
            submissionDate
        });
        
        cleanup();
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Week Calculator Debugger</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Custom Date/Time Test</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="date" 
                        value={testDate} 
                        onChange={(e) => setTestDate(e.target.value)} 
                    />
                    <input 
                        type="time" 
                        value={testTime} 
                        onChange={(e) => setTestTime(e.target.value)} 
                    />
                    <button onClick={runTest}>Test Date/Time</button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Edge Cases</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => runEdgeCase('beforeDeadline')}>Just Before Deadline</button>
                    <button onClick={() => runEdgeCase('atDeadline')}>At Deadline</button>
                    <button onClick={() => runEdgeCase('afterDeadline')}>Just After Deadline</button>
                    <button onClick={() => runEdgeCase('yearEnd')}>Year End</button>
                    <button onClick={() => runEdgeCase('yearStart')}>Year Start</button>
                </div>
            </div>
            
            {results && (
                <div style={{ 
                    border: '1px solid #ccc', 
                    padding: '20px', 
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h3>Results:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px' }}>
                        <strong>Submission Date:</strong>
                        <span>{results.submissionDate.toISOString()}</span>
                        
                        <strong>Current Week:</strong>
                        <span>{results.currentWeek.week}</span>
                        
                        <strong>Current Year:</strong>
                        <span>{results.currentWeek.year}</span>
                        
                        <strong>Week Deadline:</strong>
                        <span>{results.deadline.toISOString()}</span>
                        
                        <strong>Is Before Deadline:</strong>
                        <span style={{ color: results.isBeforeDeadline ? 'green' : 'red' }}>
                            {results.isBeforeDeadline ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WeekCalculatorDebugger;