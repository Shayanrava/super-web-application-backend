import { Sequelize } from "sequelize";
import db from "../config/DB.js";
import Movie from "./MovieModel.js";

const { DataTypes } = Sequelize;

const Showtime = db.define("showtimes", {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Movie,
            key: "id"
        }
    },
    available_seats: {
        type: DataTypes.INTEGER,
        defaultValue: 40
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timestamps: false
});

Movie.hasMany(Showtime, { foreignKey: "movie_id" });
Showtime.belongsTo(Movie, { foreignKey: "movie_id" });

export default Showtime;
