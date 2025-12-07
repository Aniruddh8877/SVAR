"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");    // all committed text
  const [interimText, setInterimText] = useState(""); // live, in-progress text

  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US"; // change to "hi-IN" for Hindi

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalChunks: string[] = [];

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (result.isFinal) {
          finalChunks.push(transcript);
        } else {
          interim += transcript + " ";
        }
      }

      if (finalChunks.length > 0) {
        setFinalText(prev => (prev ? prev + "\n" : "") + finalChunks.join("\n"));
      }

      setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const handleStart = () => {
    if (!recognitionRef.current) return;
    setFinalText(prev => prev); // keep previous text
    setInterimText("");
    recognitionRef.current.start();
    setListening(true);
  };

  const handleStop = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
    setInterimText("");
  };

  const fullText = finalText + (interimText ? "\n" + interimText : "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-4 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Real-time Speech to Text
        </h1>

        {!supported ? (
          <p className="text-center text-sm text-red-500">
            Your browser does not support Speech Recognition (try Chrome).
          </p>
        ) : (
          <>
            <div className="mb-4 h-64 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 whitespace-pre-wrap">
              {fullText || "Press Start and begin speaking..."}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={listening ? handleStop : handleStart}
                className={`rounded-full px-6 py-2 text-sm font-medium text-white transition ${
                  listening
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {listening ? "Stop Listening" : "Start Listening"}
              </button>

              <button
                onClick={() => {
                  setFinalText("");
                  setInterimText("");
                }}
                className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Clear
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {listening ? "Listening…" : "Idle"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
