function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const week = Math.floor(diff / oneWeek);
    
    return {
        week: week + 1,
        year: now.getFullYear()
    };
}

function getWeekDeadline(weekNumber, year) {
    const start = new Date(year, 0, 1);
    const deadline = new Date(start.getTime() + (weekNumber * 7 * 24 * 60 * 60 * 1000));
    deadline.setHours(23, 59, 59, 999);
    return deadline;
}

module.exports = { getCurrentWeek, getWeekDeadline };