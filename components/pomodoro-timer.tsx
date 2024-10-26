"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YoutubePlayer } from "@/components/youtube-player";
import styles from "./pomodoro-timer.module.css";
import Image from "next/image";

export function PomodoroTimerComponent() {
  // ポモドーロ時間（分）を管理する状態変数。初期値はnullで、localStorageから読み込まれた値またはデフォルト値で初期化されます。
  const [pomodoroTime, setPomodoroTime] = useState<number | null>(null);
  // 短い休憩時間（分）を管理する状態変数。初期値はnullで、localStorageから読み込まれた値またはデフォルト値で初期化されます。
  const [shortBreakTime, setShortBreakTime] = useState<number | null>(null);
  // 長い休憩時間（分）を管理する状態変数。初期値はnullで、localStorageから読み込まれた値またはデフォルト値で初期化されます。
  const [longBreakTime, setLongBreakTime] = useState<number | null>(null);
  // 残り時間（秒）を管理する状態変数。初期値はnullで、ポモドーロ時間に基づいて初期化されます。
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  // タイマーがアクティブかどうかを管理する状態変数。
  const [isActive, setIsActive] = useState(false);
  // 現在のモード（"pomodoro"、"shortBreak"、"longBreak"）を管理する状態変数。
  const [currentMode, setCurrentMode] = useState("pomodoro");
  // 完了したポモドーロの数を管理する状態変数。4回ごとに長い休憩に入ります。
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // 通知音の再生に使用されるAudio要素への参照。
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // サムネイルの表示状態を管理する状態変数を追加
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(true);

  // タブ状態
  const [currentTab, setCurrentTab] = useState("timer"); // Add new state variable

  // audioRefを初期化するためのuseEffectフック。コンポーネントがマウントされたときに一度だけ実行されます。
  useEffect(() => {
    // notification.mp3ファイルをロードしてAudioオブジェクトを作成します。
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  // 通知音を再生する関数。
  const playNotificationSound = () => {
    if (audioRef.current) {
      // audioRef.currentが存在する場合、再生を試みます。
      // エラーが発生した場合、コンソールにエラーメッセージを出力します。
      audioRef.current
        .play()
        .catch((error) => console.error("音声の再生に失敗しました:", error));
    }
  };

  // タイマーの初期状態を設定するためのuseEffectフック。コンポーネントがマウントされたときに一度だけ実行されます。
  useEffect(() => {
    // localStorageから保存されたポモドーロ時間、短い休憩時間、長い休憩時間を読み込みます。
    // 値が存在しない場合は、デフォルト値を使用します。
    const savedPomodoroTime = localStorage.getItem("pomodoroTime");
    const initialPomodoroTime = savedPomodoroTime
      ? Number(savedPomodoroTime)
      : // : 25;
        //  test用
        1;
    setPomodoroTime(initialPomodoroTime);
    setTimeLeft(initialPomodoroTime * 60);

    const savedShortBreakTime = localStorage.getItem("shortBreakTime");
    // setShortBreakTime(savedShortBreakTime ? Number(savedShortBreakTime) : 5);
    //  test用
    setShortBreakTime(savedShortBreakTime ? Number(savedShortBreakTime) : 1);

    const savedLongBreakTime = localStorage.getItem("longBreakTime");
    // setLongBreakTime(savedLongBreakTime ? Number(savedLongBreakTime) : 15);
    //  test用
    setLongBreakTime(savedLongBreakTime ? Number(savedLongBreakTime) : 2);
  }, []);

  // タイマーを更新するためのuseEffectフック。isActive、timeLeft、currentMode、pomodoroTime、shortBreakTime、longBreakTime、pomodoroCountのいずれかが変更されたときに実行されます。
  useEffect(() => {
    // タイマーを更新するためのsetIntervalのIDを格納する変数。
    let interval: NodeJS.Timeout | null = null;

    // タイマーがアクティブで、残り時間が0より大きい場合、setIntervalを設定します。
    if (isActive && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        // 1秒ごとに残り時間を減らします。
        setTimeLeft((timeLeft) => (timeLeft !== null ? timeLeft - 1 : 0));
        // 残り時間が3秒になったら通知音を再生します。
        if (timeLeft === 3) {
          playNotificationSound();
        }
      }, 1000);
    } else if (timeLeft === 0) {
      // 残り時間が0になったら、タイマーを停止し、通知音を再生します。
      setIsActive(false);
      playNotificationSound();

      // 現在のモードに応じて、次のモードと残り時間を設定します。
      if (currentMode === "pomodoro") {
        const nextPomodoroCount = pomodoroCount + 1;
        setPomodoroCount(nextPomodoroCount);

        if (nextPomodoroCount === 4) {
          setCurrentMode("longBreak");
          setTimeLeft(longBreakTime !== null ? longBreakTime * 60 : 0);
          setPomodoroCount(0);
        } else {
          setCurrentMode("shortBreak");
          setTimeLeft(shortBreakTime !== null ? shortBreakTime * 60 : 0);
        }
      } else {
        setCurrentMode("pomodoro");
        setTimeLeft(pomodoroTime !== null ? pomodoroTime * 60 : 0);
      }
      // 次のタイマーを開始します。
      setIsActive(true);
    }

    // コンポーネントがアンマウントされたとき、または依存関係が変更されたときに、setIntervalをクリアします。
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isActive,
    timeLeft,
    currentMode,
    pomodoroTime,
    shortBreakTime,
    longBreakTime,
    pomodoroCount,
  ]);

  // 設定をlocalStorageに保存するためのuseEffectフック。pomodoroTime、shortBreakTime、longBreakTimeのいずれかが変更されたときに実行されます。
  useEffect(() => {
    if (pomodoroTime !== null) {
      localStorage.setItem("pomodoroTime", pomodoroTime.toString());
    }
    if (shortBreakTime !== null) {
      localStorage.setItem("shortBreakTime", shortBreakTime.toString());
    }
    if (longBreakTime !== null) {
      localStorage.setItem("longBreakTime", longBreakTime.toString());
    }
  }, [pomodoroTime, shortBreakTime, longBreakTime]);

  // YouTubeプレーヤーを制御するためのuseEffectフック。currentModeが変更されたときに実行されます。
  useEffect(() => {
    if (typeof window !== "undefined" && window.youtubePlayer) {
      if (currentMode === "pomodoro") {
        window.youtubePlayer.loadVideoById("PKFZ4ho67Cg", 120);
      } else if (currentMode === "shortBreak") {
        window.youtubePlayer.loadVideoById("OVct34NUk3U", 210);
      } else if (currentMode === "longBreak") {
        window.youtubePlayer.loadVideoById("2eQEHsGxbEo", 360);
      }
    }
  }, [currentMode]);

  // タイマーを開始/停止する関数。
  const toggleTimer = () => {
    const nextIsActive = !isActive;
    setIsActive(nextIsActive);

    // 初回のStartクリック時にサムネイルを非表示にする
    if (nextIsActive && isThumbnailVisible) {
      setIsThumbnailVisible(false);
    }

    // タイマーが開始/停止されたときにYouTubeプレーヤーを制御します。
    if (typeof window !== "undefined" && window.youtubePlayer) {
      if (nextIsActive) {
        window.youtubePlayer.playVideo(); // 再生を開始
      } else {
        // window.youtubePlayer.pauseVideo(); // 一時停止
      }
    }
  };

  // タイマーをリセットする関数。
  const resetTimer = () => {
    setIsActive(false);
    if (currentMode === "pomodoro") {
      setTimeLeft(pomodoroTime !== null ? pomodoroTime * 60 : 0);
    } else if (currentMode === "shortBreak") {
      setTimeLeft(shortBreakTime !== null ? shortBreakTime * 60 : 0);
    } else {
      setTimeLeft(longBreakTime !== null ? longBreakTime * 60 : 0);
    }
  };

  // 秒数をmm:ss形式にフォーマットする関数。
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 設定を更新する関数。
  const updateSettings = () => {
    setIsActive(false);
    if (currentMode === "pomodoro") {
      setTimeLeft(pomodoroTime !== null ? pomodoroTime * 60 : 0);
    } else if (currentMode === "shortBreak") {
      setTimeLeft(shortBreakTime !== null ? shortBreakTime * 60 : 0);
    } else {
      setTimeLeft(longBreakTime !== null ? longBreakTime * 60 : 0);
    }

    setCurrentTab("timer"); // Add this line to switch to the 'timer' tab
  };

  if (timeLeft === null) {
    return null; // またはローディングスピナー
  }

  return (
    <>
      <div className={styles["container"]}>
        <div className={styles["box-01"]}>
          <div className={styles["hd-01"]}>
            波<br />
            集中力
            <br />
            時間管理
          </div>
          <div className={styles["hd-01-sub-01"]}>
            Extend the Pomodoro timer with <br />
            visual and auditory elements
          </div>
          {/* <Tabs defaultValue="timer"> */}
          <Tabs
            defaultValue={currentTab}
            value={currentTab}
            onValueChange={setCurrentTab}
          >
            {/* <TabsList className="grid w-full grid-cols-2"> */}
            <TabsList className={`${styles["tab-01"]} grid w-full grid-cols-2`}>
              <TabsTrigger value="timer">Timer</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="timer">
              <div className="flex flex-col items-center">
                <div className="text-6xl text-white">
                  {formatTime(timeLeft)}
                </div>
                <div className={`${styles["label-01"]} mt-2`}>Status</div>
                <div className="text-xl text-white">
                  {currentMode === "pomodoro"
                    ? "Pomodoro " + (pomodoroCount + 1)
                    : currentMode === "shortBreak"
                    ? "Short break " + pomodoroCount
                    : "Long break"}
                </div>
                <div className="space-x-2 mt-3">
                  <Button onClick={toggleTimer} className="bg-slate-800">
                    {isActive ? "Pause" : "Start"}
                  </Button>
                  <Button onClick={resetTimer} className="bg-slate-600">
                    Reset
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="space-y-4">
                <div className="">
                  <Label htmlFor="pomodoro-time" className="text-white">
                    Pomodoro time (minutes)
                  </Label>
                  <Input
                    id="pomodoro-time"
                    type="number"
                    value={pomodoroTime}
                    onChange={(e) => setPomodoroTime(Number(e.target.value))}
                  />
                </div>
                <div className="">
                  <Label htmlFor="short-break-time" className="text-white">
                    Short break time (minutes)
                  </Label>
                  <Input
                    id="short-break-time"
                    type="number"
                    value={shortBreakTime}
                    onChange={(e) => setShortBreakTime(Number(e.target.value))}
                  />
                </div>
                <div className="">
                  <Label htmlFor="long-break-time" className="text-white">
                    Long break time (minutes)
                  </Label>
                  <Input
                    id="long-break-time"
                    type="number"
                    value={longBreakTime}
                    onChange={(e) => setLongBreakTime(Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <Button onClick={updateSettings}>Update</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div
        className={`${styles["thumbnail"]} ${
          !isThumbnailVisible ? "fadeout" : ""
        }`}
      >
        <Image
          src="/2024-10-25.png"
          width={500}
          height={500}
          objectFit="contain"
          alt="img"
        />
      </div>

      <YoutubePlayer />
    </>
  );
}
