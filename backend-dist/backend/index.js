import { server } from './ws-server.js';
import router from './routes.js';
const PORT = process.env.PORT || 4000;
server.on('request', router);
server.listen(PORT, () => {
    console.log(`Server and WebSocket running on port ${PORT}`);
});
