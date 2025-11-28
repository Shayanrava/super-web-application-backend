import { Sequelize } from "sequelize";

const db = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQL_ROOT_PASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: "mysql",
  }
);
export default db;


// const db = new Sequelize(
//   "super_web_app",
//   "root",
//   "Shayan$$%%",
//   {
//     host: "localhost",
//     dialect: "mysql",
//     timezone: '+03:30'
//   }
// );
// export default db;




