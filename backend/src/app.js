import "dotenv/config";
import express from "express";
import { createServer } from "node:http";

import { connectToSocket } from "./controllers/socketManager.js";

import mongoose from "mongoose";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();


const server = createServer(app);

const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

app.set("host", process.env.HOST || "localhost");

app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));

const allowedOrigins = [
  "http://localhost:5173",
  "https://opmeet.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/home",(req,res)=>{
    return res.json({message:"Hello World!"})
});
app.use("/api/v1/user",userRoutes);

const start = async ()=>{
    const connectionDb = await mongoose.connect(process.env.MONGO_URI);

    console.log("Database connected successfully");
    server.listen(app.get("port"),()=>{
        console.log(`Server is running on port ${app.get("port")}`);
    })
}

start();