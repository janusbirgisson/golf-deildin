const cron = require('node-cron');
const { pool } = require('../db');  
const { getCurrentWeek, getWeekDeadline } = require('../utils/weekCalculator');

