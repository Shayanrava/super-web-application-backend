import Reservation from "../models/ReservationModel.js";
import Showtime from "../models/ShowtimeModel.js";
import Users from "../models/UserModel.js";
import { Sequelize } from "sequelize";
import { Op } from "sequelize";

export const getShowTimes = async (req, res) => {
    try {
        const response = await Showtime.findAll({
            where: {
                date: {
                    [Op.gt]: new Date()
                }
            }
        });
        res.json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

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

export const getUsersShowtimes = async (req, res) => {
    try {

        const user = await Users.findOne({
            attributes: ['id'],
            where: {
                name: req.body.name,
                password: req.body.password
            }
        });

        if (!user) return res.status(404).json({ msg: "User not found" });

        const reservations = await Reservation.findAll({
            attributes: ['id', 'seat_number', 'rate', 'showtime_id'],
            where: {
                user_id: user.id
            },
            include: [
                {
                    model: Showtime
                }
            ]
        });

        return res.json(reservations);

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const saveShowTime = async (req, res) => {
    if (!req.body.movie_id) return res.json({ msg: "movie ID is required." });
    if (!req.body.date) return res.json({ msg: "Date is required." });
    if (new Date(req.body.date) < new Date()) return res.json({ msg: "Date can't be in past ." });
    if (!req.body.start_time) return res.json({ msg: "Start time is required." });
    if (!req.body.end_time) return res.json({ msg: "End time is required." });
    if (new Date(`${req.body.date}T${req.body.start_time}`) >= new Date(`${req.body.date}T${req.body.end_time}`)) return res.json({ msg: "Start time must be earlier than end time." });
    if (isNaN(new Date(req.body.date))) return res.json({ msg: "Invalid date." });
    if (isNaN(new Date(`${req.body.date}T${req.body.start_time}`))) return res.json({ msg: "Invalid start time." });
    if (isNaN(new Date(`${req.body.date}T${req.body.end_time}`))) return res.json({ msg: "Invalid end time." });
    if (!req.body.price) return res.json({ msg: "Price is required." });
    if (req.body.price <= 0) return res.json({ msg: "Price must be more than 0" })

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

    if (req.body.date) {
        if (isNaN(new Date(req.body.date))) return res.json({ msg: "Invalid date." });
        if (new Date(req.body.date) < new Date()) return res.json({ msg: "Date can't be in past ." });
    }

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

