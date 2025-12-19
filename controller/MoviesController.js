import Movie from "../models/MovieModel.js";
import cloudinary from "../config/Cloudinary.js";


export const getMovies = async (req, res) => {
    try {
        const response = await Movie.findAll();
        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

export const singleMovie = async (req, res) => {

    try {
        const response = await Movie.findOne({
            where: {
                id: req.params.id
            }
        });
        res.json(response);
    } catch (error) {
        res.json({ msg: error.message })
    }
}

export const saveMovie = async (req, res) => {
    try {
        if (!req.body) return res.json({ msg: "Please provide some information about the movie." });
        if (!req.body.title) return res.json({ msg: "Title is required." });
        if (!req.body.description) return res.json({ msg: "Description is required." });
        if (req.body.description.length > 340) return res.json({ msg: `The description length must be less than 340 characters. length of your description is ${req.body.description.length}` });
        if (!req.body.genre) return res.json({ msg: "Genre is required." });
        if (!req.body.releaseYear) return res.json({ msg: "Release year is required." });
        if (!req.files || !req.files.file) return res.json({ msg: "You must select a poster." });

        const { title, description, genre, releaseYear } = req.body;
        const file = req.files.file;
        const fileSize = file.data.length;

        if (fileSize > 5 * 1024 * 1024) return res.json({ msg: "The image size is larger than 5 MB." });

        const dateNow = Date.now().toString();
        const uploadResult = await cloudinary.uploader.upload(
            file.tempFilePath,
            {
                folder: 'movies',
                public_id: dateNow
            }
        );
        if (!uploadResult) return res.json({ msg: "Image upload failed." });
        const optimizeUrl = cloudinary.url(`movies/${dateNow}`, {
            fetch_format: "auto",
            quality: "auto",
        });
        await Movie.create({
            title,
            description,
            genre,
            releaseYear,
            imageUrl: optimizeUrl
        });
        return res.json({ msg: "The movie was added successfully." });
    } catch (err) {
        console.error(err);
        return res.json({ msg: err.message });
    }
}

export const deleteMovie = async (req, res) => {
    try {
        const response = await Movie.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!response) return res.json({ msg: "The movie was not found." });

        const fileName = response.imageUrl.split("/").pop().split("?")[0];
        await cloudinary.uploader.destroy(`movies/${fileName}`);

        const deletedCount = await Movie.destroy({
            where: {
                id: req.params.id
            }
        });
        if (!(deletedCount > 0)) {
            return res.json({ msg: "Failed to delete the movie." });
        }
        res.json({ msg: "The product was deleted successfully ." });
    } catch (error) {
        res.json({ msg: error.message });;
    }
}

export const updateMovie = async (req, res) => {
    try {
        if (req.body) {
            if (req.body.description != null) {
                if (req.body.description.length > 340) return res.json({ msg: `The description length must be less than 340 characters. length of your description is ${req.body.description.length}` });
            }
        }
        const movie = await Movie.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!movie) return res.json({ msg: "The movie was not found." });

        let title = movie.title;
        let description = movie.description;
        let genre = movie.genre;
        let releaseYear = movie.releaseYear;
        let optimizeUrl = movie.imageUrl;

        if (req.body) {
            if (req.body.title == null) {
                title = movie.title
            } else {
                title = req.body.title;
            }

            if (req.body.description == null) {
                description = movie.description
            } else {
                description = req.body.description;
            }

            if (req.body.genre == null) {
                genre = movie.genre
            } else {
                genre = req.body.genre;
            }

            if (!req.body.releaseYear) {
                releaseYear = movie.releaseYear
            } else {
                releaseYear = Number(req.body.releaseYear);
            }
        }
        if (!req.files) {
            optimizeUrl = movie.imageUrl;
        } else {
            const file = req.files.file;
            const fileSize = file.data.length
            if (fileSize > 5000000) return res.json({ msg: "The image size is larger than 5 MB." });

            const fileName = movie.imageUrl.split("/").pop().split("?")[0];
            await cloudinary.uploader.destroy(`movies/${fileName}`);

            const dateNow = Math.round(Date.now());
            const uploadResult = await cloudinary.uploader.upload(
                file.tempFilePath,
                {
                    folder: 'movies',
                    public_id: dateNow
                }
            );

            if (!uploadResult) return res.json({ msg: "Image upload failed." });

            optimizeUrl = cloudinary.url(`movies/${dateNow}`, {
                fetch_format: "auto",
                quality: "auto",
            });
        }
        await Movie.update({
            title: title, description: description, genre: genre, releaseYear: releaseYear, imageUrl: optimizeUrl
        }, {
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The Movie was update successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}


