import mysql from "mysql2/promise";

const db = await mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQLPORT),
});

export default db;

// mysql -h shortline.proxy.rlwy.net -u root -p  --port 18971 --protocol=TCP railway
// RSWpjuMBaqZvqhwmnjAuoUTFwWqexriO

`
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(30) NOT NULL,
  birth_date DATE NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  url VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (id),
  UNIQUE KEY username_unique (username),
  UNIQUE KEY email_unique (email)
);

CREATE TABLE movies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  genre VARCHAR(255) NOT NULL,
  release_year INT NOT NULL,
  rating DECIMAL(3,1) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  rating_count INT UNSIGNED DEFAULT 0,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE showtimes (
  id INT NOT NULL AUTO_INCREMENT,
  movie_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_seats INT UNSIGNED DEFAULT 40,
  price DECIMAL(4,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (movie_id)
    REFERENCES movies (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ;

CREATE TABLE reservations (
  id INT NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  showtime_id INT NOT NULL,
  seat_number INT NOT NULL,
  booking_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  rate DECIMAL(2,1) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_seat (showtime_id, seat_number),
  FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (showtime_id) REFERENCES showtimes (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ;

`