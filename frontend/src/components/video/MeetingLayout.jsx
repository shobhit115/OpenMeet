import React, { useMemo } from "react";
import LocalVideo from "./LocalVideo";
import LocalScreen from "./LocalScreen";
import RemoteVideo from "./RemoteVideo";

export default function MeetingLayout({
    pinnedId,
    handlePin,
    remoteStreams,
    remoteUsers,
    streamTypes,
    localVideoProps,
    localScreenProps
}) {
    const totalParticipantsCount = 1 + (localScreenProps.screenState ? 1 : 0) + remoteStreams.length;

    const gridLayoutClass = useMemo(() => {
        if (totalParticipantsCount === 1) return "grid-cols-1 grid-rows-1";
        if (totalParticipantsCount === 2) return "grid-cols-1 sm:grid-cols-2 grid-rows-1";
        if (totalParticipantsCount <= 4) return "grid-cols-2 grid-rows-2";
        if (totalParticipantsCount <= 6) return "grid-cols-2 sm:grid-cols-3 grid-rows-2";
        return "grid-cols-3 sm:grid-cols-4 grid-rows-2 sm:grid-rows-3";
    }, [totalParticipantsCount]);

    const renderRemoteVideo = (peer, isPinned = false) => {
        const streamId = peer.stream?.id || 'no-stream';
        const isScreenShare = streamTypes && streamTypes[streamId] === "presentation";
        
        return (
            <RemoteVideo 
                key={`remote-${peer.socketId}-${streamId}`} 
                stream={peer.stream} 
                username={remoteUsers[peer.socketId]} 
                isPinned={isPinned} 
                isPresentation={isScreenShare}
                onPin={() => handlePin(`${peer.socketId}-${streamId}`)} 
            />
        );
    };

    if (pinnedId) {
        return (
            <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
                {/* Main Pinned View */}
                <div className="flex-[3] h-full overflow-hidden rounded-2xl relative">
                    {pinnedId === 'local' && <LocalVideo {...localVideoProps} isPinned={true} />}
                    {pinnedId === 'local-screen' && <LocalScreen {...localScreenProps} isPinned={true} />}
                    {remoteStreams.map(peer => {
                        const streamId = peer.stream?.id || 'no-stream';
                        if (`${peer.socketId}-${streamId}` === pinnedId) return renderRemoteVideo(peer, true);
                        return null;
                    })}
                </div>
                
                {/* Sidebar Grid */}
                <div className="flex-1 flex lg:flex-col overflow-x-auto lg:overflow-y-auto gap-3 pb-2 lg:pb-0 scrollbar-hide lg:max-w-xs">
                    {pinnedId !== 'local' && (
                        <div className="min-w-[200px] lg:min-w-0 lg:h-48 flex-shrink-0">
                            <LocalVideo {...localVideoProps} isSidebarItem={true} />
                        </div>
                    )}
                    {localScreenProps.screenState && pinnedId !== 'local-screen' && (
                        <div className="min-w-[200px] lg:min-w-0 lg:h-48 flex-shrink-0">
                            <LocalScreen {...localScreenProps} />
                        </div>
                    )}
                    {remoteStreams.map(peer => {
                        const streamId = peer.stream?.id || 'no-stream';
                        if (`${peer.socketId}-${streamId}` !== pinnedId) {
                            return (
                                <div key={`side-${peer.socketId}`} className="min-w-[200px] lg:min-w-0 lg:h-48 flex-shrink-0">
                                    {renderRemoteVideo(peer)}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <div className={`w-full h-full grid gap-3 lg:gap-4 ${gridLayoutClass}`}>
            <div className="w-full h-full">
                <LocalVideo {...localVideoProps} />
            </div>
            
            {localScreenProps.screenState && (
                <div className="w-full h-full">
                    <LocalScreen {...localScreenProps} />
                </div>
            )}

            {remoteStreams.map(peer => (
                <div key={`grid-${peer.socketId}`} className="w-full h-full">
                    {renderRemoteVideo(peer)}
                </div>
            ))}
        </div>
    );
}