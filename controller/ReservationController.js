import db from "../config/DB.js";
import Movie from "../models/MovieModel.js";
import Reservation from "../models/ReservationModel.js";
import Showtime from "../models/ShowtimeModel.js";
import Users from "../models/UserModel.js";




export const getReserve = async (req, res) => {
    try {
        const response = await Reservation.findAll();
        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

export const singleReserve = async (req, res) => {

    try {
        const response = await Reservation.findOne({
            where: {
                id: req.params.id
            }
        });
        res.json(response);
    } catch (error) {
        res.json({ msg: error.message })
    }
}

export const getShowtimeReserve = async (req, res) => {
    try {
        const response = await Reservation.findAll({
            where: {
                showtime_id: req.params.id
            }
        });
        res.json(response);
    } catch (error) {
        res.json({ msg: error.message })
    }

}

export const saveReserve = async (req, res) => {
    if (!req.body.user_id) return res.status(400).json({ msg: "User ID is required." });
    if (!req.body.showtime_id) return res.status(400).json({ msg: "Showtime ID is required." });
    if (!req.body.seat_number) return res.status(400).json({ msg: "Seat number is required." });
    if (!req.body.booking_time) return res.status(400).json({ msg: "Booking time is required." });

    const user_id = req.body.user_id;
    const showtime_id = req.body.showtime_id;
    const seat_number = req.body.seat_number;
    const booking_time = req.body.booking_time;
    try {
        await db.transaction(async (t) => {
            const existing = await Reservation.findOne({
                where: { showtime_id, seat_number },
                transaction: t
            });
            if (existing) throw new Error("This seat is already booked.");

            const showtime = await Showtime.findOne({
                where: { id: showtime_id },
                transaction: t
            });
            if (!showtime) throw new Error("Showtime not found.");
            if (showtime.available_seats <= 0) throw new Error("No available seats.");

            await Reservation.create(
                { user_id, seat_number, showtime_id, booking_time },
                { transaction: t }
            );

            await Showtime.update(
                { available_seats: showtime.available_seats - 1 },
                { where: { id: showtime_id }, transaction: t }
            );
        });

        res.status(200).json({ msg: "Reservation was successful." });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
}

export const updateReserve = async (req, res) => {

    const reserve = await Reservation.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!reserve) return res.json({ msg: "The reserve was not found." });

    let user_id = "";
    let showtime_id = "";
    let seat_number = "";
    let booking_time = "";

    if (!req.body.user_id) {
        user_id = reserve.user_id
    } else {
        user_id = req.body.user_id;
    }

    if (!req.body.showtime_id) {
        showtime_id = reserve.showtime_id
    } else {
        showtime_id = req.body.showtime_id;
    }

    if (!req.body.seat_number) {
        seat_number = reserve.seat_number
    } else {
        seat_number = req.body.seat_number;
    }

    if (!req.body.booking_time) {
        booking_time = reserve.booking_time
    } else {
        booking_time = req.body.booking_time;
    }

    try {
        await Reservation.update({ user_id: user_id, seat_number: seat_number, showtime_id: showtime_id, booking_time: booking_time }, {
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The reserve was update successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}

export const updateVote = async (req, res) => {

    try {

        const vote = req.body.vote;
        if (vote > 5 || vote < 0) return res.json({ msg: "Your vote must be between 0 and 5." })


        const reserve = await Reservation.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!reserve) return res.json({ msg: "The reserve was not found." });

        const movieID = await Showtime.findOne(
            {
                attributes: ['movie_id'],
                where: {
                    id: reserve.showtime_id
                }
            }
        )

        const movie = await Movie.findOne(
            {
                where: {
                    id: movieID.movie_id
                }
            }
        )
        let number = Number(movie.ratingCount);
        const preRating = Number(movie.rating);
        let avg = 0
        if (reserve.rate == null) {
            avg = ((vote * 1) + (preRating * number)) / (number + 1)
            number = number + 1

        } else {
            avg = ((preRating * number) + (vote - reserve.rate)) / number
        }


        await Reservation.update({ rate: req.body.vote }, {
            where: {
                id: req.params.id
            }
        });

        await Movie.update({
            rating: avg.toFixed(3),
            ratingCount: number
        }, {
            where: {
                id: movieID.movie_id
            }
        });

        res.json({ msg: "Your vote has been recorded successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}


export const deleteReserve = async (req, res) => {

    const response = await Reservation.findOne({
        where: {
            id: req.params.id
        }
    });

    if (!response) return res.json({ msg: "The reserve was not found." });

    try {
        await Reservation.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The reserve was delete successfully ." });
    } catch (error) {
        res.json({ msgd: error.message });;
    }
}

//  نیاز هست که یه تابع برای رای گیری هم اضافه شه که اول چک کنه کاربر خرید کرده و سپس در جدول فیلم ذخیره شه و همچنین برای اپدیت هم برای گذاشته شه و بعد پایان فیلم حتما
// کم کردن تعدادصندلی در نمایش