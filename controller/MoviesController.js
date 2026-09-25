import cloudinary from "../config/Cloudinary.js";
import db from "../config/DB.js";


export const getMovies = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * 
            FROM movies
        `;
        const [response] = await db.query(selectQuery);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getSingleMovie = async (req, res) => {

    try {
        const selectQuery = `
            SELECT * 
            FROM movies
            WHERE id = ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        if (response.length === 0) return res.status(404).json({ msg: "Movie not found ." })
        res.status(200).json(response[0]);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const saveMovie = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ msg: "Please provide some information about the movie." });
        if (!req.body.title) return res.status(400).json({ msg: "Title is required." });
        if (!req.body.description) return res.status(400).json({ msg: "Description is required." });
        if (req.body.description.length > 340) return res.status(400).json({ msg: `The description length must be less than 340 characters. length of your description is ${req.body.description.length}` });
        if (!req.body.genre) return res.status(400).json({ msg: "Genre is required." });
        if (!req.body.release_year) return res.status(400).json({ msg: "Release year is required." });
        if (!req.files || !req.files.file) return res.status(400).json({ msg: "You must select a poster." });
        const { title, description, genre, release_year } = req.body;
        const file = req.files.file;
        const fileSize = file.data.length;
        if (fileSize > 5 * 1024 * 1024) return res.status(400).json({ msg: "The image size is larger than 5 MB." });
        const dateNow = Date.now().toString();
        const uploadResult = await cloudinary.uploader.upload(
            file.tempFilePath,
            {
                folder: 'movies',
                public_id: dateNow
            }
        );
        if (!uploadResult) return res.status(500).json({ msg: "Image upload failed." });
        const optimizeUrl = cloudinary.url(`movies/${dateNow}`, {
            fetch_format: "auto",
            quality: "auto",
        });
        const insertQuery = `
            INSERT INTO movies (title, description, genre, release_year, image_url )
            VALUES ("${title}", "${description}", "${genre}", "${release_year}" , "${optimizeUrl}" )
        `;
        await db.query(insertQuery);
        return res.status(201).json({ msg: "The movie was added successfully." });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

export const deleteMovie = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * 
            FROM movies
            WHERE id = ${req.params.id}
        `;
        const [response] = await db.query(selectQuery);
        if (response.length === 0) return res.status(404).json({ msg: "The movie was not found." });
        const fileName = response[0].image_url.split("/").pop().split("?")[0];
        const deleteCloudinaryResponse = await cloudinary.uploader.destroy(`movies/${fileName}`);
        if (deleteCloudinaryResponse.result !== "ok") return res.status(500).json({ msg: "Failed to delete the image from Cloudinary." })
        const removeQuery = `
            DELETE FROM movies 
            WHERE id = ${req.params.id}
        `;
        await db.query(removeQuery);
        res.status(200).json({ msg: "The movie was deleted successfully ." });
    } catch (error) {
        res.status(500).json({ msg: error.message });;
    }
}

export const updateMovie = async (req, res) => {
    try {
        if (req.body) {
            if (req.body.description != null) {
                if (req.body.description.length > 340) return res.status(400).json({ msg: `The description length must be less than 340 characters. length of your description is ${req.body.description.length}` });
            }
        }
        const selectQuery = `
            SELECT * 
            FROM movies
            WHERE id = ${req.params.id}
        `;
        const [movie] = await db.query(selectQuery);
        if (movie.length === 0) return res.status(404).json({ msg: "The movie was not found." });
        const title = req.body && req.body.title || movie[0].title;
        const description = req.body && req.body.description || movie[0].description;
        const genre = req.body && req.body.genre || movie[0].genre;
        const release_year = req.body && req.body.release_year || movie[0].release_year;
        let optimizeUrl = movie[0].image_url
        if (req.files && req.files.file) {
            const file = req.files.file;
            const fileSize = file.data.length
            if (fileSize > 5000000) return res.status(400).json({ msg: "The image size is larger than 5 MB." });
            const fileName = movie[0].image_url.split("/").pop().split("?")[0];
            await cloudinary.uploader.destroy(`movies/${fileName}`);
            const dateNow = Math.round(Date.now());
            const uploadResult = await cloudinary.uploader.upload(
                file.tempFilePath,
                {
                    folder: 'movies',
                    public_id: dateNow
                }
            );
            if (!uploadResult) return res.status(500).json({ msg: "Image upload failed." });
            optimizeUrl = cloudinary.url(`movies/${dateNow}`, {
                fetch_format: "auto",
                quality: "auto",
            });
        }
        const updateQuery = `
                    UPDATE movies
                    SET
                        title = "${title}",
                        description = "${description}",
                        genre = "${genre}",
                        release_year = ${release_year},
                        image_url = "${optimizeUrl}"
                    WHERE id = ${req.params.id}
                `;
        await db.query(updateQuery);
        res.status(200).json({ msg: "The movie was updated successfully." });
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}


