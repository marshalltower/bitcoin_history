const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const {pool, client} = require('./db/postgres');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 80; //8080
const publicDirectoryPath = path.join(__dirname, '../bitcoin-history/build');
app.use(express.static(publicDirectoryPath));

app.get('/api/history', async (req,res) => {
    pool.query('SELECT date, price FROM history ORDER BY date', (err, data) => {
        if(err) {
            console.log('Error', err);
            return res.status(404).send('Server not found');
        }
        const history = {};
        data.rows.forEach( row => {
            const date = row.date;
            const dateString = date.toISOString().substring(0,10);
            history[dateString] = row.price.substring(1);
        });

        return res.status(200).json(history);
    });
})

client.connect().catch(e=>console.log(e));
io.on('connection', (socket) => {
    client.query("LISTEN new_item").catch(e=>console.log(e));
    client.on('notification', (data) => {
        const payload = JSON.parse(data.payload);
        const msg = {};
        msg[payload.date] = payload.price.substring(1);
        socket.emit('newItem', msg);
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})