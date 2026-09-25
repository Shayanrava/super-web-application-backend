import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

const db = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false 
  }
});

export default db;
`
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  url VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  genre VARCHAR(255) NOT NULL,
  release_year INT NOT NULL,
  rating NUMERIC(3,1) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  rating_count INT DEFAULT 0,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE showtimes (
  id SERIAL PRIMARY KEY,
  movie_id BIGINT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_seats INT DEFAULT 40,
  price NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  showtime_id INT NOT NULL,
  seat_number INT NOT NULL,
  booking_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  rate NUMERIC(2,1) DEFAULT NULL,
  CONSTRAINT unique_seat UNIQUE (showtime_id, seat_number),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (showtime_id) REFERENCES showtimes (id) ON DELETE CASCADE ON UPDATE CASCADE
);
`