import { Sequelize } from "sequelize";
import db from "../config/DB.js";
import Users from "./UserModel.js";
import Showtime from "./ShowtimeModel.js";

const { DataTypes } = Sequelize;

const Reservation = db.define("reservations", {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: "id"
        }
    },
    showtime_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Showtime,
            key: "id"
        }
    },
    seat_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    booking_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    rate: {
        type: DataTypes.INTEGER,
        allowNull: true

    }
}, {
    freezeTableName: true,
    timestamps: false
});

Users.hasMany(Reservation, { foreignKey: "user_id" });
Reservation.belongsTo(Users, { foreignKey: "user_id" });
Showtime.hasMany(Reservation, { foreignKey: "showtime_id" });
Reservation.belongsTo(Showtime, { foreignKey: "showtime_id" });

export default Reservation;