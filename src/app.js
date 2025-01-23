const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cors = require("cors");
// require("./utils/cronJobs"); // commenting to not run cron
const http = require("http");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/request', requestRouter);
app.use("/user", userRouter);
app.use("/chat", chatRouter);

app.get("/", (req, res) => {
  res.send("Response from Server!");
});

// For Creating websocket-server
const server = http.createServer(app);

initializeSocket(server);

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    // First connect with Database then listen for the request! (This is good way)
    console.log("Database Connected Successfully!");
    server.listen(port, () => {
      console.log("Server is listening on port:", port);
    });
  })
  .catch((err) => {
    console.log("Error while connecting with Database", err);
    console.log("Database is not Connected!");
  });
