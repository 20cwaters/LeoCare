import express from "express";
import cors from "cors";
import path from "path";
import { read, uploadsDir } from "./db/database";
import tasksRouter from "./routes/tasks";
import daysRouter from "./routes/days";
import aboutRouter from "./routes/about";
import mediaRouter from "./routes/media";
import resetRouter from "./routes/reset";

const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = isProd ? process.env.PORT || 3002 : 3002;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const s = read();
  res.json({ ok: true, active_tasks: s.tasks.filter((t) => t.active).length });
});

app.use("/api/tasks", tasksRouter);
app.use("/api/days", daysRouter);
app.use("/api/about", aboutRouter);
app.use("/api/media", mediaRouter);
app.use("/api/reset", resetRouter);
app.use("/media", express.static(uploadsDir, { maxAge: "1h" }));

const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`LeoCare server running on port ${PORT}`);
});
