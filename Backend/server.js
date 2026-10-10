// require("dotenv").config()
// const app = require("../BACKEND/src/app")
// const connectDB = require("../BACKEND/src/db/db")

// connectDB().then(()=>{
//     app.listen(3000,()=>{
//     console.log("Server is running on the port")
//     })
// })



require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB().then(() => {
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}).catch((err) => {
    console.error("Database connection failed:", err);
});
