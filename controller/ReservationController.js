import db from "../config/DB.js";
import { EmailSender } from "../config/Email.js";

export const getReserveByUserID = async (req, res) => {
    try {
        const selectQuery = `
            SELECT r.* ,
            s.date AS date ,s.start_time AS start_time , s.end_time AS end_time , s.price AS price,
            m.title AS title , m.description AS description ,m.genre AS genre , m.release_year AS release_year ,
            m.rating AS rating ,m.rating_count AS rating_count , m.image_url AS image_url
            FROM reservations AS r
            INNER JOIN showtimes AS s ON r.showtime_id = s.id 
            INNER JOIN movies AS m ON m.id = s.movie_id 
            WHERE r.user_id = $1
            ORDER BY r.booking_time DESC
        `;
        const response = await db.query(selectQuery, [req.params.id]);
        res.status(200).json(response.rows);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getReserveByShowtimeID = async (req, res) => {
    try {
        const selectQuery = `
            SELECT r.* ,
            s.date AS date ,s.start_time AS start_time , s.end_time AS end_time , s.price AS price,
            m.title AS title , m.description AS description ,m.genre AS genre , m.release_year AS release_year ,
            m.rating AS rating ,m.rating_count AS rating_count , m.image_url AS image_url
            FROM reservations AS r INNER JOIN showtimes AS s ON r.showtime_id = s.id INNER JOIN movies AS m ON m.id = s.movie_id 
            WHERE r.showtime_id = $1
            ORDER BY r.booking_time DESC
        `;
        const response = await db.query(selectQuery, [req.params.id]);
        res.status(200).json(response.rows);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getSingleReserve = async (req, res) => {
    try {
        const selectQuery = `
            SELECT *
            FROM reservations
            WHERE id = $1
        `;
        const response = await db.query(selectQuery, [req.params.id]);
        if (response.rows.length === 0) return res.status(404).json({ msg: "The reservation not found ." });
        res.status(200).json(response.rows[0]);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const saveReserve = async (req, res) => {
    const client = await db.connect(); // گرفتن کلاینت برای مدیریت تراکنش در pg
    try {
        if (!req.body.user_id) return res.status(400).json({ msg: "User ID is required." });
        if (!req.body.showtime_id) return res.status(400).json({ msg: "Showtime ID is required." });
        if (!req.body.seat_number) return res.status(400).json({ msg: "Seat number is required." });
        if (!Number.isInteger(Number(req.body.seat_number)) || req.body.seat_number <= 0) return res.status(400).json({ msg: "Seat number is Invalid ." });

        const { user_id, showtime_id, seat_number } = req.body;

        const selectUserQuery = `SELECT * FROM users WHERE id = $1`;
        const userResult = await client.query(selectUserQuery, [user_id]);
        if (userResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ msg: "The user not found ." });
        }

        await client.query('BEGIN');

        const selectShowtimeQuery = `
            SELECT s.* , m.title AS title , m.image_url AS image_url
            FROM showtimes AS s
            INNER JOIN movies AS m ON s.movie_id = m.id
            WHERE s.id = $1
            FOR UPDATE
        `;
        const showtimeResult = await client.query(selectShowtimeQuery, [showtime_id]);
        if (showtimeResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ msg: "The showtime not found ." });
        }

        const showtime = showtimeResult.rows[0];
        if (new Date(`${showtime.date.toISOString().split("T")[0]}T${showtime.start_time}`) < new Date()) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(409).json({ msg: "Reservation time has expired ." });
        }

        if (showtime.available_seats === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(409).json({ msg: "No available seats for this showtime." });
        }

        const selectReserveQuery = `
            SELECT * 
            FROM reservations
            WHERE showtime_id = $1 AND seat_number = $2
        `;
        const reservationResult = await client.query(selectReserveQuery, [showtime_id, seat_number]);
        if (reservationResult.rows.length > 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(409).json({ msg: "This seat is already booked." });
        }

        const insertQuery = `
            INSERT INTO reservations (user_id, showtime_id, seat_number)
            VALUES ($1, $2, $3)
        `;
        await client.query(insertQuery, [user_id, showtime_id, seat_number]);

        const updateQuery = `
            UPDATE showtimes
                SET available_seats = $1
            WHERE id = $2
        `;
        await client.query(updateQuery, [showtime.available_seats - 1, showtime_id]);

        await client.query('COMMIT');
        client.release();

        try {
            await EmailSender(
                userResult.rows[0].email,
                showtime.title,
                showtime.image_url,
                seat_number,
                showtime.date.toISOString().split("T")[0],
                showtime.start_time
            );
        } catch (emailError) {
            console.error("Email failed explicitly in controller:", emailError);
        }

        res.status(201).json({ msg: "Reservation was successful." });
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackErr) { }
        client.release();
        res.status(500).json({ msg: err.message });
    }
}

