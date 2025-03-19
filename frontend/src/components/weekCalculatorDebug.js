import { getCurrentWeek, getWeekDeadline } from './weekCalculator';

// Modified simulation helper that doesn't rely on Jest
function simulateDate(dateString) {
    const RealDate = Date;
    const mockDate = new Date(dateString);
    
    global.Date = class extends RealDate {
        constructor() {
            super();
            return mockDate;
        }
    };
    
    // Return cleanup function
    return () => {
        global.Date = RealDate;
    };
}

// Debug scenarios
function runDebugScenarios() {
    console.log('Running week calculator debug scenarios...');

    // Test scenario 1: Start of year
    let cleanup = simulateDate('2024-01-01');
    console.log('January 1st:', getCurrentWeek());
    cleanup();

    // Test scenario 2: Mid-year
    cleanup = simulateDate('2024-06-15');
    console.log('June 15th:', getCurrentWeek());
    cleanup();

    // Test scenario 3: End of year
    cleanup = simulateDate('2024-12-31');
    console.log('December 31st:', getCurrentWeek());
    cleanup();

    // Test scenario 4: Deadline calculation
    cleanup = simulateDate('2024-03-15');
    const currentWeek = getCurrentWeek();
    const deadline = getWeekDeadline(currentWeek.week, currentWeek.year);
    console.log('Week deadline for March 15th:', deadline);
    cleanup();
}

// Run the debug scenarios
runDebugScenarios();

export { simulateDate }; // Export for use in WeekCalculatorDebugger