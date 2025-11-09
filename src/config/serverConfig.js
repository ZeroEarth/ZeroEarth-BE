const dotenv = require("dotenv")

dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_USER: process.env.POSTGRES_USER,
    DB_HOST: process.env.POSTGRES_HOST,
    DATABASE: process.env.POSTGRES_DB,
    DB_PASSWORD: process.env.POSTGRES_PASSWORD,
    DB_PORT: process.env.POSTGRES_PORT,
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS, 10),
    DEFAULT_PASSWORD: process.env.DEFAULT_PASSWORD,
    FEED_DAYS: parseInt(process.env.FEED_DAYS, 10),
    FEED_QUANTITY: parseInt(process.env.FEED_QUANTITY_PER_CATTLE, 10)
}