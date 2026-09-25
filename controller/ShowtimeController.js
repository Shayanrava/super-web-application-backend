import db from "../config/DB.js";


export const getShowTimes = async (req, res) => {
    try {
        const selectQuery = `
            SELECT s.* , m.title AS title , m.description AS description ,m.genre AS genre , m.release_year AS release_year ,
            m.rating AS rating ,m.rating_count AS rating_count , m.image_url AS image_url
            FROM showtimes AS s INNER JOIN movies AS m ON m.id = s.movie_id 
            WHERE s.date > NOW()
            ORDER BY s.date DESC, s.id DESC
        `;
        const [response] = await db.query(selectQuery);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getSingleShowTime = async (req, res) => {
    try {
        const selectQuery = `
            SELECT s.* , m.title AS title , m.description AS description ,m.genre AS genre , m.release_year AS release_year ,
            m.rating AS rating ,m.rating_count AS rating_count , m.image_url AS image_url
            FROM showtimes AS s INNER JOIN movies AS m ON m.id = s.movie_id 
            WHERE s.id = ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        if (!response.length)
            return res.status(404).json({ msg: "Showtime not found" });
        res.status(200).json(response[0]);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const saveShowTime = async (req, res) => {
    try {
        if (!req.body.movie_id) return res.status(400).json({ msg: "movie ID is required." });
        const selectMovieQuery = `
            SELECT *
            FROM movies
            WHERE id = ${req.body.movie_id}
        `;
        const [movie] = await db.query(selectMovieQuery);
        if (movie.length === 0) return res.status(404).json({ msg: "this Movie does't exist." });
        if (!req.body.date) return res.status(400).json({ msg: "Date is required." });
        if (isNaN(new Date(req.body.date))) return res.status(400).json({ msg: "Invalid date." });
        if (new Date(req.body.date) < new Date()) return res.json({ msg: "Date can't be in past ." });
        if (!req.body.start_time) return res.status(400).json({ msg: "Start time is required." });
        if (isNaN(new Date(`${req.body.date}T${req.body.start_time}`))) return res.status(400).json({ msg: "Invalid start time." });
        if (!req.body.end_time) return res.status(400).json({ msg: "End time is required." });
        if (isNaN(new Date(`${req.body.date}T${req.body.end_time}`))) return res.status(400).json({ msg: "Invalid end time." });
        if (new Date(`${req.body.date}T${req.body.start_time}`) >= new Date(`${req.body.date}T${req.body.end_time}`))
            return res.status(400).json({ msg: "Start time must be earlier than end time." });
        if (!req.body.price) return res.status(400).json({ msg: "Price is required." });
        if (Number(req.body.price) <= 0) return res.status(400).json({ msg: "Price must be more than 0" })
        const movie_id = req.body.movie_id;
        const date = req.body.date;
        const start_time = req.body.start_time;
        const end_time = req.body.end_time;
        const price = req.body.price;
        const insertQuery = `
            INSERT INTO showtimes (movie_id, date, start_time, end_time, price )
            VALUES (${movie_id}, "${date}", "${start_time}", "${end_time}" , ${price} )
        `;
        await db.query(insertQuery);
        res.status(201).json({ msg: "The showtime was added successfully." });
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

export const updateShowTime = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ msg: "Please provide some information about the showtime ." })

        const selectQuery = `
        SELECT *
        FROM showtimes
        WHERE id = ${req.params.id}
        `;
        const [showtime] = await db.query(selectQuery);
        if (showtime.length === 0) return res.status(404).json({ msg: "The showtime was not found." });
        const movie_id = req.body.movie_id || showtime[0].movie_id;
        const date = req.body.date || showtime[0].date;
        const start_time = req.body.start_time || showtime[0].start_time;
        const end_time = req.body.end_time || showtime[0].end_time;
        const price = req.body.price || showtime[0].price;
        const selectMovieQuery = `
            SELECT * 
            FROM movies
             WHERE id = ${movie_id} 
        `;
        const [movie] = await db.query(selectMovieQuery);
        if (movie.length === 0) return res.status(404).json({ msg: "Movie not found ." });
        if (isNaN(new Date(date))) return res.status(400).json({ msg: "Invalid date." });
        if (new Date(date) < new Date()) return res.status(400).json({ msg: "Date can't be in past ." });
        if (isNaN(new Date(`${date.toISOString().split("T")[0]}T${start_time}`))) return res.status(400).json({ msg: "Invalid start time." });
        if (isNaN(new Date(`${date.toISOString().split("T")[0]}T${end_time}`))) return res.status(400).json({ msg: "Invalid end time." });
        if (new Date(`${date.toISOString().split("T")[0]}T${start_time}`) >= new Date(`${date.toISOString().split("T")[0]}T${end_time}`))
            return res.status(400).json({ msg: "Start time must be earlier than end time." });
        if (price <= 0) return res.status(400).json({ msg: "Price must be more than 0" });
        const updateQuery = `
                    UPDATE showtimes
                    SET
                        movie_id = ${movie_id},
                        date = "${date}",
                        start_time = "${start_time}",
                        end_time = "${end_time}",
                        price = ${price}
                    WHERE id = ${req.params.id}
                `;
        await db.query(updateQuery);
        res.status(200).json({ msg: "The showtime was updated successfully." });
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

export const deleteShowTime = async (req, res) => {
    try {
        const selectQuery = `
        SELECT *
        FROM showtimes
        WHERE id = ${req.params.id}
        `;
        const [showtime] = await db.query(selectQuery);
        if (showtime.length === 0) return res.status(404).json({ msg: "The showtime was not found." });
        const removeQuery = `
            DELETE FROM showtimes 
            WHERE id = ${req.params.id}
        `;
        await db.query(removeQuery);
        res.status(200).json({ msg: "The showtime was deleted successfully ." });
    } catch (error) {
        res.status(500).json({ msg: error.message });;
    }
}