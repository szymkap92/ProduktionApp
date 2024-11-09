"use client";

import { useState } from "react";

export default function ProductionCalculator() {
  const [numerNaWozku, setNumerNaWozku] = useState("");
  const [numerSamochodu, setNumerSamochodu] = useState("");
  const [czasProdukcji, setCzasProdukcji] = useState(null);
  const [czasZakonczenia, setCzasZakonczenia] = useState(null);

  const obliczCzasProdukcji = () => {
    const numerNaWozkuInt = parseInt(numerNaWozku, 10);
    const numerSamochoduInt = parseInt(numerSamochodu, 10);
    const pozostaleBaterie = numerNaWozkuInt - numerSamochoduInt;
    const czasTrwaniaProdukcji = pozostaleBaterie * 1.4;
    const zaokraglonyCzasTrwaniaProdukcji = Math.round(czasTrwaniaProdukcji);
    const aktualnyCzas = new Date();
    const wstepnyCzasZakonczenia = new Date(
      aktualnyCzas.getTime() + zaokraglonyCzasTrwaniaProdukcji * 60000
    );

    setCzasProdukcji(zaokraglonyCzasTrwaniaProdukcji);
    setCzasZakonczenia(
      `${wstepnyCzasZakonczenia
        .getHours()
        .toString()
        .padStart(2, "0")}:${wstepnyCzasZakonczenia
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-semibold mb-8 text-blue-600">
        Produktionszeitrechner
      </h1>

      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <label className="block mb-4">
          <span className="text-gray-700">
            Nummer des letzten Materials auf dem Wagen:
          </span>
          <input
            type="number"
            value={numerNaWozku}
            onChange={(e) => setNumerNaWozku(e.target.value)}
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 text-gray-900 bg-gray-50"
            placeholder="Geben Sie die Nummer auf dem Wagen ein"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">
            Nummer des aktuellen Autos auf der Linie:
          </span>
          <input
            type="number"
            value={numerSamochodu}
            onChange={(e) => setNumerSamochodu(e.target.value)}
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 text-gray-900 bg-gray-50"
            placeholder="Geben Sie die Autonummer ein"
          />
        </label>

        <button
          onClick={obliczCzasProdukcji}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Berechnen Sie die Produktionszeit
        </button>
      </div>

      {czasProdukcji !== null && (
        <div className="mt-8 w-full max-w-md p-4 bg-white rounded-lg shadow-md text-gray-900">
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
    </div>
  );
}
