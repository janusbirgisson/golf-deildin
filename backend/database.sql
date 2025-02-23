CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  handicap INTEGER NOT NULL
);

CREATE TABLE rounds (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  date_played DATE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  gross_score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL
);

CREATE TABLE weekly_standings (
    id SERIAL PRIMARY KEY,
    week_number INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id),
    round_id INTEGER REFERENCES rounds(id),
    points INTEGER NOT NULL,
    year INTEGER NOT NULL,
    UNIQUE(week_number, user_id, year)
);