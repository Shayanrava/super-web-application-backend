import { Sequelize } from "sequelize";
import db from "../config/DB.js";

const { DataTypes } = Sequelize;

const Users = db.define("users", {
    name: DataTypes.STRING,
    age: DataTypes.STRING,
    nationality: DataTypes.STRING,
    url: DataTypes.STRING,
    password: DataTypes.STRING
}, {
    freezeTableName: true,
    timestamps: false
});


export default Users;
