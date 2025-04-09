
/**
 * Gets the ISO week number and year for a given date
 * @param {Date} date - The date to calculate the week for
 * @returns {{week: number, year: number}} The ISO week number and year
 */
function getWeekNumber(date) {
    const d = new Date(date);
    
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    
    const yearStart = new Date(d.getFullYear(), 0, 1);
    
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    
    console.log('getWeekNumber:', {
        inputDate: date.toISOString(),
        adjustedDate: d.toISOString(),
        yearStart: yearStart.toISOString(),
        weekNo,
        year: d.getFullYear()
    });
    
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
    const yearStart = new Date(year, 0, 1);
    
    const jan4th = new Date(year, 0, 4);
    const mondayOfWeek1 = new Date(jan4th);
    mondayOfWeek1.setDate(jan4th.getDate() - (jan4th.getDay() || 7) + 1);
    
    const targetDate = new Date(mondayOfWeek1);
    targetDate.setDate(mondayOfWeek1.getDate() + (week - 1) * 7 + 6);
    
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
    const { week, year } = getCurrentWeek();
    
    const deadline = getWeekDeadline(week, year);
    
    return date.getTime() < deadline.getTime();
}

module.exports = {
    getCurrentWeek,
    getWeekDeadline,
    isBeforeDeadline,
    getWeekNumber
};