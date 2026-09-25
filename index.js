import express from "express";
import cors from "cors"
import fileUpload from "express-fileupload";
import router from "./routes/superRoutes.js";

// npm express express-fileupload mysql2 sequelize cors

// mysql -h mainline.proxy.rlwy.net -u root -p --port 30127 --protocol=TCP railway
// ViRUVsEhTYvRcmJtndwLmfwrGJjsFaBU


const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(express.static("public"));
app.use(router)

app.listen(12793, () => console.log("Server is running on port 12793"));

