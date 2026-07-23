import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAuth } from "../contexts/AuthContext";
import { useWebRTC } from "../hooks/useWebRTC";

import LobbyScreen from "../components/video/LobbyScreen";
import RemoteVideo from "../components/video/RemoteVideo";
import ChatDrawer from "../components/video/ChatDrawer";
import ControlBar from "../components/video/ControlBar";

export default function VideoMeet() {
    const { showMessage } = useSnackbar();
    const { userData } = useAuth();

    const localVideoRef = useRef(null);
    const lobbyVideoRef = useRef(null);

    const [videoAvailable, setVideoAvailable] = useState(false);
    const [audioAvailable, setAudioAvailable] = useState(false);
    const [videoState, setVideoState] = useState(true);
    const [audioState, setAudioState] = useState(true);
    const [screenState, setScreenState] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);

    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState(userData?.name || userData?.username || "");

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("chat");
    const [unreadCount, setUnreadCount] = useState(0);
    const [messageInput, setMessageInput] = useState("");

    const [pinnedId, setPinnedId] = useState(null); 

    const roomPath = window.location.pathname;
    const { connect, disconnect, sendChatMessage, peerConnectionsRef, remoteStreams, remoteUsers, messages } = useWebRTC(roomPath, username, showMessage);

    const toggleChatTab = () => {
        if (isDrawerOpen && activeTab === 'chat') setIsDrawerOpen(false);
        else { setActiveTab("chat"); setIsDrawerOpen(true); }
    };

    const togglePeopleTab = () => {
        if (isDrawerOpen && activeTab === 'people') setIsDrawerOpen(false);
        else { setActiveTab("people"); setIsDrawerOpen(true); }
    };

    const handlePin = (id) => setPinnedId(prev => prev === id ? null : id);

    useEffect(() => {
        const getPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                window.localStream = stream;

                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = stream;

                setVideoAvailable(true);
                setAudioAvailable(true);
            } catch (err) {
                console.error("Permissions denied or devices missing", err);
                setVideoAvailable(false);
                setAudioAvailable(false);
                setVideoState(false);
                setAudioState(false);
                showMessage("Camera/Microphone permissions denied. Joining to watch only.", "error");
            }
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true);
        };
        getPermission();
    }, []);

    useEffect(() => {
        if (askForUsername && window.localStream && lobbyVideoRef.current) lobbyVideoRef.current.srcObject = window.localStream;
    }, [askForUsername]);

    useEffect(() => {
        if (!askForUsername && window.localStream && localVideoRef.current && videoState) localVideoRef.current.srcObject = window.localStream;
    }, [askForUsername, videoState]);

    useEffect(() => {
        if (isDrawerOpen && activeTab === 'chat') setUnreadCount(0);
    }, [isDrawerOpen, activeTab]);

    useEffect(() => {
        if ((!isDrawerOpen || activeTab !== 'chat') && messages.length > 0) setUnreadCount(prev => prev + 1);
    }, [messages.length]);

    useEffect(() => {
        if (pinnedId && pinnedId !== 'local' && !remoteUsers[pinnedId]) setPinnedId(null);
    }, [remoteUsers, pinnedId]);

    const connectToMeeting = () => {
        if (!username.trim()) { showMessage("Please enter a username", "error"); return; }
        setAskForUsername(false);
        connect();
    };

    const toggleAudio = () => {
        if (window.localStream && audioAvailable) {
            const track = window.localStream.getAudioTracks()[0];
            if (track) { track.enabled = !audioState; setAudioState(!audioState); }
        }
    };

    const toggleVideo = () => {
        if (window.localStream && videoAvailable) {
            const track = window.localStream.getVideoTracks()[0];
            if (track) { track.enabled = !videoState; setVideoState(!videoState); }
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!screenState) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const videoTrack = screenStream.getVideoTracks()[0];
                Object.values(peerConnectionsRef.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) sender.replaceTrack(videoTrack);
                });
                videoTrack.onended = stopScreenShare;
                if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
                setScreenState(true);
            } else {
                stopScreenShare();
            }
        } catch (error) {
            console.error("Screen share cancelled", error);
        }
    };

    const stopScreenShare = () => {
        if (window.localStream && videoAvailable) {
            const videoTrack = window.localStream.getVideoTracks()[0];
            Object.values(peerConnectionsRef.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender && videoTrack) sender.replaceTrack(videoTrack);
            });
            if (localVideoRef.current) localVideoRef.current.srcObject = window.localStream;
        }
        setScreenState(false);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        sendChatMessage(messageInput);
        setMessageInput("");
    };

    const leaveMeeting = () => {
        if (window.localStream) window.localStream.getTracks().forEach(track => track.stop());
        disconnect();
        window.location.href = "/home";
    };

    const initial = username ? username.charAt(0).toUpperCase() : "U";
    const totalParticipantsCount = 1 + Object.keys(remoteUsers).length;

    // Dynamic grid that forces items to stretch properly
    const gridLayoutClass = useMemo(() => {
        if (totalParticipantsCount === 1) return "grid-cols-1 grid-rows-1";
        if (totalParticipantsCount === 2) return "grid-cols-1 sm:grid-cols-2 grid-rows-1";
        if (totalParticipantsCount <= 4) return "grid-cols-2 grid-rows-2";
        if (totalParticipantsCount <= 6) return "grid-cols-2 sm:grid-cols-3 grid-rows-2";
        return "grid-cols-3 sm:grid-cols-4 grid-rows-2 sm:grid-rows-3";
    }, [totalParticipantsCount]);

    const renderLocalVideo = (isSidebarItem = false) => {
        const isPinned = pinnedId === 'local';
        return (
            <div className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center w-full h-full group transition-all duration-300 ${
                isPinned && !isSidebarItem ? 'border-2 border-blue-500' : 'border border-gray-800'
            }`}>
                {videoAvailable && videoState ? (
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-white/10">
                            {initial}
                        </div>
                    </div>
                )}
                
                {/* Fixed z-index to z-[5] */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2 z-[5] shadow-md">
                    <span className="truncate max-w-[140px]">{username} (You)</span>
                </div>

                <div className={`absolute top-3 right-3 transition-opacity duration-200 flex items-center gap-2 z-[5] ${isPinned && !isSidebarItem ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button onClick={() => handlePin('local')} className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition flex items-center justify-center w-9 h-9 ${isPinned ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black/60 hover:bg-black/80'}`}>
                        {isPinned ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        ) : (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 256 256"><path d="M228.46,183.17c-8.91-17.72-27.18-29.23-45.71-33.39V64a34.75,34.75,0,0,0-10.18-24.57C165.73,32.61,156.45,28,146.61,28h-37.2c-9.84,0-19.12,4.61-25.95,11.44A34.75,34.75,0,0,0,73.28,64v85.78c-18.53,4.16-36.81,15.67-45.72,33.39a8,8,0,0,0,7.16,11.58H120v45.25a8,8,0,0,0,16,0V194.75h85.29A8,8,0,0,0,228.46,183.17Z" /></svg>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        // Changed to exactly h-screen to prevent any vertical scrolling
        <div className="h-screen w-full bg-[#313338] font-sans flex flex-col overflow-hidden text-white">
            {askForUsername ? (
                <LobbyScreen 
                    lobbyVideoRef={lobbyVideoRef}
                    videoAvailable={videoAvailable}
                    audioAvailable={audioAvailable}
                    videoState={videoState}
                    audioState={audioState}
                    toggleAudio={toggleAudio}
                    toggleVideo={toggleVideo}
                    username={username}
                    setUsername={setUsername}
                    connectToMeeting={connectToMeeting}
                />
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden h-full">
                    <div className="flex-1 flex flex-row overflow-hidden relative h-full">

                        {/* Added relative and z-0 here to trap absolute elements inside */}
                        <div className="flex-1 p-2 sm:p-4 overflow-hidden flex flex-col relative z-0 h-full">
                            
                            {pinnedId ? (
                                <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
                                    <div className="flex-1 h-full min-h-[40vh] flex items-center justify-center">
                                        <div className="w-full h-full">
                                            {pinnedId === 'local' 
                                                ? renderLocalVideo() 
                                                : remoteStreams.filter(p => p.socketId === pinnedId).map(peer => (
                                                    <RemoteVideo key={peer.socketId} stream={peer.stream} username={remoteUsers[peer.socketId]} isPinned={true} onPin={() => handlePin(peer.socketId)} />
                                                ))
                                            }
                                        </div>
                                    </div>
                                    
                                    <div className="w-full lg:w-64 xl:w-80 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden pb-2 lg:pb-0 pr-2">
                                        {pinnedId !== 'local' && (
                                            <div className="w-48 lg:w-full h-32 lg:h-48 flex-shrink-0">
                                                {renderLocalVideo(true)}
                                            </div>
                                        )}
                                        {remoteStreams.filter(p => p.socketId !== pinnedId).map(peer => (
                                            <div key={peer.socketId} className="w-48 lg:w-full h-32 lg:h-48 flex-shrink-0">
                                                <RemoteVideo stream={peer.stream} username={remoteUsers[peer.socketId]} isPinned={false} onPin={() => handlePin(peer.socketId)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Grid uses h-full and w-full heavily to maximize the area */
                                <div className={`w-full h-full grid gap-3 lg:gap-4 ${gridLayoutClass}`}>
                                    <div className="w-full h-full">
                                        {renderLocalVideo()}
                                    </div>
                                    {remoteStreams.map((peer) => (
                                        <div key={peer.socketId} className="w-full h-full">
                                            <RemoteVideo stream={peer.stream} username={remoteUsers[peer.socketId]} isPinned={false} onPin={() => handlePin(peer.socketId)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ensure your ChatDrawer component has a high z-index (e.g., z-50) internally if it overlaps */}
                        <ChatDrawer
                            isDrawerOpen={isDrawerOpen}
                            setIsDrawerOpen={setIsDrawerOpen}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            messages={messages}
                            username={username}
                            messageInput={messageInput}
                            setMessageInput={setMessageInput}
                            sendMessage={handleSendMessage}
                            remoteUsers={remoteUsers}
                            remoteStreams={remoteStreams}
                            audioState={audioState}
                            videoState={videoState}
                        />
                    </div>

                    <ControlBar
                        audioState={audioState}
                        videoState={videoState}
                        screenState={screenState}
                        audioAvailable={audioAvailable}
                        videoAvailable={videoAvailable}
                        screenAvailable={screenAvailable}
                        unreadCount={unreadCount}
                        participantsCount={totalParticipantsCount}
                        toggleAudio={toggleAudio}
                        toggleVideo={toggleVideo}
                        handleScreenShare={handleScreenShare}
                        isDrawerOpen={isDrawerOpen}
                        activeTab={activeTab}
                        toggleChatTab={toggleChatTab}
                        togglePeopleTab={togglePeopleTab}
                        leaveMeeting={leaveMeeting}
                    />
                </div>
            )}
        </div>
    );
}