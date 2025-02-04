"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./clock.module.css"; // Styl zegara analogowego

export default function ProductionCalculator() {
  const [productionStart, setProductionStart] = useState(null);
  const [productionEnd, setProductionEnd] = useState(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [zmiana, setZmiana] = useState("1");
  const [numerNaWozku, setNumerNaWozku] = useState("");
  const [numerSamochodu, setNumerSamochodu] = useState("");
  const [czasProdukcji, setCzasProdukcji] = useState(null);
  const [czasZakonczenia, setCzasZakonczenia] = useState(null);
  const [aktualnyCzas, setAktualnyCzas] = useState(new Date());
  const [czyPrzerwa, setCzyPrzerwa] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Efekt ładowania
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Aktualizacja czasu co sekundę
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setAktualnyCzas(now);
      const godzina = now.getHours();
      const minuta = now.getMinutes();
      setCzyPrzerwa(jestPrzerwa(godzina, minuta));
    }, 1000);
    return () => clearInterval(interval);
  }, [zmiana]);

  // Powiadomienie przeglądarkowe przy zakończeniu produkcji
  useEffect(() => {
    if (productionEnd && !notificationSent) {
      if (aktualnyCzas.getTime() >= productionEnd.getTime()) {
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Produktion abgeschlossen", {
              body: "Twoja produkcja dobiegła końca.",
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification("Produktion abgeschlossen", {
                  body: "Twoja produkcja dobiegła końca.",
                });
              }
            });
          }
        }
        setNotificationSent(true);
      }
    }
  }, [aktualnyCzas, productionEnd, notificationSent]);

  const jestPrzerwa = (godzina, minuta) => {
    if (zmiana === "1") {
      return (
        (godzina === 8 && minuta >= 0 && minuta < 30) ||
        (godzina === 10 && minuta >= 45) ||
        (godzina === 11 && minuta < 21) ||
        (godzina === 13 && minuta < 13)
      );
    } else if (zmiana === "2") {
      return (
        (godzina === 16 && minuta >= 45) ||
        (godzina === 19 && minuta < 30) ||
        (godzina === 21 && minuta < 13)
      );
    } else if (zmiana === "3") {
      return (
        (godzina === 23 && minuta >= 45 && minuta < 60) ||
        (godzina === 2 && minuta >= 0 && minuta < 28) ||
        (godzina === 4 && minuta >= 30 && minuta < 45)
      );
    }
    return false;
  };

  const obliczCzasProdukcji = () => {
    setNotificationSent(false);

    const numerNaWozkuInt = parseInt(numerNaWozku, 10);
    const numerSamochoduInt = parseInt(numerSamochodu, 10);
    const pozostaleBaterie = numerNaWozkuInt - numerSamochoduInt;

    const mnoznikCzasu = zmiana === "3" ? 2.37 : 1.4;
    const czasTrwaniaProdukcji = pozostaleBaterie * mnoznikCzasu;
    const zaokraglonyCzasTrwaniaProdukcji = Math.round(czasTrwaniaProdukcji);
    let czasProdukcjiLokalny = new Date();

    let minutyProdukcji = zaokraglonyCzasTrwaniaProdukcji;
    while (minutyProdukcji > 0) {
      czasProdukcjiLokalny.setMinutes(czasProdukcjiLokalny.getMinutes() + 1);
      const godzina = czasProdukcjiLokalny.getHours();
      const minuta = czasProdukcjiLokalny.getMinutes();

      if (!jestPrzerwa(godzina, minuta)) {
        minutyProdukcji--;
      }
    }

    setCzasProdukcji(zaokraglonyCzasTrwaniaProdukcji);
    setCzasZakonczenia(
      `${czasProdukcjiLokalny
        .getHours()
        .toString()
        .padStart(2, "0")}:${czasProdukcjiLokalny
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );
    setProductionStart(new Date());
    setProductionEnd(czasProdukcjiLokalny);
  };

  const getClockHandStyle = (value, range) => {
    const rotation = (value / range) * 360;
    return {
      transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
    };
  };

  const progress =
    productionStart && productionEnd
      ? Math.min(
          ((aktualnyCzas - productionStart) /
            (productionEnd - productionStart)) *
            100,
          100
        )
      : 0;

  const getProgressBarColor = () => {
    if (progress >= 90) return "#ff4d4d";
    if (progress >= 60) return "#ffcc00";
    if (progress >= 15) return "#ffff66";
    return "#66ff66";
  };

  // Ustaw klasę "dark" na <body> w zależności od darkMode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Image
          src="/logo.png"
          alt="Logo"
          width={140}
          height={140}
          className="mb-4"
        />
        <p className="text-lg font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Przełącznik trybu jasnego/ciemnego jako ikona */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 text-2xl"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <Image
        src="/logo.png"
        alt="Logo"
        width={110}
        height={110}
        className="mb-4"
      />
      <h1 className="title">Produktionszeitrechner</h1>

      {/* Analoge Uhr */}
      <div className={styles.clockContainer}>
        <div className={styles.clock}>
          <div
            className={`${styles.needle} ${styles.hour}`}
            style={getClockHandStyle(aktualnyCzas.getHours() % 12, 12)}
          />
          <div
            className={`${styles.needle} ${styles.minute}`}
            style={getClockHandStyle(aktualnyCzas.getMinutes(), 60)}
          />
          <div
            className={`${styles.needle} ${styles.second}`}
            style={getClockHandStyle(aktualnyCzas.getSeconds(), 60)}
          />
          <div className={styles.centerPoint}></div>
        </div>
        <div className={styles.time}>
          {aktualnyCzas.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className={styles.date}>
          {aktualnyCzas.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Formularz */}
      <div className="container">
        <label className="block mb-4">
          <span className="text-gray-800 font-medium">Wähle die Schicht:</span>
          <select
            value={zmiana}
            onChange={(e) => setZmiana(e.target.value)}
            className="mt-2 p-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring focus:ring-gray-600 text-black bg-white"
          >
            <option value="1">1 Schicht</option>
            <option value="2">2 Schicht</option>
            <option value="3">3 Schicht</option>
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-gray-800 font-medium">
            Takt des letzten Materials auf dem Wagen:
          </span>
          <input
            type="number"
            value={numerNaWozku}
            onChange={(e) => setNumerNaWozku(e.target.value)}
            className="mt-2 p-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring focus:ring-gray-600 text-black bg-white"
            placeholder="Geben Sie die Nummer am Wagen ein"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-800 font-medium">
            Nummer des aktuellen Fahrzeugs auf der Linie:
          </span>
          <input
            type="number"
            value={numerSamochodu}
            onChange={(e) => setNumerSamochodu(e.target.value)}
            className="mt-2 p-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring focus:ring-gray-600 text-black bg-white"
            placeholder="Geben Sie die Autonummer ein"
          />
        </label>

        <button
          onClick={obliczCzasProdukcji}
          className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition duration-300"
        >
          Berechnen Sie die Produktionszeit
        </button>
      </div>

      {/* Wynik */}
      {czasProdukcji !== null && (
        <div className="result mt-6">
          <p className="text-lg">
            <span className="font-semibold">Produktionsdauer:</span>{" "}
            {czasProdukcji} Minuten
          </p>
          <p className="text-lg">
            <span className="font-semibold">Voraussichtliche Endzeit:</span>{" "}
            {czasZakonczenia}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {productionStart && productionEnd && (
        <div className="mt-4 w-full">
          <p className="mb-2">Produktionsfortschritt:</p>
          <div className="w-full bg-gray-300 h-4 rounded">
            <div
              className="h-4 rounded"
              style={{
                width: `${progress}%`,
                backgroundColor: getProgressBarColor(),
              }}
            ></div>
          </div>
          <p className="mt-2 text-sm">{Math.round(progress)}%</p>
        </div>
      )}

      <footer className="footer mt-8">
        <p>
          &copy; 2025 My Production Audi Calculator. All rights reserved. |
          Developed by Szymon K | Version 2.3.0
        </p>
      </footer>
    </div>
  );
}
