import express, { Application } from "express";
import cors from "cors";
import path from "path";
import postRoute from "./src/routes/postRoute";
import authRoute from "./src/routes/authRoute";
import profileRoute from "./src/routes/profileRoute";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors());

//Initializing MongoDB connection
if (!process.env.DATABASE_URL) {
  throw "Specify DATABASE_URL as enviromental variable";
}
void mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;

//Check connection

db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use("/api/post", postRoute);
app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/upload", express.static(path.join(__dirname, "src/upload")));

//Creating port variable from env variable or setting it mannualy

const PORT = process.env.PORT || 8000;

//Listening on the PORT variable and then console logging the port

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
