import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { logoutUser } from './controllers/user.controller.js';
import adminRouter from './routes/admin.routes.js';
import studentRouter from './routes/student.routes.js';
import subjectRouter from './routes/subject.routes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/admin", adminRouter);
app.use("/student", studentRouter);
app.use("/subject", subjectRouter);
app.use("/logout", logoutUser);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

export { app };
