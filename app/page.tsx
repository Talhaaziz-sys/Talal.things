"use client";

import CameraComponent from "@/app/components/CameraComponent";
import { Bot, Rocket, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

type SparkResponse = {
  object: string;
  fact: string;
  big_word: string;
  question: string;
  mission: string;
};

const STORAGE_KEY = "talal_things_trophy_room";

export default function Home() {
  const [scanResult, setScanResult] = useState<SparkResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [trophies, setTrophies] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as string[];
      setTrophies(Array.isArray(parsed) ? parsed : []);
    } catch {
      setTrophies([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trophies));
  }, [trophies]);

  const handleCapture = async (imageDataUrl: string) => {
    setError("");
    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/spark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });
      const data = (await res.json()) as SparkResponse | { error?: string };

      if (!res.ok || "error" in data) {
        throw new Error((data as { error?: string }).error || "Scan failed");
      }

      const parsed = data as SparkResponse;
      setScanResult(parsed);
      if (parsed.object) {
        setTrophies((prev) =>
          prev.includes(parsed.object) ? prev : [parsed.object, ...prev].slice(0, 24),
        );
      }
    } catch {
      setError("Spark lost signal. Try one more time!");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-5">
      <header className="panel-glow rounded-3xl bg-[#21114b] p-5">
        <div className="flex items-center gap-3">
          <Rocket className="text-[#15e9ff]" size={30} />
          <h1 className="text-3xl font-black tracking-wide text-[#ffef64]">Talal.things</h1>
        </div>
        <p className="mt-2 text-lg font-bold text-[#d7f7ff]">Spark Eye Mission</p>
      </header>

      <CameraComponent onCapture={handleCapture} />

      <section className="panel-glow rounded-3xl bg-[#1e0f45] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Bot className="text-[#15e9ff]" size={24} />
          <h2 className="text-2xl font-black text-[#ffef64]">Mission Control</h2>
        </div>

        {isScanning && (
          <div className="rounded-2xl bg-[#0a1638] p-4 text-center text-2xl font-black text-[#15e9ff]">
            Scanning
            <span className="scan-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        )}

        {error && !isScanning && (
          <div className="rounded-2xl bg-[#3a1030] p-4 text-lg font-black text-[#ffd1f0]">
            {error}
          </div>
        )}

        {scanResult && !isScanning && (
          <div className="space-y-3 text-lg font-bold text-[#eaf8ff]">
            <p className="rounded-2xl bg-[#0a1638] p-3">
              <span className="text-[#15e9ff]">Object:</span> {scanResult.object}
            </p>
            <p className="rounded-2xl bg-[#0a1638] p-3">
              <span className="text-[#15e9ff]">Fun Fact:</span> {scanResult.fact}
            </p>
            <p className="rounded-2xl bg-[#0a1638] p-3">
              <span className="text-[#15e9ff]">Big Word:</span> {scanResult.big_word}
            </p>
            <p className="rounded-2xl bg-[#0a1638] p-3">
              <span className="text-[#15e9ff]">Question:</span> {scanResult.question}
            </p>
            <p className="rounded-2xl bg-[#0a1638] p-3">
              <span className="text-[#15e9ff]">Mission:</span> {scanResult.mission}
            </p>
          </div>
        )}
      </section>

      <section className="panel-glow rounded-3xl bg-[#101c3d] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="text-[#ffef64]" size={24} />
          <h2 className="text-2xl font-black text-[#15e9ff]">Trophy Room</h2>
        </div>
        {trophies.length === 0 ? (
          <p className="rounded-2xl bg-[#0a1638] p-3 text-lg font-black text-[#d7f7ff]">
            No trophies yet. Snap your first object!
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {trophies.map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-[#15e9ff] px-3 py-2 text-center text-lg font-black text-[#05112a]"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
