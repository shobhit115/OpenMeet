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
    
    // Screen sharing states
    const [screenState, setScreenState] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [localScreenStream, setLocalScreenStream] = useState(null);

    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState(userData?.name || userData?.username || "");

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("chat");
    const [unreadCount, setUnreadCount] = useState(0);
    const [messageInput, setMessageInput] = useState("");

    const [pinnedId, setPinnedId] = useState(null); 

    const roomPath = window.location.pathname;
    const { connect, disconnect, sendChatMessage, peerConnectionsRef, remoteStreams, remoteUsers, messages, streamTypes } = useWebRTC(roomPath, username, showMessage);
    
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
        if (!askForUsername && window.localStream && localVideoRef.current && videoState) {
            localVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername, videoState]);

    useEffect(() => {
        if (isDrawerOpen && activeTab === 'chat') setUnreadCount(0);
    }, [isDrawerOpen, activeTab]);

    useEffect(() => {
        if ((!isDrawerOpen || activeTab !== 'chat') && messages.length > 0) setUnreadCount(prev => prev + 1);
    }, [messages.length]);

    // Unpin a remote user if they leave the meeting
    useEffect(() => {
        if (pinnedId && pinnedId !== 'local' && pinnedId !== 'local-screen') {
            const isPinnedUserStillPresent = remoteStreams.some(peer => {
                const streamId = peer.stream?.id || 'no-stream';
                return `${peer.socketId}-${streamId}` === pinnedId;
            });

            if (!isPinnedUserStillPresent) {
                setPinnedId(null);
                showMessage("Pinned user left the meeting", "info");
            }
        }
    }, [remoteStreams, pinnedId, showMessage]);

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
                
                setLocalScreenStream(screenStream);
                window.localScreenStream = screenStream;
                setScreenState(true);

                Object.keys(peerConnectionsRef.current).forEach(socketId => {
                    const pc = peerConnectionsRef.current[socketId];
                    if (pc.signalingState !== 'closed') {
                        pc.addTrack(videoTrack, screenStream);
                    }
                });

                videoTrack.onended = stopScreenShare;

                showMessage("You started sharing your screen", "info");
                sendChatMessage(`📢 ${username} started sharing their screen`);
            } else {
                stopScreenShare();
            }
        } catch (error) {
            console.error("Screen share cancelled", error);
        }
    };

    const stopScreenShare = () => {
        if (localScreenStream) {
            const screenTrack = localScreenStream.getVideoTracks()[0];
            
            Object.values(peerConnectionsRef.current).forEach(pc => {
                if (pc.signalingState !== 'closed') {
                    const sender = pc.getSenders().find(s => s.track === screenTrack);
                    if (sender) {
                        try { pc.removeTrack(sender); } catch (e) { console.error(e) }
                    }
                }
            });
            localScreenStream.getTracks().forEach(t => t.stop());
        }
        setLocalScreenStream(null);
        window.localScreenStream = null;
        setScreenState(false);

        showMessage("Screen sharing stopped", "info");
        sendChatMessage(`📢 ${username} stopped sharing their screen`);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        sendChatMessage(messageInput);
        setMessageInput("");
    };

    const leaveMeeting = () => {
        stopScreenShare();
        if (window.localStream) window.localStream.getTracks().forEach(track => track.stop());
        disconnect();
        window.location.href = "/home";
    };

    const initial = username ? username.charAt(0).toUpperCase() : "U";
    const totalParticipantsCount = 1 + (screenState ? 1 : 0) + remoteStreams.length;

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
            <div className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center w-full h-full group transition-all duration-300 cursor-pointer ${
                isPinned && !isSidebarItem ? 'border-2 border-blue-500' : 'border border-gray-800'
            }`} onClick={() => handlePin('local')}>
                {videoAvailable && videoState ? (
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-white/10">
                            {initial}
                        </div>
                    </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2 z-[5] shadow-md">
                    <span className="truncate max-w-[140px]">{username} (You)</span>
                </div>
            </div>
        );
    };

    const renderLocalScreen = () => {
        if (!screenState || !localScreenStream) return null;
        const isPinned = pinnedId === 'local-screen';
        return (
            <div className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center w-full h-full group transition-all duration-300 cursor-pointer ${
                isPinned ? 'border-2 border-blue-500' : 'border border-gray-800'
            }`} onClick={() => handlePin('local-screen')}>
                <video 
                    ref={video => { if (video && video.srcObject !== localScreenStream) video.srcObject = localScreenStream; }} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-contain" 
                />
                <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2 z-[5] shadow-md">
                    <span className="truncate max-w-[140px]">Your Presentation</span>
                </div>
            </div>
        );
    };

    return (
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
                        <div className="flex-1 p-2 sm:p-4 overflow-hidden flex flex-col relative z-0 h-full">
                            
                            {pinnedId ? (
                                <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
                                    
                                    {/* Main Pinned View */}
                                    <div className="flex-[3] h-full overflow-hidden rounded-2xl relative">
                                        {pinnedId === 'local' && renderLocalVideo()}
                                        {pinnedId === 'local-screen' && renderLocalScreen()}
                                        {remoteStreams.map(peer => {
                                            const streamId = peer.stream?.id || 'no-stream';
                                            const isScreenShare = streamTypes && streamTypes[streamId] === "presentation";
                                            if (`${peer.socketId}-${streamId}` === pinnedId) {
                                                return <RemoteVideo 
                                                    key={`pin-${peer.socketId}`} 
                                                    stream={peer.stream} 
                                                    username={remoteUsers[peer.socketId]} 
                                                    isPinned={true} 
                                                    isPresentation={isScreenShare}
                                                    onPin={() => handlePin(pinnedId)} 
                                                />;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    
                                    {/* Sidebar Grid with Unpinned Participants */}
                                    <div className="flex-1 flex lg:flex-col overflow-x-auto lg:overflow-y-auto gap-3 pb-2 lg:pb-0 scrollbar-hide lg:max-w-xs">
                                        {pinnedId !== 'local' && (
                                            <div className="min-w-[200px] lg:min-w-0 lg:h-48 flex-shrink-0">
                                                {renderLocalVideo(true)}
                                            </div>
                                        )}
                                        {screenState && pinnedId !== 'local-screen' && (
                                            <div className="min-w-[200px] lg:min-w-0 lg:h-48 flex-shrink-0">
                                                {renderLocalScreen()}
                                            </div>
                                        )}
                                        {remoteStreams.map(peer => {
                                            const streamId = peer.stream?.id || 'no-stream';
                                            const id = `${peer.socketId}-${streamId}`;
                                            const isScreenShare = streamTypes && streamTypes[streamId] === "presentation";
                                            if (id !== pinnedId) {
                                                return (
                                                    <div key={`side-${id}`} className="min-w-[200px] lg:min-w-0 lg:h-48 flex-shrink-0">
                                                        <RemoteVideo 
                                                            stream={peer.stream} 
                                                            username={remoteUsers[peer.socketId]} 
                                                            isPinned={false} 
                                                            isPresentation={isScreenShare}
                                                            onPin={() => handlePin(id)} 
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>

                                </div>
                            ) : (
                                <div className={`w-full h-full grid gap-3 lg:gap-4 ${gridLayoutClass}`}>
                                    <div className="w-full h-full">
                                        {renderLocalVideo()}
                                    </div>
                                    
                                    {screenState && (
                                        <div className="w-full h-full">
                                            {renderLocalScreen()}
                                        </div>
                                    )}

                                    {remoteStreams.map((peer) => {
                                        const streamId = peer.stream?.id || 'no-stream';
                                        const isScreenShare = streamTypes && streamTypes[streamId] === "presentation";
                                        return (
                                            <div key={`${peer.socketId}-${streamId}`} className="w-full h-full">
                                                <RemoteVideo 
                                                    stream={peer.stream} 
                                                    username={remoteUsers[peer.socketId]} 
                                                    isPinned={false} 
                                                    isPresentation={isScreenShare}
                                                    onPin={() => handlePin(`${peer.socketId}-${streamId}`)} 
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

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