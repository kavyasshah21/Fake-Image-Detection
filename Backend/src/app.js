const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/auth.routes")
const imageRoutes = require("./routes/image.routes")

app.use(cors({
origin: "http://localhost:5173",
credentials: true
}));
app.use(express.json())
app.use(cookieParser())



app.use("/api/auth", authRoutes)
app.use("/api/images",imageRoutes)



module.exports = app