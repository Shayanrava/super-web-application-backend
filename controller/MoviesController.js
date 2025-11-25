import Movie from "../models/MovieModel.js";
import path from "path";
import fs from 'fs';

const PUBLIC_DOMAIN = "super-web-application-backend-production.up.railway.app";

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
    if (!req.body) return res.json({ msg: "Please provide some information about the movie." });
    if (!req.body.title) return res.json({ msg: "Title is required." });
    if (!req.body.description) return res.json({ msg: "Description is required." });
    if(req.body.description.length > 340) return res.json({ msg: "The description length must be less than 340 characters." });
    if (!req.body.genre) return res.json({ msg: "Genre is required." });
    if (!req.body.releaseYear) return res.json({ msg: "Release year is required." });
    if (!req.files || !req.files.file) return res.json({ msg: "You must select a poster." });

    const { title, description, genre, releaseYear } = req.body;

    const file = req.files.file;
    const fileSize = file.data.length
    const ext = path.extname(file.name);
    const dateNow = Math.round(Date.now());
    const fileName = dateNow + ext;
    // const imageUrl = `http://localhost:12793/images/${fileName}`;
    const imageUrl = `https://${PUBLIC_DOMAIN}/images/${fileName}`;

    if (fileSize > 5000000) return res.json({ msg: "The image size is larger than 5 MB." });
    file.mv(`./public/images/${fileName}`, async (err) => {
        if (err) return res.json({ msg: err.message })
        try {
            await Movie.create({ title: title, description: description, genre: genre, releaseYear: releaseYear, imageUrl: imageUrl });
            res.json({ msg: "The movie was added successfully." });
        } catch (err) {
            res.json({ msg: err.message })
        }
    })
}

export const deleteMovie = async (req, res) => {

    const response = await Movie.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!response) return res.json({ msg: "The movie was not found." });

    try {
        const deletedCount = await Movie.destroy({
            where: {
                id: req.params.id
            }
        });
        if (!(deletedCount > 0)) {
            return res.json({ msg: "Failed to delete the movie." });
        }
        const filePath = path.join('./public/images', path.basename(response.imageUrl));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.json({ msg: "The product was deleted successfully ." });
    } catch (error) {
        res.json({ msg: error.message });;
    }
}



export const updateMovie = async (req, res) => {

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
    let imageUrl = movie.imageUrl;

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
        imageUrl = movie.imageUrl;
    } else {
        const file = req.files.file;
        const fileSize = file.data.length
        const ext = path.extname(file.name);
        const dateNow = Math.round(Date.now());
        const fileName = dateNow + ext;
        // imageUrl = `http://localhost:12793/images/${fileName}`;
        imageUrl = `https://${PUBLIC_DOMAIN}/images/${fileName}`;
        if (fileSize > 5000000) return res.json({ msg: "The image size is larger than 5 MB." });
        const filePath = `./public/images/${path.basename(movie.imageUrl)}`
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await file.mv(`./public/images/${fileName}`);
    }
    try {
        await Movie.update({
            title: title, description: description, genre: genre, rating: movie.rating,
            ratingCount: movie.ratingCount, releaseYear: releaseYear, imageUrl: imageUrl
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

export const setVote = async (req, res) => {
    const movie = await Movie.findOne({
        where: {
            id: req.params.id
        }
    });
    const vote = req.body.rating;
    if (vote > 5 || vote < 0) return res.json({ msg: "Your vote must be between 0 and 5." })
    const number = Number(movie.ratingCount);
    const preRating = Number(movie.rating);
    const avg = ((vote * 1) + (preRating * number)) / (number + 1)
    try {
        await Movie.update({
            title: movie.title, description: movie.description, genre: movie.genre, rating: avg,
            ratingCount: number + 1, releaseYear: movie.releaseYear, imageUrl: movie.imageUrl
        }, {
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "Your vote has been recorded." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}


// باید مقدار توضیحات از 320 کمتر باشه 