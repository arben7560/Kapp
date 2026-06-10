import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "./env.js";
import { avatarRealtimeRouter } from "./routes/avatarRealtime.routes.js";
// import { teacherRouter } from "./routes/teacher.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioDir = path.resolve(__dirname, "..", "public", "audio");
const avatarDir = path.resolve(__dirname, "..", "..", "assets", "images");

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/audio", express.static(audioDir));
app.use("/avatar", express.static(avatarDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "kapp-backend" });
});

//app.use("/api/teacher", teacherRouter);
app.use("/api/avatar/realtime", avatarRealtimeRouter);

app.get("/", (_req, res) => {
  res.json({
    message: "Kapp backend is running",
    status: "ok",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Kapp backend running on http://localhost:${port}`);
});
