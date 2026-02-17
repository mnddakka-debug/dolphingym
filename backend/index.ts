import { server } from './ws-server.js';
import router from './routes.js';

const PORT = process.env.PORT || 4000;

server.on('request', router);

server.listen(PORT, () => {
  console.log(`Server and WebSocket running on port ${PORT}`);
  import pool from './db';

  // Test DB connection on startup
  pool.query('SELECT NOW()')
    .then(res => {
      console.log('Database connected. Time:', res.rows[0].now);
    })
    .catch(err => {
      console.error('Database connection error:', err);
    });
});
