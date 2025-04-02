// weekCalculator.js (both frontend and backend)
/**
 * Gets the ISO week number and year for a given date
 * @param {Date} date - The date to calculate the week for
 * @returns {{week: number, year: number}} The ISO week number and year
 */
function getWeekNumber(date) {
    // Copy date to avoid modifying the original
    const d = new Date(date);
    
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    
    // Get first day of year
    const yearStart = new Date(d.getFullYear(), 0, 1);
    
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    
    console.log('getWeekNumber:', {
        inputDate: date.toISOString(),
        adjustedDate: d.toISOString(),
        yearStart: yearStart.toISOString(),
        weekNo,
        year: d.getFullYear()
    });
    
    // Return week number and year
    return {
        week: weekNo,
        year: d.getFullYear()
    };
}

/**
 * Gets the deadline for a given ISO week and year
 * @param {number} week - The ISO week number
 * @param {number} year - The year
 * @returns {Date} The deadline date (Sunday 23:59:59.999)
 */
function getWeekDeadline(week, year) {
    // Get January 1st of the year
    const yearStart = new Date(year, 0, 1);
    
    // Find the Monday of week 01 (the Monday before or on January 4th)
    const jan4th = new Date(year, 0, 4);
    const mondayOfWeek1 = new Date(jan4th);
    mondayOfWeek1.setDate(jan4th.getDate() - (jan4th.getDay() || 7) + 1);
    
    // Calculate the target Sunday (week * 7 days from Monday of week 01)
    const targetDate = new Date(mondayOfWeek1);
    targetDate.setDate(mondayOfWeek1.getDate() + (week - 1) * 7 + 6); // Add 6 to get to Sunday
    
    // Set time to 23:59:59.999
    targetDate.setHours(23, 59, 59, 999);
    
    console.log('getWeekDeadline:', {
        week,
        year,
        yearStart: yearStart.toISOString(),
        jan4th: jan4th.toISOString(),
        mondayOfWeek1: mondayOfWeek1.toISOString(),
        targetDate: targetDate.toISOString()
    });
    
    return targetDate;
}

/**
 * Gets the current ISO week number and year
 * @returns {{week: number, year: number}} The current ISO week number and year
 */
function getCurrentWeek() {
    return getWeekNumber(new Date());
}

/**
 * Checks if a given date is before the current week's deadline
 * This allows submissions until the end of the current week
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is before the current week's deadline
 */
function isBeforeDeadline(date) {
    // Get the current week
    const { week, year } = getCurrentWeek();
    
    // Get the current week's deadline
    const deadline = getWeekDeadline(week, year);
    
    // Return true if the date is before the current week's deadline
    return date.getTime() < deadline.getTime();
}

module.exports = {
    getCurrentWeek,
    getWeekDeadline,
    isBeforeDeadline,
    getWeekNumber
};