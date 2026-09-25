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
            WHERE r.user_id = ${req.params.id}
            ORDER BY r.booking_time DESC
        `;
        const [response] = await db.query(selectQuery);
        res.status(200).json(response);
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
            WHERE r.showtime_id = ${req.params.id}
            ORDER BY r.booking_time DESC
        `;
        const [response] = await db.query(selectQuery);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getSingleReserve = async (req, res) => {
    try {
        const selectQuery = `
            SELECT *
            FROM reservations
            WHERE id = ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        if (response.length === 0) return res.status(404).json({ msg: "The reservation not found ." });
        res.status(200).json(response[0]);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


export const saveReserve = async (req, res) => {
    try {
        if (!req.body.user_id) return res.status(400).json({ msg: "User ID is required." });
        if (!req.body.showtime_id) return res.status(400).json({ msg: "Showtime ID is required." });
        if (!req.body.seat_number) return res.status(400).json({ msg: "Seat number is required." });
        if (!Number.isInteger(Number(req.body.seat_number)) || req.body.seat_number <= 0) return res.status(400).json({ msg: "Seat number is Invalid ." });
        const { user_id, showtime_id, seat_number } = req.body;
        const selectUserQuery = `
            SELECT * 
            FROM users
            WHERE id = ${user_id}
        `;
        const [user] = await db.query(selectUserQuery);
        if (user.length === 0) return res.status(404).json({ msg: "The user not found ." });
        const conn = await db.getConnection();
        await conn.beginTransaction();
        const selectShowtimeQuery = `
            SELECT s.* , m.title AS title , m.image_url AS image_url
            FROM showtimes AS s
            INNER JOIN movies AS m ON s.movie_id = m.id
            WHERE s.id = ${showtime_id}
            FOR UPDATE
        `;
        const [showtime] = await conn.query(selectShowtimeQuery);
        if (showtime.length === 0) {
            await conn.rollback();
            return res.status(404).json({ msg: "The showtime not found ." });
        }
        if (new Date(`${showtime[0].date.toISOString().split("T")[0]}T${showtime[0].start_time}`) < new Date()) {
            await conn.rollback();
            return res.status(409).json({ msg: "Reservation time has expired ." });
        }
        if (showtime[0].available_seats === 0) {
            await conn.rollback();
            return res.status(409).json({ msg: "No available seats for this showtime." });
        }
        const selectReserveQuery = `
            SELECT * 
            FROM reservations
            WHERE showtime_id = ${showtime_id} AND seat_number = ${seat_number}
        `;
        const [reservation] = await conn.query(selectReserveQuery);
        if (reservation.length > 0) {
            await conn.rollback();
            return res.status(409).json({ msg: "This seat is already booked." });
        }
        const insertQuery = `
            INSERT INTO reservations (user_id, showtime_id, seat_number)
            VALUES (${user_id}, ${showtime_id}, ${seat_number} )
        `;
        await conn.query(insertQuery);

        const updateQuery = `
            UPDATE showtimes
                SET available_seats = ${showtime[0].available_seats - 1}
            WHERE id = ${showtime_id}
        `;
        await conn.query(updateQuery);
        await conn.commit();
        try {
            await EmailSender(
                user[0].email,
                showtime[0].title,
                showtime[0].image_url,
                seat_number,
                showtime[0].date.toISOString().split("T")[0],
                showtime[0].start_time
            );
        } catch (emailError) {
            console.log("Email failed:", emailError.message);
        } 
        res.status(201).json({ msg: "Reservation was successful." });
    } catch (err) {
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
        const selectQuery = `
            SELECT *
            FROM reservations
            WHERE id = ${req.params.id}
        `;
        const [reserve] = await db.query(selectQuery);
        if (reserve.length === 0) return res.status(404).json({ msg: "The reserve was not found." });
        const selectShowtimeQuery = `
            SELECT *
            FROM showtimes AS s 
            WHERE s.id = ${reserve[0].showtime_id}
        `;
        const [showtime] = await db.query(selectShowtimeQuery)
        if (new Date(`${showtime[0].date.toISOString().split("T")[0]}T${showtime[0].end_time}`) > new Date())
            return res.status(409).json({ msg: "You can only vote after the movie is over." })
        const selectMovieQuery = `
            SELECT m.* 
            FROM showtimes AS s 
            INNER JOIN movies AS m ON s.movie_id = m.id
            WHERE s.id = ${reserve[0].showtime_id}
        `;
        const [movie] = await db.query(selectMovieQuery)
        let number = Number(movie[0].rating_count);
        const preRating = Number(movie[0].rating);
        let avg = 0
        if (reserve[0].rate == null) {
            avg = ((vote * 1) + (preRating * number)) / (number + 1)
            number = number + 1
        } else {
            avg = ((preRating * number) + (vote - reserve[0].rate)) / number
        }
        const updateReserveQuery = `
            UPDATE reservations
                SET
                    rate = ${vote}
                WHERE id = ${req.params.id}
        `;
        await db.query(updateReserveQuery);
        const updateMovieQuery = `
            UPDATE movies
                SET
                    rating = ${avg},
                    rating_count = ${number}
                WHERE id = ${movie[0].id}
        `;
        await db.query(updateMovieQuery);

        res.status(200).json({ msg: "Your vote has been recorded successfully." });
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}


export const deleteReserve = async (req, res) => {
    try {
        const selectQuery = `
            SELECT s.date AS date 
            FROM reservations AS r INNER JOIN showtimes AS s ON r.showtime_id = s.id
            WHERE r.id = ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        if (response.length === 0) return res.status(404).json({ msg: "Reservation not found ." });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const showDate = new Date(response[0].date);
        showDate.setHours(0, 0, 0, 0);
        if (showDate <= today)
            return res.status(409).json({ msg: "Cannot cancel reservation. Cancellation must be done before the show date." });
        const removeQuery = `
            DELETE FROM reservations
            WHERE id = ${req.params.id}
        `
        await db.query(removeQuery)
        res.status(200).json({ msg: "Reservation deleted successfully." });
    } catch (error) {
        res.status(500).json({ msg: error.message });;
    }
}
