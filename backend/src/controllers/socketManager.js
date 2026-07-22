import { Server } from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        console.log("Sommthing connected"); 

       socket.on("join-call", (path) => { 
            if (connections[path] === undefined) {
                connections[path] = []
            }
            
            // Only notify existing users that a NEW user has joined
            for (let a = 0; a < connections[path].length; a++) { 
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            // Push the new socket into the array AFTER notifying others
            connections[path].push(socket.id)
            timeOnline[socket.id] = new Date();

            if (messages[path] !== undefined) { 
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender']
                    )
                }
            }
        })

        socket.on("signal", (toId, message) => {
            // FIX 3: messgae changed to message
            io.to(toId).emit("signal", socket.id, message); 
        })
        
        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }
                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id });
                
                console.log("message", matchingRoom, ":", sender, data) 

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key

            // Note: Object.entries directly is cleaner, but keeping your JSON logic if it's strictly for deep cloning
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k
                        for (let a = 0; a < connections[key].length; ++a) {
                            // FIX 5: kay changed to key
                            io.to(connections[key][a]).emit('user-left', socket.id) 
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)

                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }
            }
        })

    })

    return io;
}