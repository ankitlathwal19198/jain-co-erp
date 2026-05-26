"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPeriod = addPeriod;
exports.startOfUtcDay = startOfUtcDay;
exports.diffInDays = diffInDays;
function addPeriod(date, frequency, count = 1) {
    const d = new Date(date);
    switch (frequency) {
        case 'daily':
            d.setUTCDate(d.getUTCDate() + count);
            return d;
        case 'weekly':
            d.setUTCDate(d.getUTCDate() + 7 * count);
            return d;
        case 'monthly':
            d.setUTCMonth(d.getUTCMonth() + count);
            return d;
        case 'quarterly':
            d.setUTCMonth(d.getUTCMonth() + 3 * count);
            return d;
        case 'yearly':
            d.setUTCFullYear(d.getUTCFullYear() + count);
            return d;
        case 'none':
        default:
            return d;
    }
}
function startOfUtcDay(date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
function diffInDays(later, earlier) {
    const ms = startOfUtcDay(later).getTime() - startOfUtcDay(earlier).getTime();
    return Math.floor(ms / (24 * 60 * 60 * 1000));
}
//# sourceMappingURL=recurrence.util.js.map