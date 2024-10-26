"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./youtube-player.module.css";

// グローバル型定義
declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

// インターフェース定義（前と同じ）
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

// YouTubePlayerコンテキストの型定義
interface YouTubePlayerContextType {
  player: YouTubePlayer | null;
  loadVideo: (videoId: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

export function YoutubePlayer() {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // プレーヤーの制御メソッド
  const loadVideo = (videoId: string, startSeconds?: number) => {
    if (player) {
      player.loadVideoById(videoId, startSeconds);
    }
  };

  const playVideo = () => {
    if (player) {
      player.playVideo();
    }
  };

  const pauseVideo = () => {
    if (player) {
      player.pauseVideo();
    }
  };

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) {
        const newPlayer = new window.YT.Player(playerRef.current, {
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

        setPlayer(newPlayer);
        // グローバル変数を使用する代わりに、playerステートを使用
        if (typeof window !== "undefined") {
          // window.youtubePlayerの代わりにplayerステートを使用
          window.youtubePlayer = newPlayer; // 後方互換性のために残す
        }
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

// プレーヤーのメソッドをエクスポート
export const useYouTubePlayer = () => {
  const player = window.youtubePlayer;
  return {
    loadVideo: (videoId: string, startSeconds?: number) => {
      player?.loadVideoById(videoId, startSeconds);
    },
    playVideo: () => {
      player?.playVideo();
    },
    pauseVideo: () => {
      player?.pauseVideo();
    },
  };
};
