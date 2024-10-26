"use client";

import { useEffect, useRef } from "react";
import styles from "./youtube-player.module.css";

// グローバル型定義
declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady?: () => void;
    youtubePlayer: YouTubePlayer;
  }
}

// インターフェース定義
interface YT {
  Player: new (elementId: string, options: PlayerOptions) => YouTubePlayer;
}

interface PlayerOptions {
  videoId: string;
  playerVars?: {
    start?: number;
    rel?: number;
    controls?: number;
    hl?: string;
    loop?: number;
  };
  events: {
    onReady?: (event: { target: YouTubePlayer }) => void;
  };
}

interface YouTubePlayer {
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

export function YoutubePlayer() {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // プレーヤーのコンテナに一意のIDを設定
    if (playerRef.current) {
      playerRef.current.id = "youtube-player-container";
    }

    window.onYouTubeIframeAPIReady = () => {
      // IDを使用してプレーヤーを初期化
      const newPlayer = new window.YT.Player("youtube-player-container", {
        videoId: "PKFZ4ho67Cg",
        playerVars: {
          start: 120,
          rel: 0,
          controls: 0,
          hl: "en",
          loop: 1,
        },
        events: {
          onReady: onPlayerReady,
        },
      });

      if (typeof window !== "undefined") {
        window.youtubePlayer = newPlayer;
      }
    };

    function onPlayerReady(event: { target: YouTubePlayer }) {
      event.target.playVideo();
    }

    return () => {
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);

  return (
    <div className={styles["video-container"]}>
      <div ref={playerRef} className="w-full"></div>
    </div>
  );
}
