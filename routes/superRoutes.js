import express from "express";
import { getUsers, getSingleUser, getUserByUsernamePassword, saveUser, updateUser, deleteUser } from "../controller/UsersController.js";
import { getMovies, getSingleMovie, saveMovie, updateMovie, deleteMovie } from "../controller/MoviesController.js";
import { getShowTimes, getSingleShowTime, saveShowTime, updateShowTime, deleteShowTime } from "../controller/ShowtimeController.js";
import { getReserveByUserID, getReserveByShowtimeID, getSingleReserve, saveReserve, updateVote, deleteReserve } from "../controller/ReservationController.js";


const router = express.Router()

router.get("/users", getUsers)
router.get("/users/:id", getSingleUser)
router.post("/users", saveUser)
router.put("/users/:id", updateUser)
router.delete("/users/:id", deleteUser)

router.get("/movies", getMovies)
router.get("/movies/:id", getSingleMovie)
router.post("/movies", saveMovie)
router.delete("/movies/:id", deleteMovie)
router.put("/movies/:id", updateMovie)

router.get("/showtimes", getShowTimes)
router.get("/showtimes/:id", getSingleShowTime)
router.post("/showtimes", saveShowTime)
router.delete("/showtimes/:id", deleteShowTime)
router.put("/showtimes/:id", updateShowTime)

router.get("/users/:id/reservations", getReserveByUserID)
router.get("/showtimes/:id/reservations", getReserveByShowtimeID)
router.get("/reservation/:id", getSingleReserve)
router.post("/reservation", saveReserve)
router.put("/reservation/:id", updateVote)
router.delete("/reservation/:id", deleteReserve)

router.post("/login", getUserByUsernamePassword)






export default router;