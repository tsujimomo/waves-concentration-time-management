"use client";

import { useEffect, useState } from "react";
import styles from "./youtube-player.module.css";

// グローバルウィンドウオブジェクトにYTとonYouTubeIframeAPIReadyを追加します。
declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

// YouTube Player API インターフェース（プレースホルダーをAPIドキュメントからの実際の型で置き換えてください）
interface YT {
  Player: new (elementId: string, options: PlayerOptions) => YouTubePlayer;
  // 必要に応じてYTオブジェクトの他のプロパティを追加します。PlayerStateChangeListenerなど
}

interface PlayerOptions {
  videoId: string;
  playerVars?: {
    start?: number;
    rel?: number;
    controls?: number;
    hl?: string;
    loop?: number;
    // ... その他のplayerVars
  };
  events: {
    onReady?: (event: { target: YouTubePlayer }) => void;
    // onStateChange?: (event: any) => void; // この型を調整する必要があるかもしれません
  };
}

// YouTube Player インターフェースを定義します（既知のプロパティで置き換えてください）
interface YouTubePlayer {
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  // その他必要なメソッドを追加
}

export function YoutubePlayer() {
  // YouTubeプレーヤーインスタンスの状態を管理します。
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  // コンポーネントがマウントされたときにYouTube IFrame APIをロードし、プレーヤーを初期化します。
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      // YouTubeプレーヤーを初期化します。
      const newPlayer = new window.YT.Player("player", {
        videoId: "PKFZ4ho67Cg", // デフォルトのビデオID
        playerVars: {
          // playerVarsを追加
          start: 120, // startパラメータで開始時間を設定
          rel: 0,
          controls: 0,
          hl: "en",
          loop: 1,
        },
        events: {
          onReady: onPlayerReady, // プレーヤーの準備ができたらonPlayerReady関数を呼び出します。
        },
      });

      // プレーヤーインスタンスを状態に設定します。
      setPlayer(newPlayer);
      // グローバル変数にプレーヤーインスタンスを設定します。
      if (typeof window !== "undefined") {
        window.youtubePlayer = newPlayer;
      }
    };

    // プレーヤーの準備ができたらビデオを再生します。
    function onPlayerReady(event: { target: YouTubePlayer }) {
      // イベントの型付け
      event.target.playVideo();
    }
  }, []);

  // 指定されたビデオIDでビデオを再生する関数です。
  // const playVideo = (videoId: string) => {
  //   if (player) {
  //     player.loadVideoById(videoId);
  //   }
  // };

  return (
    <>
      <div className={styles["video-container"]}>
        <div id="player" className="w-full"></div>
      </div>
    </>
  );
}
