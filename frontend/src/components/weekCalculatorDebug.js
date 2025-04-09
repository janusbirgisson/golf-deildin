import { getCurrentWeek, getWeekDeadline, isBeforeDeadline } from './weekCalculator';

function simulateDate(dateString) {
    const RealDate = Date;
    const mockDate = new Date(dateString);
    
    class MockDate extends RealDate {
        constructor(...args) {
            if (args.length) {
                return new RealDate(...args);
            }
            return new RealDate(mockDate);
        }

        getDay() { return mockDate.getDay(); }
        getDate() { return mockDate.getDate(); }
        getMonth() { return mockDate.getMonth(); }
        getFullYear() { return mockDate.getFullYear(); }
        getHours() { return mockDate.getHours(); }
        getMinutes() { return mockDate.getMinutes(); }
        getSeconds() { return mockDate.getSeconds(); }
        getMilliseconds() { return mockDate.getMilliseconds(); }
        getTime() { return mockDate.getTime(); }
        toISOString() { return mockDate.toISOString(); }
        toString() { return mockDate.toString(); }
    }

    MockDate.now = () => mockDate.getTime();
    
    global.Date = MockDate;
    
    return () => {
        global.Date = RealDate;
    };
}

function runDebugScenarios() {
    console.log('Running week calculator debug scenarios...\n');

    console.log('=== Start of Year ===');
    let cleanup = simulateDate('2024-01-01');
    console.log('January 1st:', getCurrentWeek());
    cleanup();

    console.log('\n=== Mid Year ===');
    cleanup = simulateDate('2024-06-15');
    console.log('June 15th:', getCurrentWeek());
    cleanup();

    console.log('\n=== End of Year ===');
    cleanup = simulateDate('2024-12-31');
    console.log('December 31st:', getCurrentWeek());
    cleanup();

    console.log('\n=== Deadline Calculation ===');
    cleanup = simulateDate('2024-03-15');
    const currentWeek = getCurrentWeek();
    const deadline = getWeekDeadline(currentWeek.week, currentWeek.year);
    console.log('Week deadline for March 15th:', deadline);
    cleanup();

    console.log('\n=== Sunday Deadline Edge Cases ===');
    
    cleanup = simulateDate('2024-03-17T23:59:59.998Z');
    console.log('Just before deadline:', {
        currentWeek: getCurrentWeek(),
        deadline: getWeekDeadline(getCurrentWeek().week, getCurrentWeek().year),
        isBeforeDeadline: isBeforeDeadline(new Date())
    });
    cleanup();

    cleanup = simulateDate('2024-03-17T23:59:59.999Z');
    console.log('At deadline:', {
        currentWeek: getCurrentWeek(),
        deadline: getWeekDeadline(getCurrentWeek().week, getCurrentWeek().year),
        isBeforeDeadline: isBeforeDeadline(new Date())
    });
    cleanup();

    cleanup = simulateDate('2024-03-18T00:00:00.000Z');
    console.log('Just after deadline:', {
        currentWeek: getCurrentWeek(),
        deadline: getWeekDeadline(getCurrentWeek().week, getCurrentWeek().year),
        isBeforeDeadline: isBeforeDeadline(new Date())
    });
    cleanup();

    console.log('\n=== Year Transition Edge Cases ===');
    
    cleanup = simulateDate('2023-12-31T23:59:59.999Z');
    console.log('Last day of 2023:', {
        currentWeek: getCurrentWeek(),
        deadline: getWeekDeadline(getCurrentWeek().week, getCurrentWeek().year)
    });
    cleanup();

    cleanup = simulateDate('2024-01-01T00:00:00.000Z');
    console.log('First day of 2024:', {
        currentWeek: getCurrentWeek(),
        deadline: getWeekDeadline(getCurrentWeek().week, getCurrentWeek().year)
    });
    cleanup();
}

runDebugScenarios();

export { simulateDate };