export const updateVote = async (req, res) => {
    try {
        if (!req.body.vote) return res.status(400).json({ msg: "Please get your vote" });
        let vote = Number(req.body.vote);
        if (isNaN(vote)) return res.status(400).json({ msg: "Vote must be a number." });
        vote = Number(vote.toFixed(1));
        if (vote > 5 || vote < 0) return res.status(400).json({ msg: "Your vote must be between 0 and 5." });

        const selectQuery = `SELECT * FROM reservations WHERE id = $1`;
        const reserveResult = await db.query(selectQuery, [req.params.id]);
        if (reserveResult.rows.length === 0) return res.status(404).json({ msg: "The reserve was not found." });

        const reserve = reserveResult.rows[0];
        const selectShowtimeQuery = `SELECT * FROM showtimes AS s WHERE s.id = $1`;
        const showtimeResult = await db.query(selectShowtimeQuery, [reserve.showtime_id]);

        if (new Date(`${showtimeResult.rows[0].date.toISOString().split("T")[0]}T${showtimeResult.rows[0].end_time}`) > new Date())
            return res.status(409).json({ msg: "You can only vote after the movie is over." });

        const selectMovieQuery = `
            SELECT m.* 
            FROM showtimes AS s 
            INNER JOIN movies AS m ON s.movie_id = m.id
            WHERE s.id = $1
        `;
        const movieResult = await db.query(selectMovieQuery, [reserve.showtime_id]);
        const movie = movieResult.rows[0];

        let number = Number(movie.rating_count);
        const preRating = Number(movie.rating);
        let avg = 0;

        if (reserve.rate == null) {
            avg = ((vote * 1) + (preRating * number)) / (number + 1);
            number = number + 1;
        } else {
            avg = ((preRating * number) + (vote - reserve.rate)) / number;
        }

        const updateReserveQuery = `
            UPDATE reservations
                SET rate = $1
            WHERE id = $2
        `;
        await db.query(updateReserveQuery, [vote, req.params.id]);

        const updateMovieQuery = `
            UPDATE movies
                SET rating = $1, rating_count = $2
            WHERE id = $3
        `;
        await db.query(updateMovieQuery, [avg, number, movie.id]);

        res.status(200).json({ msg: "Your vote has been recorded successfully." });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

export const deleteReserve = async (req, res) => {
    try {
        const selectQuery = `
            SELECT s.date AS date 
            FROM reservations AS r INNER JOIN showtimes AS s ON r.showtime_id = s.id
            WHERE r.id = $1
        `;
        const response = await db.query(selectQuery, [req.params.id]);
        if (response.rows.length === 0) return res.status(404).json({ msg: "Reservation not found ." });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const showDate = new Date(response.rows[0].date);
        showDate.setHours(0, 0, 0, 0);

        if (showDate <= today)
            return res.status(409).json({ msg: "Cannot cancel reservation. Cancellation must be done before the show date." });

        const removeQuery = `DELETE FROM reservations WHERE id = $1`;
        await db.query(removeQuery, [req.params.id]);

        res.status(200).json({ msg: "Reservation deleted successfully." });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}