const { getCurrentWeek, getWeekDeadline } = require('../components/weekCalculator');

describe('Week Calculator', () => {
    let originalDate;

    beforeEach(() => {
        originalDate = global.Date;
    });

    afterEach(() => {
        global.Date = originalDate;
    });

    test('getCurrentWeek returns correct week number', () => {
        const mockDate = new Date('2024-01-08');
        global.Date = jest.fn(() => mockDate);

        const result = getCurrentWeek();
        expect(result.week).toBe(2);
        expect(result.year).toBe(2024);
    });

    test('getWeekDeadline returns correct deadline', () => {
        const testCases = [
            { week: 1, expectedDate: new Date(2024, 0, 7, 23, 59, 59, 999) },
            { week: 2, expectedDate: new Date(2024, 0, 14, 23, 59, 59, 999) },
            { week: 52, expectedDate: new Date(2024, 11, 29, 23, 59, 59, 999) }
        ];

        testCases.forEach(({ week, expectedDate }) => {
            const result = getWeekDeadline(week, 2024);
            expect(result.getTime()).toBe(expectedDate.getTime());
        });
    });

    test('handles year transition correctly', () => {
        // Test week 52 of 2023 vs week 1 of 2024
        const lastWeek2023 = getWeekDeadline(52, 2023);
        const firstWeek2024 = getWeekDeadline(1, 2024);
    
        expect(lastWeek2023 < firstWeek2024).toBe(true);
      });
    
      test('getCurrentWeek handles year transition', () => {
        // Mock Date to December 31st, 2023
        const mockDate = new Date(2023, 11, 31);
        global.Date = jest.fn(() => mockDate);
    
        const result = getCurrentWeek();
        expect(result.year).toBe(2023);
        
        // Mock Date to January 1st, 2024
        global.Date = jest.fn(() => new Date(2024, 0, 1));
        
        const newYearResult = getCurrentWeek();
        expect(newYearResult.year).toBe(2024);
      });
});