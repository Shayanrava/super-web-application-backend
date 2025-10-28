import { Sequelize } from "sequelize";

const db = new Sequelize(
  "super_web_app",
  "root",
  "Shayan$$%%",
  {
    host: "localhost",
    dialect: "mysql",
  }
);
export default db;

