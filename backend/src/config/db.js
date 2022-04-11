const fastifyPlugin = require('fastify-plugin');
const mongoose = require('mongoose');
// Connect to DB
async function dbConnector(fastify, options) {
    try {
        const url = "mongodb://mongo:27017/generic-queue";
        const db = await mongoose
            .connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
        console.log("Database is connected");
    } catch (err) {
        console.log(err);
    }
}
module.exports = fastifyPlugin(dbConnector);