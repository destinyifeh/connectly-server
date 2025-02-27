import {createServer} from 'http';
import {initializeApp} from './initialize-app.js';
import initializeSocket from './src/utils/events/chat-socket.js';

const app = initializeApp();
const server = createServer(app);

const io = initializeSocket(server);

export {io, server};
