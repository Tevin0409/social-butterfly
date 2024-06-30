import express, { Express, Request, Response } from "express";
import { PORT } from "./secrets";
import rootRouter from "./routes";
import { errorMiddleware } from "./middlewares/errors";
import cors from "cors";
const app: Express = express();

//explain json formats
app.use(cors());
app.use(express.json());
app.use("/api", rootRouter);
app.use(errorMiddleware);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
