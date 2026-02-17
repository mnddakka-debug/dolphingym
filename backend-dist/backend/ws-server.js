import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to Dolphin Gym notifications!' }));
});
export { server, wss, app };
