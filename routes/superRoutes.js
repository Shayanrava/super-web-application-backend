import express from "express";
import { getUsers, singleUser, saveUser, updateUser, deleteUser, getUserID } from "../controller/UsersController.js";
import { deleteMovie, getMovies, saveMovie, singleMovie, updateMovie } from "../controller/MoviesController.js";
import { deleteShowTime, getShowTimes, getSingleShowTime, getUsersShowtimes, saveShowTime,  updateShowTime } from "../controller/ShowtimeController.js";
import { deleteReserve, getReserve, getShowtimeReserve, saveReserve, updateReserve, updateVote } from "../controller/ReservationController.js";


// http://localhost:12793/ , https://super-web-application-backend-production.up.railway.app/
const router = express.Router()

router.get("/users", getUsers) 
router.get("/users/:id", singleUser)
router.post("/users", saveUser)
router.put("/users/:id", updateUser)
router.delete("/users/:id", deleteUser)

router.get("/movies", getMovies)
router.get("/movies/:id", singleMovie)
router.post("/movies", saveMovie)
router.delete("/movies/:id", deleteMovie)
router.put("/movies/:id", updateMovie)


router.get("/showtimes" , getShowTimes)
router.get("/showtimes/:id", getSingleShowTime)
router.post("/showtimes" , saveShowTime)
router.delete("/showtimes/:id", deleteShowTime)
router.put("/showtimes/:id", updateShowTime)

router.get("/reservation" , getReserve)
router.post("/reservation" , saveReserve)
router.put("/reservation/:id", updateReserve)
router.delete("/reservation/:id", deleteReserve)


router.get("/reservation/:id", getShowtimeReserve)
router.post("/reservation/:id" , updateVote)
router.post("/users-showtimes" , getUsersShowtimes)
router.post("/userID", getUserID)




export default router;