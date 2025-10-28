import express from "express";
import { getUsers, singleUser, saveUser, updateUser, deleteUser } from "../controller/Controller.js";



const router = express.Router()
router.get("/users", getUsers) // http://localhost:12793/users , https://super-web-application-backend-production.up.railway.app/users
router.post("/users", saveUser)
router.put("/users/:id", updateUser)
router.get("/users/:id", singleUser)
router.delete("/users/:id", deleteUser)


export default router;