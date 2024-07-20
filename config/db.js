const { default: mongoose } = require("mongoose");
const dbConnected = () => {
 try {
    const conn = mongoose.connect(process.env.MONGODB_URL);
    console.log("database connected successfully");
 } catch (error) {
   console.log("db connection error");
 }
};
module.exports = dbConnected;