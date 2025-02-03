import {server} from './server.js';
import {initializeDB} from './src/configs/db.config.js';

initializeDB();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`app is running on port:${PORT}`));
