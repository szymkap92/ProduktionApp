"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductionCalculator() {
  const [isLoading, setIsLoading] = useState(true);
  const [zmiana, setZmiana] = useState("1");
  const [numerNaWozku, setNumerNaWozku] = useState("");
  const [numerSamochodu, setNumerSamochodu] = useState("");
  const [czasProdukcji, setCzasProdukcji] = useState(null);
  const [czasZakonczenia, setCzasZakonczenia] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const obliczCzasProdukcji = () => {
    const numerNaWozkuInt = parseInt(numerNaWozku, 10);
    const numerSamochoduInt = parseInt(numerSamochodu, 10);
    const pozostaleBaterie = numerNaWozkuInt - numerSamochoduInt;
    const czasTrwaniaProdukcji = pozostaleBaterie * 1.4;
    const zaokraglonyCzasTrwaniaProdukcji = Math.round(czasTrwaniaProdukcji);
    let aktualnyCzas = new Date();

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
          (godzina === 17 && minuta < 0) ||
          (godzina === 19 && minuta < 30) ||
          (godzina === 21 && minuta < 13)
        );
      }
      return false;
    };

    let minutyProdukcji = zaokraglonyCzasTrwaniaProdukcji;
    while (minutyProdukcji > 0) {
      aktualnyCzas.setMinutes(aktualnyCzas.getMinutes() + 1);
      const godzina = aktualnyCzas.getHours();
      const minuta = aktualnyCzas.getMinutes();

      if (!jestPrzerwa(godzina, minuta)) {
        minutyProdukcji--;
      }
    }

    setCzasProdukcji(zaokraglonyCzasTrwaniaProdukcji);
    setCzasZakonczenia(
      `${aktualnyCzas.getHours().toString().padStart(2, "0")}:${aktualnyCzas
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Logo"
          width={140}
          height={140}
          className="mb-4"
        />

        {/* Animowany napis */}
        <p className="text-lg font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <Image
        src="/logo.png"
        alt="Logo"
        width={110}
        height={110}
        className="mb-4"
      />

      <h1 className="title">Produktionszeitrechner</h1>

      <div className="container">
        <label className="block mb-4">
          <span className="text-gray-800 font-medium">Wähle die Schicht:</span>
          <select
            value={zmiana}
            onChange={(e) => setZmiana(e.target.value)}
            className="mt-2 p-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring focus:ring-gray-600  text-black bg-white"
          >
            <option value="1">1 Schicht</option>
            <option value="2">2 Schicht</option>
            <option value="2">3 Schicht</option>
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
            className="mt-2 p-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring focus:ring-gray-600  text-black bg-white"
            placeholder="Geben Sie die Nummer auf dem Wagen ein"
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
            className="mt-2 p-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring focus:ring-gray-600  text-black bg-white"
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

      {czasProdukcji !== null && (
        <div className="result">
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

      <footer className="footer">
        <p>
          &copy; 2024 My Production Calculator. All rights reserved. | Developed
          by Szymon K | Version 1.0.0
        </p>
      </footer>
    </div>
  );
}
