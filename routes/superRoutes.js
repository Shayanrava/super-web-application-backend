import express from "express";
import { getUsers, singleUser, saveUser, updateUser, deleteUser, getIdUser } from "../controller/UsersController.js";
import { deleteMovie, getMovies, saveMovie, setVote, singleMovie, updateMovie } from "../controller/MoviesController.js";
import { deleteShowTime, getShowTimes, getSingleShowTime, saveShowTime, setSeat, updateShowTime } from "../controller/ShowtimeController.js";
import { deleteReserve, getReserve, getShowtimeReserve, saveReserve, updateReserve } from "../controller/ReservationController.js";



const router = express.Router()

router.get("/users", getUsers) // http://localhost:12793/users , https://super-web-application-backend-production.up.railway.app/users
router.get("/users/:id", singleUser)
router.get("/users/:id/:password", getIdUser)
router.post("/users", saveUser)
router.put("/users/:id", updateUser)
router.delete("/users/:id", deleteUser)

router.get("/movies", getMovies)
router.get("/movies/:id", singleMovie)
router.post("/movies", saveMovie)
router.delete("/movies/:id", deleteMovie)
router.put("/movies/:id", updateMovie)
router.put("/movies/vote/:id", setVote)

router.get("/showtimes" , getShowTimes)
router.get("/showtimes/:id", getSingleShowTime)
router.post("/showtimes" , saveShowTime)
router.delete("/showtimes/:id", deleteShowTime)
router.put("/showtimes/:id", updateShowTime)
router.put("/showtimes/seat/:id", setSeat)

router.get("/reservation" , getReserve)
router.get("/reservation/:id", getShowtimeReserve)
router.post("/reservation" , saveReserve)
router.put("/reservation/:id", updateReserve)
router.delete("/reservation/:id", deleteReserve)






export default router;