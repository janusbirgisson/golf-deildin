function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const week = Math.ceil(diff / oneWeek);

    return {
        week: week,
        year: now.getFullYear()
    };
}

function getWeekDeadline(weekNumber, year) {
    const now = new Date();
    const currentDay = now.getDay();
    
    // Calculate days until next Sunday
    const daysUntilSunday = 7 - currentDay;
    
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(23, 59, 59, 999);

    return nextSunday;
}

export { getCurrentWeek, getWeekDeadline };