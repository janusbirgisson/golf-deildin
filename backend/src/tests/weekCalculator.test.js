const { getCurrentWeek, getWeekDeadline, isBeforeDeadline, getWeekNumber } = require('../utils/weekCalculator');

describe('getCurrentWeek', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should return correct ISO week for January 8th, 2024', () => {
        jest.setSystemTime(new Date('2024-01-08'));
        const result = getCurrentWeek();
        expect(result).toEqual({ week: 2, year: 2024 });
    });

    test('should handle year transition correctly (December 31st, 2023)', () => {
        jest.setSystemTime(new Date('2023-12-31'));
        const result = getCurrentWeek();
        expect(result).toEqual({ week: 52, year: 2023 });
    });

    test('should handle leap year correctly (February 29th, 2024)', () => {
        jest.setSystemTime(new Date('2024-02-29'));
        const result = getCurrentWeek();
        expect(result).toEqual({ week: 9, year: 2024 });
    });

    test('should handle January 1st, 2024 correctly', () => {
        jest.setSystemTime(new Date('2024-01-01'));
        const result = getCurrentWeek();
        expect(result).toEqual({ week: 1, year: 2024 });
    });
});

describe('getWeekDeadline', () => {
    test('should return correct deadline for week 1, 2024', () => {
        const deadline = getWeekDeadline(1, 2024);
        expect(deadline.getFullYear()).toBe(2024);
        expect(deadline.getMonth()).toBe(0); // January
        expect(deadline.getDate()).toBe(7); // Sunday
        expect(deadline.getHours()).toBe(23);
        expect(deadline.getMinutes()).toBe(59);
        expect(deadline.getSeconds()).toBe(59);
        expect(deadline.getMilliseconds()).toBe(999);
    });

    test('should return correct deadline for week 52, 2023', () => {
        const deadline = getWeekDeadline(52, 2023);
        expect(deadline.getFullYear()).toBe(2023);
        expect(deadline.getMonth()).toBe(11); // December
        expect(deadline.getDate()).toBe(31); // Sunday
        expect(deadline.getHours()).toBe(23);
        expect(deadline.getMinutes()).toBe(59);
        expect(deadline.getSeconds()).toBe(59);
        expect(deadline.getMilliseconds()).toBe(999);
    });
});

describe('isBeforeDeadline', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should return true when current time is before current week deadline (Monday)', () => {
        // Set current time to Monday of week 2
        jest.setSystemTime(new Date('2024-01-08T00:00:00.000'));
        const result = isBeforeDeadline(new Date());
        expect(result).toBe(true);
    });

    test('should return true when current time is before current week deadline (Sunday)', () => {
        // Set current time to Sunday of week 2, just before deadline
        jest.setSystemTime(new Date('2024-01-14T23:59:59.998'));
        const result = isBeforeDeadline(new Date());
        expect(result).toBe(true);
    });

    test('should return false when current time is at deadline', () => {
        // Set current time to Sunday of week 2, at deadline
        jest.setSystemTime(new Date('2024-01-14T23:59:59.999'));
        const result = isBeforeDeadline(new Date());
        expect(result).toBe(false);
    });

    test('should return true when current time is Monday of next week', () => {
        // Set current time to Monday of week 3 (after week 2's deadline)
        jest.setSystemTime(new Date('2024-01-15T00:00:00.000'));
        const result = isBeforeDeadline(new Date());
        expect(result).toBe(true);  // Should be true because it's before week 3's deadline
    });
});