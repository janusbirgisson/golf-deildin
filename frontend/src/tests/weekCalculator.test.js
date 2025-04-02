import { getCurrentWeek, getWeekDeadline, isBeforeDeadline } from '../components/weekCalculator';
import { setMockDate } from '../setupTests';

describe('Week Calculator', () => {
    beforeEach(() => {
        // Reset to default test date (January 8th, 2024)
        setMockDate('2024-01-08T12:00:00Z');
    });

    describe('getCurrentWeek', () => {
        test('returns correct week number for Monday', () => {
            setMockDate('2024-01-08T12:00:00Z'); // Monday of week 2
            const result = getCurrentWeek();
            expect(result.week).toBe(2);
            expect(result.year).toBe(2024);
        });

        test('returns correct week number for Sunday', () => {
            setMockDate('2024-01-14T12:00:00Z'); // Sunday of week 2
            const result = getCurrentWeek();
            expect(result.week).toBe(2);
            expect(result.year).toBe(2024);
        });

        test('handles year transition correctly', () => {
            // Test December 31st, 2023
            setMockDate('2023-12-31T12:00:00Z');
            const result2023 = getCurrentWeek();
            expect(result2023.week).toBe(52);
            expect(result2023.year).toBe(2023);

            // Test January 1st, 2024
            setMockDate('2024-01-01T12:00:00Z');
            const result2024 = getCurrentWeek();
            expect(result2024.week).toBe(1);
            expect(result2024.year).toBe(2024);
        });
    });

    describe('getWeekDeadline', () => {
        test('returns correct deadline for current week', () => {
            const result = getWeekDeadline(2, 2024);
            expect(result.getTime()).toBe(new Date('2024-01-14T23:59:59.999').getTime());
        });

        test('returns correct deadline for next week', () => {
            const result = getWeekDeadline(3, 2024);
            expect(result.getTime()).toBe(new Date('2024-01-21T23:59:59.999').getTime());
        });

        test('handles year transition deadlines correctly', () => {
            // Week 52 of 2023
            const lastWeek2023 = getWeekDeadline(52, 2023);
            expect(lastWeek2023.getTime()).toBe(new Date('2023-12-31T23:59:59.999').getTime());

            // Week 1 of 2024
            const firstWeek2024 = getWeekDeadline(1, 2024);
            expect(firstWeek2024.getTime()).toBe(new Date('2024-01-07T23:59:59.999').getTime());
        });
    });

    describe('isBeforeDeadline', () => {
        test('allows submissions before current week deadline', () => {
            setMockDate('2024-01-08T12:00:00Z'); // Monday
            const submissionDate = new Date('2024-01-08T12:00:00Z');
            expect(isBeforeDeadline(submissionDate)).toBe(true);
        });

        test('allows submissions at deadline', () => {
            setMockDate('2024-01-14T23:59:59.999Z'); // Sunday at deadline
            const submissionDate = new Date('2024-01-14T23:59:59.999Z');
            expect(isBeforeDeadline(submissionDate)).toBe(false);
        });

        test('allows submissions on Monday of next week', () => {
            setMockDate('2024-01-15T00:00:00Z'); // Monday of week 3
            const submissionDate = new Date('2024-01-15T00:00:00Z');
            expect(isBeforeDeadline(submissionDate)).toBe(true);
        });
    });

    describe('Component-specific use cases', () => {
        describe('DeadlineCountdown scenarios', () => {
            test('shows correct time until current week deadline', () => {
                setMockDate('2024-01-08T12:00:00Z'); // Monday noon
                const { week, year } = getCurrentWeek();
                const deadline = getWeekDeadline(week, year);
                const now = new Date();
                const difference = deadline.getTime() - now.getTime();

                expect(difference).toBeGreaterThan(0);
                expect(Math.floor(difference / (1000 * 60 * 60 * 24))).toBe(6); // 6 days left
            });

            test('shows correct time until next week deadline after current deadline', () => {
                setMockDate('2024-01-15T00:00:00Z'); // Monday of week 3
                const { week, year } = getCurrentWeek();
                const deadline = getWeekDeadline(week, year);
                const now = new Date();
                const difference = deadline.getTime() - now.getTime();

                expect(difference).toBeGreaterThan(0);
                expect(Math.floor(difference / (1000 * 60 * 60 * 24))).toBe(6); // 6 days left
            });
        });

        describe('WeeklyStandings scenarios', () => {
            test('returns correct week/year for API calls', () => {
                setMockDate('2024-01-08T12:00:00Z'); // Monday
                const { week, year } = getCurrentWeek();
                expect(week).toBe(2);
                expect(year).toBe(2024);
            });

            test('handles year transition in standings display', () => {
                // Test December 31st, 2023
                setMockDate('2023-12-31T12:00:00Z');
                const result2023 = getCurrentWeek();
                expect(result2023.week).toBe(52);
                expect(result2023.year).toBe(2023);

                // Test January 1st, 2024
                setMockDate('2024-01-01T12:00:00Z');
                const result2024 = getCurrentWeek();
                expect(result2024.week).toBe(1);
                expect(result2024.year).toBe(2024);
            });
        });
    });
});