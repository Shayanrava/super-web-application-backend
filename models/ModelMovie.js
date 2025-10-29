import { Sequelize } from "sequelize";
import db from "../config/DB.js";

const { DataTypes } = Sequelize;

const Movie = db.define("movies", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    genre: {
        type: DataTypes.STRING,
    },
    releaseYear: {
        type: DataTypes.INTEGER,
    },
    rating: {
        type: DataTypes.FLOAT,
        validate: { min: 0, max: 5 },
    },
    ratingCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    imageUrl: {
        type: DataTypes.STRING,
    },
}, {
    freezeTableName: true,
    timestamps: false
});

export default Movie;