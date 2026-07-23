import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const server_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const peerConfigConnections = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

export function useWebRTC(roomPath, username, showMessage) {
    const socketRef = useRef(null);
    const peerConnectionsRef = useRef({});
    
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [remoteUsers, setRemoteUsers] = useState({});
    const [messages, setMessages] = useState([]);
    
    // NEW: State to track which stream is a camera and which is a presentation
    const [streamTypes, setStreamTypes] = useState({});

    // NEW: Helper to get the types of our local streams
    const getStreamInfo = () => {
        const info = {};
        if (window.localStream) info[window.localStream.id] = "camera";
        if (window.localScreenStream) info[window.localScreenStream.id] = "presentation";
        return info;
    };

    const connect = () => {
        socketRef.current = io(server_url);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", roomPath);
        });

        socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
            setMessages((prev) => [...prev, { data, sender, socketIdSender }]);
        });

        socketRef.current.on("user-joined", (socketId) => {
            if (socketId !== socketRef.current.id) {
                showMessage("A new user joined", "info");
                createPeerConnection(socketId, true);
            }
        });

        socketRef.current.on("user-left", (socketId) => {
            if (peerConnectionsRef.current[socketId]) {
                peerConnectionsRef.current[socketId].close();
                delete peerConnectionsRef.current[socketId];
            }
            setRemoteStreams((prev) => prev.filter(s => s.socketId !== socketId));
            setRemoteUsers((prev) => {
                const newUsers = { ...prev };
                delete newUsers[socketId];
                return newUsers;
            });
        });

        socketRef.current.on("signal", async (fromId, message) => {
            // NEW: Extract streamInfo from the incoming signal
            const { type, signal, username: remoteUsername, streamInfo } = message;

            if (remoteUsername) {
                setRemoteUsers(prev => ({ ...prev, [fromId]: remoteUsername }));
            }
            
            // NEW: Save the incoming stream types so the UI knows what they are
            if (streamInfo) {
                setStreamTypes(prev => ({ ...prev, ...streamInfo }));
            }

            let pc = peerConnectionsRef.current[fromId];

            const flushIceQueue = async (peerConnection) => {
                if (peerConnection.iceQueue && peerConnection.iceQueue.length > 0) {
                    for (const candidate of peerConnection.iceQueue) {
                        try {
                            await peerConnection.addIceCandidate(candidate);
                        } catch (e) {
                            console.error("Error adding queued ice candidate", e);
                        }
                    }
                    peerConnection.iceQueue = [];
                }
            };

            try {
                if (type === "offer") {
                    if (!pc) {
                        pc = createPeerConnection(fromId, false);
                    }
                    await pc.setRemoteDescription(new RTCSessionDescription(signal));
                    await flushIceQueue(pc); 
                    
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    
                    // NEW: Attach streamInfo to our answer
                    socketRef.current.emit("signal", fromId, { 
                        type: "answer", 
                        signal: answer, 
                        username,
                        streamInfo: getStreamInfo() 
                    });
                    
                } else if (type === "answer") {
                    if (pc) {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal));
                        await flushIceQueue(pc); 
                    }
                    
                } else if (type === "ice-candidate") {
                    if (pc && signal) {
                        if (!pc.remoteDescription) {
                            if (!pc.iceQueue) pc.iceQueue = [];
                            pc.iceQueue.push(new RTCIceCandidate(signal));
                        } else {
                            await pc.addIceCandidate(new RTCIceCandidate(signal));
                        }
                    }
                }
            } catch (error) {
                console.error("Error handling signal:", error);
            }
        });
    };

    const createPeerConnection = (socketId, isInitiator) => {
        if (peerConnectionsRef.current[socketId]) {
            return peerConnectionsRef.current[socketId];
        }

        const pc = new RTCPeerConnection(peerConfigConnections);
        peerConnectionsRef.current[socketId] = pc;
        pc.iceQueue = []; 

        setRemoteStreams(prev => {
            if (!prev.some(s => s.socketId === socketId)) {
                return [...prev, { socketId, stream: null }];
            }
            return prev;
        });

        if (window.localStream) {
            window.localStream.getTracks().forEach(track => {
                pc.addTrack(track, window.localStream);
            });
        }

        if (window.localScreenStream) {
            window.localScreenStream.getTracks().forEach(track => {
                pc.addTrack(track, window.localScreenStream);
            });
        }

        pc.onnegotiationneeded = async () => {
            try {
                if (pc.signalingState !== "stable") return; 
                
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                
                // NEW: Attach streamInfo when renegotiating (like when screen share starts)
                socketRef.current.emit("signal", socketId, { 
                    type: "offer", 
                    signal: pc.localDescription, 
                    username,
                    streamInfo: getStreamInfo()
                });
            } catch (err) {
                console.error("Error creating renegotiation offer:", err);
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit("signal", socketId, { 
                    type: "ice-candidate", 
                    signal: event.candidate 
                });
            }
        };

        pc.ontrack = (event) => {
            const incomingStream = event.streams && event.streams[0] 
                ? event.streams[0] 
                : new MediaStream([event.track]);

            setRemoteStreams(prev => {
                const alreadyExists = prev.some(s => s.stream && s.stream.id === incomingStream.id);
                if (alreadyExists) return prev; 

                const filteredPrev = prev.filter(s => !(s.socketId === socketId && s.stream === null));
                return [...filteredPrev, { socketId, stream: incomingStream }];
            });
        };

        if (isInitiator) {
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    // NEW: Attach streamInfo on initial offer
                    socketRef.current.emit("signal", socketId, { 
                        type: "offer", 
                        signal: pc.localDescription, 
                        username,
                        streamInfo: getStreamInfo()
                    });
                })
                .catch(err => console.error("Error creating offer:", err));
        }

        return pc;
    };

    const sendChatMessage = (messageInput) => {
        if (!messageInput.trim()) return;
        socketRef.current.emit("chat-message", messageInput, username);
    };

    const disconnect = () => {
        if (socketRef.current) socketRef.current.disconnect();
        Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
        peerConnectionsRef.current = {};
    };

    return {
        connect,
        disconnect,
        sendChatMessage,
        peerConnectionsRef,
        socketRef,
        remoteStreams,
        remoteUsers,
        messages,
        streamTypes // NEW: Expose this to use in the parent component
    };
}