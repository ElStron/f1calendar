import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';


import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config()
const port = process.env.PORT ?? 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

const db = createClient({
    url: "libsql://live-race-elstron.turso.io",
    authToken: process.env.DB_TOKEN,

});

await db.execute(`
    CREATE TABLE IF NOT EXISTS testmsg (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT
    )
`)

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    })
    socket.on('Change position', (changeType, racer, position) => {
        io.emit('Change position', changeType, racer, position)    
    })

    socket.on('shange position', (msg) => {
        let result
        try {
            result = db.execute({
                sql: 'INSERT INTO testmsg (content) VALUES (:content)',
                args: {content: msg}
            })
        } catch (error) {
            console.log(error);
            return
        }
        io.emit('shange position', msg)
    })
})

app.use(logger('dev')); 

app.get('/live-racer', (req, res) => {
    res.send('Hello World!')
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})