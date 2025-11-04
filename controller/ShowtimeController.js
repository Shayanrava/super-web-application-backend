import Showtime from "../models/ShowtimeModel.js";


export const getShowTimes = async (req, res) => {
    try {
        const response = await Showtime.findAll();
        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

export const getSingleShowTime = async (req, res) => {
    try {
        const response = await Showtime.findOne({
            where: {
                id: req.params.id
            }
        });
        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

export const saveShowTime = async (req, res) => {
    if (!req.body.movie_id) return res.json({ msg: "movie ID is required." });
    if (!req.body.date) return res.json({ msg: "date is required." });
    if (!req.body.start_time) return res.json({ msg: "start_time is required." });
    if (!req.body.end_time) return res.json({ msg: "end_time is required." });
    if (!req.body.price) return res.json({ msg: "price is required." });

    const movie_id = req.body.movie_id;
    const date = req.body.date;
    const start_time = req.body.start_time;
    const end_time = req.body.end_time;
    const price = req.body.price;
    try {
        await Showtime.create({ movie_id: movie_id, date: date, start_time: start_time, end_time: end_time, price: price });
        res.json({ msg: "The showtime was added successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}

export const updateShowTime = async (req, res) => {

    const showtime = await Showtime.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!showtime) return res.json({ msg: "The showtime was not found." });

    let movie_id = ""
    let date = ""
    let start_time = ""
    let end_time = ""
    let price = ""

    if (req.body.movie_id == "") {
        movie_id = showtime.movie_id;
    } else {
        movie_id = req.body.movie_id;
    }

    if (req.body.date == "") {
        date = showtime.date
    } else {
        date = req.body.date;
    }

    if (req.body.start_time == "") {
        start_time = showtime.start_time;
    } else {
        start_time = req.body.start_time;
    }

    if (req.body.end_time == "") {
        end_time = showtime.end_time;
    } else {
        end_time = req.body.end_time;
    }

    if (req.body.price == "") {
        price = showtime.price
    } else {
        price = req.body.price;
    }

    try {
        await Showtime.update({ movie_id: movie_id, date: date, start_time: start_time, end_time: end_time, price: price }, {
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The showtime was update successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}

export const deleteShowTime = async (req, res) => {

    const response = await Showtime.findOne({
        where: {
            id: req.params.id
        }
    });

    if (!response) return res.json({ msg: "The showtime was not found." });

    try {
        await Showtime.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The showtime was delete successfully ." });
    } catch (error) {
        res.json({ msgd: error.message });;
    }
}

export const setSeat = async (req, res) => {

    const response = await Showtime.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!response) return res.json({ msg: "The showtime was not found." });

    const movie_id = response.movie_id;
    const date = response.date;
    const start_time = response.start_time;
    const end_time = response.end_time;
    const price = response.price;
    const number = response.available_seats - req.params.id;

    try {
        await Showtime.update({ movie_id: movie_id, date: date, start_time: start_time, end_time: end_time, available_seats: number, price: price }, {
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The showtime was update successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}