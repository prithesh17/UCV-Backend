// import express from 'express';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import path from 'path';
// import { fileURLToPath } from 'url';

// import { logoutUser } from './controllers/user.controller.js';
// import adminRouter from './routes/admin.routes.js';
// import studentRouter from './routes/student.routes.js';
// import subjectRouter from './routes/subject.routes.js';

// const app = express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname, '../public')));

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
// }));

// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(cookieParser());

// app.use("/admin", adminRouter);
// app.use("/student", studentRouter);
// app.use("/subject", subjectRouter);
// app.use("/logout", logoutUser);

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../public', 'index.html'));
// });

// export { app };











import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http'; // Import to create HTTP server for Socket.IO
import { Server } from 'socket.io'; // Import Socket.IO server

import { logoutUser } from './controllers/user.controller.js';
import adminRouter from './routes/admin.routes.js';
import studentRouter from './routes/student.routes.js';
import subjectRouter from './routes/subject.routes.js';

const app = express();

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO with the server
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN, // Ensure the same CORS origin for Socket.IO
        credentials: true,
    },
});

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

// Socket.IO logic
let socketsConnected = new Set();

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socketsConnected.add(socket.id);
    io.emit('clients-total', socketsConnected.size);

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        socketsConnected.delete(socket.id);
        io.emit('clients-total', socketsConnected.size);
    });

    socket.on('message', (data) => {
        console.log('Message received:', data);
        socket.broadcast.emit('chat-message', data);
    });

    socket.on('feedback', (data) => {
        console.log('Feedback received:', data);
        socket.broadcast.emit('feedback', data);
    });
});

// Export the server for starting the app
export { server };
