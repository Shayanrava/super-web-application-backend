import { Sequelize } from "sequelize";
import db from "../config/DB.js";

const { DataTypes } = Sequelize;

const Reserve = db.define(" ", {

}, {
    freezeTableName: true,
    timestamps: false
});

export default Reserve;