import express from "express";
import { getUsers, singleUser, saveUser, updateUser, deleteUser } from "../controller/ControllerUsers.js";
import { deleteMovie, getMovies, saveMovie, setVote, singleMovie, updateMovie } from "../controller/ControllerMovies.js";



const router = express.Router()

router.get("/users", getUsers) // http://localhost:12793/users , https://super-web-application-backend-production.up.railway.app/users
router.get("/users/:id", singleUser)
router.post("/users", saveUser)
router.put("/users/:id", updateUser)
router.delete("/users/:id", deleteUser)

router.get("/movies", getMovies)
router.get("/movies/:id", singleMovie)
router.post("/movies", saveMovie)
router.delete("/movies/:id", deleteMovie)
router.put("/movies/:id", updateMovie)
router.put("/movies/vote/:id", setVote)






export default router;