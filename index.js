import express from "express";
import cors from "cors"
import fileUpload from "express-fileupload";
import router from "./routes/superRoutes.js";

// npm express express-fileupload mysql2 sequelize cors


const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));
app.use(router)



app.listen(12793 , console.log("server is running"));

