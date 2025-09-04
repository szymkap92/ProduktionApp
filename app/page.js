"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./clock.module.css";

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
  const [mnoznikCzasu, setMnoznikCzasu] = useState("1.33");

  const roznicaMinut = (czasDocelowy) =>
    Math.max(0, Math.round((czasDocelowy - new Date()) / 60000));
    
  const getCzasZakonczeniaColor = (czasDocelowy) => {
    const minutesLeft = roznicaMinut(czasDocelowy);
    if (minutesLeft > 60) return "green";
    if (minutesLeft > 30) return "orange";
    return "red";
  };

  // Efekt ładowania
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
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
  }, [zmiana]); // eslint-disable-line react-hooks/exhaustive-deps


  // Powiadomienie przeglądarkowe przy zakończeniu produkcji
  useEffect(() => {
    if (productionEnd && !notificationSent) {
      if (aktualnyCzas.getTime() >= productionEnd.getTime()) {
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Produktion abgeschlossen", {
              body: "Ihre Produktion ist abgeschlossen.",
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification("Produktion abgeschlossen", {
                  body: "Ihre Produktion ist abgeschlossen.",
                });
              }
            });
          }
        }
        setNotificationSent(true);
        // Audio feedback optional
      }
    }
  }, [aktualnyCzas, productionEnd, notificationSent]);

  // Ustaw klasę "dark" na <body> w zależności od darkMode
  useEffect(() => {
    const body = document.body;
    if (darkMode) {
      body.classList.add("dark");
      body.style.backgroundColor = '#0a0a0a';
    } else {
      body.classList.remove("dark");
      body.style.backgroundColor = '#1a1a2e';
    }
  }, [darkMode]);

  const jestPrzerwa = (godzina, minuta) => {
    if (zmiana === "1") {
      return (
        (godzina === 8 && minuta >= 0 && minuta < 15) ||
        (godzina === 10 && minuta >= 45) ||
        (godzina === 11 && minuta < 20) ||
        (godzina === 13 && minuta < 12)
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

    const mnoznikCzasuValue = parseFloat(mnoznikCzasu) || (zmiana === "3" ? 2.37 : 1.4);
    const czasTrwaniaProdukcji = pozostaleBaterie * mnoznikCzasuValue;
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

  const progress = productionStart && productionEnd
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,119,198,0.1),transparent)]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={160}
              className="relative z-10 drop-shadow-2xl animate-float"
            />
          </div>
          <div className="flex items-center justify-center space-x-1 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{animationDelay: '200ms'}} />
            <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-bounce" style={{animationDelay: '400ms'}} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-light mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              Produktionsrechner
            </h2>
            <p className="text-sm opacity-70 animate-pulse">System wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          darkMode 
            ? 'bg-gradient-to-br from-black via-gray-950 to-black' 
            : 'bg-gradient-to-br from-gray-800 via-slate-800 to-gray-900'
        }`}
      />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${
            darkMode ? "/background-dark.jpg" : "/background-light.jpg"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? 'bg-blue-400/10' : 'bg-blue-500/8'} rounded-full blur-3xl animate-float-slow`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? 'bg-purple-400/10' : 'bg-purple-500/8'} rounded-full blur-3xl animate-float-slower`} />
        <div className={`absolute top-1/2 left-1/3 w-64 h-64 ${darkMode ? 'bg-indigo-400/10' : 'bg-indigo-500/8'} rounded-full blur-3xl animate-float`} />
      </div>

      <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen p-4 ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
        {/* Premium Header */}
        <header className="absolute top-0 left-0 right-0 p-6">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'} animate-pulse`} />
              <span className="text-sm font-medium opacity-80">System Online</span>
            </div>
            <button
              onClick={() => {
                console.log('Toggle clicked, current darkMode:', darkMode);
                setDarkMode(!darkMode);
              }}
              className={`group relative p-3 rounded-xl transition-all duration-300 ${
                darkMode 
                  ? 'bg-black/60 hover:bg-gray-900/60 backdrop-blur-lg border border-gray-700/30' 
                  : 'bg-gray-700/60 hover:bg-gray-600/60 backdrop-blur-lg border border-gray-600/40'
              }`}
            >
              <div className="text-xl group-hover:scale-110 transition-transform duration-300">
                {darkMode ? "☀️" : "🌙"}
              </div>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="relative mb-6">
            <div className={`absolute inset-0 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-400/30'} rounded-full blur-2xl animate-pulse`} />
            <Image
              src="/logo.png"
              alt="Produktionsrechner Logo"
              width={120}
              height={120}
              className="relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h1 className={`text-4xl md:text-5xl font-light mb-3 tracking-wide ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'
          }`}>
            Produktionsrechner
          </h1>
          <p className="text-lg opacity-70 font-light">Präzise Zeitberechnung für Ihre Produktion</p>
        </div>

        {/* Premium Clock Section */}
        <div className="mb-12 animate-fade-in">
          <div className={`relative p-8 rounded-3xl backdrop-blur-2xl border transition-all duration-500 ${
            darkMode 
              ? 'bg-black/50 border-gray-600/30 shadow-2xl shadow-black/80' 
              : 'bg-black/20 border-gray-600/40 shadow-2xl shadow-black/40'
          }`}>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Analog Clock */}
              <div className="relative">
                <div className={`absolute -inset-4 ${darkMode ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' : 'bg-gradient-to-r from-blue-300/30 to-purple-300/30'} rounded-full blur-xl animate-pulse`} />
                <div className={styles.clockContainer}>
                  <div className={`${styles.clock} relative z-10`}>
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
                </div>
              </div>
              
              {/* Time Display */}
              <div className="text-center lg:text-left">
                <div className={`text-5xl lg:text-6xl font-light mb-2 tracking-wider ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent' 
                    : 'text-gray-200'
                } drop-shadow-lg`}>
                  {aktualnyCzas.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className={`text-xl font-light mb-4 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {aktualnyCzas.toLocaleDateString("de-DE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
                {czyPrzerwa && (
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500/80 to-orange-500/80 text-white text-sm font-medium rounded-full backdrop-blur-lg border border-red-300/20 animate-pulse shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
                    ⏸️ Produktionspause
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Calculator Form */}
        <div className={`w-full max-w-lg mx-auto p-8 rounded-3xl backdrop-blur-2xl border transition-all duration-500 animate-fade-in-up ${
          darkMode 
            ? 'bg-black/60 border-gray-600/30 shadow-2xl shadow-black/90' 
            : 'bg-black/20 border-gray-600/40 shadow-2xl shadow-black/50'
        }`}>
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${
              darkMode ? 'text-gray-100' : 'text-gray-200'
            }`}>
              🏢 Schichtauswahl
            </label>
            <div className="relative">
              <select
                value={zmiana}
                onChange={(e) => setZmiana(e.target.value)}
                className={`w-full p-4 rounded-xl border-0 focus:outline-none focus:ring-2 transition-all duration-300 font-medium ${
                  darkMode 
                    ? 'bg-gray-900/80 text-gray-100 placeholder-gray-400 focus:ring-blue-400/70 backdrop-blur-lg border border-gray-600/30' 
                    : 'bg-gray-700/70 text-gray-100 placeholder-gray-300 focus:ring-purple-400/70 backdrop-blur-lg border border-gray-600/50'
                } shadow-lg hover:shadow-xl`}
              >
                <option value="1">🌅 1. Schicht (Frühschicht)</option>
                <option value="2">🌇 2. Schicht (Spätschicht)</option>
                <option value="3">🌃 3. Schicht (Nachtschicht)</option>
              </select>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            </div>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${
              darkMode ? 'text-gray-100' : 'text-gray-200'
            }`}>
              🚚 Wagennummer (letztes Material)
            </label>
            <div className="relative group">
              <input
                type="number"
                value={numerNaWozku}
                onChange={(e) => setNumerNaWozku(e.target.value)}
                className={`w-full p-4 rounded-xl border-0 focus:outline-none focus:ring-2 transition-all duration-300 font-medium text-lg ${
                  darkMode 
                    ? 'bg-gray-900/80 text-gray-100 placeholder-gray-400 focus:ring-blue-400/70 backdrop-blur-lg border border-gray-600/30' 
                    : 'bg-gray-700/70 text-gray-100 placeholder-gray-300 focus:ring-purple-400/70 backdrop-blur-lg border border-gray-600/50'
                } shadow-lg hover:shadow-xl group-hover:scale-105`}
                placeholder="z.B. 1250"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          <div className="mb-8">
            <label className={`block text-sm font-medium mb-3 ${
              darkMode ? 'text-gray-100' : 'text-gray-200'
            }`}>
              🚗 Aktuelle Fahrzeugnummer
            </label>
            <div className="relative group">
              <input
                type="number"
                value={numerSamochodu}
                onChange={(e) => setNumerSamochodu(e.target.value)}
                className={`w-full p-4 rounded-xl border-0 focus:outline-none focus:ring-2 transition-all duration-300 font-medium text-lg ${
                  darkMode 
                    ? 'bg-gray-900/80 text-gray-100 placeholder-gray-400 focus:ring-blue-400/70 backdrop-blur-lg border border-gray-600/30' 
                    : 'bg-gray-700/70 text-gray-100 placeholder-gray-300 focus:ring-purple-400/70 backdrop-blur-lg border border-gray-600/50'
                } shadow-lg hover:shadow-xl group-hover:scale-105`}
                placeholder="z.B. 1200"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>


          <button
            onClick={obliczCzasProdukcji}
            className={`group relative w-full p-4 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-500 transform hover:scale-105 active:scale-95 ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-2xl shadow-blue-500/30' 
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-400 hover:via-purple-400 hover:to-indigo-400 text-white shadow-2xl shadow-purple-500/25'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative flex items-center justify-center space-x-2">
              <span className="text-xl group-hover:rotate-180 transition-transform duration-500">⚙️</span>
              <span>Produktionszeit berechnen</span>
            </div>
          </button>
        </div>

        {/* Premium Results */}
        {czasProdukcji !== null && (
          <div className={`w-full max-w-2xl mx-auto mb-8 p-8 rounded-3xl backdrop-blur-2xl border transition-all duration-500 animate-slide-up ${
            darkMode 
              ? 'bg-black/60 border-gray-600/30 shadow-2xl shadow-green-500/20' 
              : 'bg-white/20 border-white/30 shadow-2xl shadow-green-500/10'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-white/10">
                <div className="text-sm font-medium opacity-70 mb-2">⏱️ PRODUKTIONSDAUER</div>
                <div className="text-4xl font-light mb-1">{czasProdukcji}</div>
                <div className="text-sm opacity-70">Minuten</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-white/10">
                <div className="text-sm font-medium opacity-70 mb-2">🏁 ENDZEIT</div>
                <div 
                  className="text-4xl font-light mb-1 transition-colors duration-300"
                  style={{ color: getCzasZakonczeniaColor(productionEnd) }}
                >
                  {czasZakonczenia}
                </div>
                <div className="text-sm opacity-70">Uhr</div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-200/50 text-gray-600'
              } backdrop-blur-lg border border-white/10`}>
                <span className="mr-2">🔋</span>
                Verbleibende Batterien: {parseInt(numerNaWozku || 0) - parseInt(numerSamochodu || 0)}
              </div>
            </div>
          </div>
        )}

        {/* Premium Progress Section */}
        {productionStart && productionEnd && (
          <div className={`w-full max-w-2xl mx-auto mb-8 p-6 rounded-3xl backdrop-blur-2xl border transition-all duration-500 animate-slide-up ${
            darkMode 
              ? 'bg-black/60 border-gray-600/30 shadow-2xl shadow-orange-500/20' 
              : 'bg-white/20 border-white/30 shadow-2xl shadow-orange-500/10'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                📈 Produktionsfortschritt
              </h3>
              <div className="text-right">
                <div className="text-2xl font-light">{Math.round(progress)}%</div>
                <div className="text-xs opacity-70">{roznicaMinut(productionEnd)} min verbleibend</div>
              </div>
            </div>
            
            <div className="relative">
              <div className={`w-full h-3 rounded-full overflow-hidden ${
                darkMode ? 'bg-gray-800/60' : 'bg-gray-300/50'
              } backdrop-blur-lg`}>
                <div
                  className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.max(2, progress)}%`,
                    background: `linear-gradient(90deg, ${getProgressBarColor()}, ${getProgressBarColor()}dd)`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              
              <div className="flex justify-between mt-2 text-xs opacity-60">
                <span>▶️ {productionStart?.toLocaleTimeString()}</span>
                <span>🏁 {czasZakonczenia}</span>
              </div>
            </div>
          </div>
        )}

        {/* Premium Footer */}
        <footer className="mt-auto pt-12 pb-6">
          <div className={`max-w-4xl mx-auto text-center p-6 rounded-2xl backdrop-blur-lg border transition-all duration-500 ${
            darkMode 
              ? 'bg-black/50 border-gray-600/30' 
              : 'bg-white/20 border-white/30'
          }`}>
            <div className="flex items-center justify-center mb-3">
              <div className={`w-8 h-0.5 ${darkMode ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent' : 'bg-gradient-to-r from-transparent via-purple-400 to-transparent'}`} />
              <div className={`mx-4 w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-purple-400'} animate-pulse`} />
              <div className={`w-8 h-0.5 ${darkMode ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent' : 'bg-gradient-to-r from-transparent via-purple-400 to-transparent'}`} />
            </div>
            <p className="text-sm font-light opacity-80 mb-1">
              &copy; 2025 Produktionszeitrechner Pro
            </p>
            <p className="text-xs opacity-60">
              Entwickelt von Szymon K | v3.0.0 Professional Edition
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}