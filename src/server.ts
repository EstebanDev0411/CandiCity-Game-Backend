import express from "express";
import cors from "cors";
import setupRoute from "./routes";
import { StatusCodes } from "http-status-codes";
import logger from "./utils/logger";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Routes
app.get("/", (_req, res) => {
  res.status(StatusCodes.OK).send("API Running");
});

// Setup routes
setupRoute(app);

app.listen(process.env.PORT, async () => {
  logger.info(
    `Server started at http://${process.env.HOSTNAME}:${process.env.PORT}`
  );
});

export default app;
