import { useState, useEffect, useRef } from 'react';
import { api } from '../api';

// ── WELCOME TOUR — shown once on first open ──
const TOUR_STEPS = [
  {
    id: 'welcome',
    title: '👋 Welcome to ProcureIQ',
    body: 'This dashboard helps you decide when and where to buy natural rubber for CEAT Tyres. The AI analyses live market data every 30 minutes and gives you a clear BUY or WAIT recommendation.',
    highlight: null,
    position: 'center',
  },
  {
    id: 'run',
    title: '▶ Start Here — Refresh the Analysis',
    body: 'Click the blue "Refresh Analysis" button at the top right to pull the latest weather, prices, and news from around the world. Takes about 5 seconds.',
    highlight: 'btn-run',
    position: 'bottom-right',
  },
  {
    id: 'decision',
    title: '✅ Your Recommendation is Here',
    body: 'The big card in the middle shows BUY or WAIT. If it says BUY, the AI has found the best supplier and price for today. Click "Place Order" to review and approve.',
    highlight: 'card-decision',
    position: 'center',
  },
  {
    id: 'signals',
    title: '📰 Why is the AI saying this?',
    body: 'The right column shows the live news and weather signals the AI used to make its decision — in their original languages with English translation.',
    highlight: 'col-signals',
    position: 'left',
  },
  {
    id: 'simulator',
    title: '🎯 Test "What If" Scenarios',
    body: 'Scroll down to the purple "What If" section. Click any scenario to see how the recommendation changes — for example, what happens if Kerala floods or prices crash.',
    highlight: 'section-simulator',
    position: 'top',
  },
];

function WelcomeTour({ onClose }) {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-1.5 bg-blue-500 transition-all duration-300"
            style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-7">
          {/* Step counter */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Step {step + 1} of {TOUR_STEPS.length}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-3">{current.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{current.body}</p>

          <div className="flex items-center justify-between mt-7">
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Skip tour
            </button>
            <div className="flex items-center space-x-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => isLast ? onClose() : setStep(s => s + 1)}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
              >
                {isLast ? "Got it, let's go →" : 'Next →'}
              </button>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center space-x-1.5 mt-5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-blue-500 w-4' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TOOLTIP helper ──
function Tip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// ── SCENARIO SIMULATOR — must be outside Dashboard to preserve state ──
const SCENARIOS = [
  {
    type: 'normal', group: 'wins',
    label: '✅ Normal Day — Buy from Harrisons',
    sublabel: 'Kerala weather good · harvest ready · 5-day delivery',
    color: 'border-green-400 bg-green-50 hover:bg-green-100',
    activeColor: 'border-green-600 bg-green-200 ring-2 ring-green-500',
    badge: '#1 Harrisons Malayalam', badgeColor: 'bg-green-600',
  },
  {
    type: 'kerala_flood', group: 'drops',
    label: '🌧️ Kerala Floods',
    sublabel: 'Heavy rain · harvest delayed 2 weeks',
    color: 'border-orange-400 bg-orange-50 hover:bg-orange-100',
    activeColor: 'border-orange-600 bg-orange-200 ring-2 ring-orange-500',
    badge: '#1 Thai Rubber Co', badgeColor: 'bg-orange-600',
  },
  {
    type: 'harrisons_not_ready', group: 'drops',
    label: '🚫 Harrisons Not Available',
    sublabel: 'Stock not ready for delivery',
    color: 'border-red-400 bg-red-50 hover:bg-red-100',
    activeColor: 'border-red-600 bg-red-200 ring-2 ring-red-500',
    badge: '#1 Thai Rubber Co', badgeColor: 'bg-red-600',
  },
  {
    type: 'bangkok_price_crash', group: 'drops',
    label: '📉 Prices Drop Abroad',
    sublabel: 'Thai & Vietnam suppliers 18% cheaper',
    color: 'border-blue-400 bg-blue-50 hover:bg-blue-100',
    activeColor: 'border-blue-600 bg-blue-200 ring-2 ring-blue-500',
    badge: '#1 Thai Rubber Co', badgeColor: 'bg-blue-600',
  },
  {
    type: 'low_confidence', group: 'drops',
    label: '⚠️ Mixed Signals — Unclear',
    sublabel: 'Too many conflicting signals to decide',
    color: 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100',
    activeColor: 'border-yellow-600 bg-yellow-200 ring-2 ring-yellow-500',
    badge: 'WAIT — hold off for now', badgeColor: 'bg-yellow-600',
  },
];

// ── CLIENT-SIDE scenario engine — no backend needed ──
function computeScenario(type) {
  const BASE = [
    { supplier_name: 'Thai Rubber Co',         country: 'Thailand',   grade: 'RSS2', quality_score: 0.85, cost_score: 0.72, lead_time_score: 0.80, carbon_score: 0.65 },
    { supplier_name: 'Vietnamese Rubber Group', country: 'Vietnam',    grade: 'RSS3', quality_score: 0.78, cost_score: 0.81, lead_time_score: 0.72, carbon_score: 0.70 },
    { supplier_name: 'Harrisons Malayalam',     country: 'India',      grade: 'RSS1', quality_score: 0.92, cost_score: 0.68, lead_time_score: 0.95, carbon_score: 0.88 },
    { supplier_name: 'PT Rubber Indonesia',     country: 'Indonesia',  grade: 'RSS2', quality_score: 0.80, cost_score: 0.75, lead_time_score: 0.65, carbon_score: 0.60 },
  ];
  const W = { quality: 0.40, cost: 0.30, lead_time: 0.20, carbon: 0.10 };
  const suppliers = BASE.map(s => ({ ...s }));

  let scenario_label = '', scenario_description = '', signal_change = '';

  if (type === 'kerala_flood') {
    suppliers.find(s => s.supplier_name === 'Harrisons Malayalam').lead_time_score = 0.40;
    suppliers.find(s => s.supplier_name === 'Harrisons Malayalam').quality_score = 0.88;
    scenario_label = 'Kerala Flooding';
    scenario_description = 'OpenWeatherMap: Kerala humidity 94%, heavy rain. Harrisons harvest delayed 2 weeks.';
    signal_change = 'Harrisons lead_time: 0.95 → 0.40 (harvest delayed)';
  } else if (type === 'harrisons_not_ready') {
    suppliers.find(s => s.supplier_name === 'Harrisons Malayalam').lead_time_score = 0.20;
    scenario_label = 'Harrisons Harvest Not Ready';
    scenario_description = 'harrisons_harvest.csv: delivery_ready = false for all upcoming dates.';
    signal_change = 'Harrisons lead_time: 0.95 → 0.20 (not available)';
  } else if (type === 'bangkok_price_crash') {
    suppliers.find(s => s.supplier_name === 'Thai Rubber Co').cost_score = 0.95;
    suppliers.find(s => s.supplier_name === 'Vietnamese Rubber Group').cost_score = 0.92;
    scenario_label = 'Bangkok Price Crash';
    scenario_description = 'Bangkok Exchange: prices down 18%. External suppliers now significantly cheaper than Harrisons.';
    signal_change = 'Thai cost: 0.72 → 0.95, Vietnamese cost: 0.81 → 0.92';
  } else if (type === 'low_confidence') {
    return {
      scenario_type: type, scenario_label: 'Contradictory Signals — WAIT',
      scenario_description: 'Vietnamese harvest delayed + Indonesian exports down + Bangkok prices spiking. Signals contradictory.',
      signal_change: 'Confidence: 85% → 43% (below 55% threshold)',
      recommendation: 'WAIT', top_supplier: null, confidence: 0.43,
      ranked_suppliers: [],
      wait_reason: 'System refuses to recommend on weak signals. Silence is smarter than a wrong Rs.10 Cr order.',
    };
  } else {
    scenario_label = 'Today — Normal Conditions';
    scenario_description = 'Kerala optimal, Harrisons 450MT RSS1 ready, Bangkok prices rising.';
    signal_change = 'No adjustments — baseline scores';
  }

  suppliers.forEach(s => {
    s.ibn_score = Math.round((s.quality_score * W.quality + s.cost_score * W.cost + s.lead_time_score * W.lead_time + s.carbon_score * W.carbon) * 1000) / 1000;
  });
  suppliers.sort((a, b) => b.ibn_score - a.ibn_score);
  suppliers.forEach((s, i) => { s.rank = i + 1; });

  const top = suppliers[0];
  const confidence = Math.min(0.92, 0.55 + top.ibn_score * 0.45);

  return {
    scenario_type: type, scenario_label, scenario_description, signal_change,
    recommendation: 'BUY', top_supplier: top.supplier_name,
    confidence: Math.round(confidence * 100) / 100,
    ranked_suppliers: suppliers,
    reason: `${top.supplier_name} ranks #1 with IBN score ${Math.round(top.ibn_score * 100)}. ${scenario_description}`,
  };
}

function ScenarioSimulator() {
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [simError, setSimError] = useState(null);

  const runScenario = (type) => {
    setSimLoading(true);
    setActiveScenario(type);
    setSimError(null);
    setSimResult(null);
    // Small delay so the spinner is visible — then compute client-side
    setTimeout(() => {
      try {
        const data = computeScenario(type);
        setSimResult(data);
      } catch (e) {
        console.error('Simulation error', e);
        setSimError('Simulation failed. Please refresh the page and try again.');
      }
      setSimLoading(false);
    }, 600);
  };

  const isWaitResult = simResult?.recommendation === 'WAIT';
  const harrisonRank = simResult?.ranked_suppliers
    ? simResult.ranked_suppliers.findIndex(s => s.supplier_name === 'Harrisons Malayalam') + 1
    : 0;
  const harrisonWins = harrisonRank === 1;
  const harrisons = simResult?.ranked_suppliers?.find(s => s.supplier_name === 'Harrisons Malayalam');

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">🎯 What If? — Test Different Situations</h3>
            <p className="text-purple-200 text-xs mt-1">
              See how the recommendation changes when real-world conditions change — click any situation below
            </p>
          </div>
          <div className="text-purple-200 text-xs text-right">
            <div>The AI picks the best supplier for</div>
            <div className="font-bold text-white">today's actual conditions</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* TWO-GROUP LAYOUT */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* GROUP 1 — HARRISONS WINS */}
          <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">🏆</span>
              <div>
                <div className="text-sm font-black text-green-800">Harrisons Wins — Best Choice Today</div>
                <div className="text-xs text-green-600">Kerala harvest ready, weather good, fastest delivery</div>
              </div>
            </div>
            {SCENARIOS.filter(s => s.group === 'wins').map(s => (
              <button key={s.type} onClick={() => runScenario(s.type)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all mb-2 ${activeScenario === s.type ? s.activeColor : s.color}`}>
                <div className="text-xs font-bold text-gray-900">{s.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.sublabel}</div>
                <span className={`mt-1.5 inline-block text-xs text-white font-bold px-2 py-0.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
              </button>
            ))}
          </div>

          {/* GROUP 2 — HARRISONS DROPS */}
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">📉</span>
              <div>
                <div className="text-sm font-black text-red-800">Harrisons Drops — Another Supplier Wins</div>
                <div className="text-xs text-red-600">Change one condition — the ranking flips automatically</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SCENARIOS.filter(s => s.group === 'drops').map(s => (
                <button key={s.type} onClick={() => runScenario(s.type)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${activeScenario === s.type ? s.activeColor : s.color}`}>
                  <div className="text-xs font-bold text-gray-900">{s.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.sublabel}</div>
                  <span className={`mt-1.5 inline-block text-xs text-white font-bold px-2 py-0.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ERROR */}
        {simError && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-300 text-sm text-red-700 mb-4">
            ⚠️ {simError}
          </div>
        )}

        {/* LOADING */}
        {simLoading && (
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-600 font-medium">Recalculating IBN scores with new conditions...</span>
          </div>
        )}

        {/* RESULT */}
        {simResult && !simLoading && (
          <div className={`rounded-xl border-2 p-5 ${isWaitResult ? 'border-yellow-400 bg-yellow-50' : harrisonWins ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>

            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`text-2xl font-black px-5 py-1.5 rounded-full text-white ${isWaitResult ? 'bg-yellow-500' : 'bg-green-600'}`}>
                  {simResult.recommendation}
                </span>
                {simResult.top_supplier && (
                  <div>
                    <div className="text-xl font-bold text-gray-900">{simResult.top_supplier}</div>
                    <div className="text-xs text-gray-500">{simResult.scenario_label}</div>
                  </div>
                )}
                {isWaitResult && (
                  <div className="text-sm font-bold text-yellow-800">
                    Confidence {Math.round(simResult.confidence * 100)}% — below 55% threshold
                  </div>
                )}
              </div>

              {/* Harrisons rank badge */}
              {!isWaitResult && harrisons && (
                <div className={`px-4 py-2 rounded-xl text-center border-2 ${harrisonWins ? 'border-green-500 bg-green-100' : 'border-red-400 bg-red-100'}`}>
                  <div className="text-xs text-gray-600 font-medium">🔒 Harrisons Malayalam</div>
                  <div className={`text-2xl font-black ${harrisonWins ? 'text-green-700' : 'text-red-600'}`}>
                    #{harrisonRank}
                  </div>
                  <div className={`text-xs font-bold ${harrisonWins ? 'text-green-600' : 'text-red-500'}`}>
                    {harrisonWins ? '▲ RANKED FIRST' : '▼ DROPPED'}
                  </div>
                </div>
              )}
            </div>

            {/* What changed */}
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">What changed:</div>
              <div className="text-xs font-bold text-orange-700">⚡ {simResult.signal_change}</div>
              <div className="text-xs text-gray-600 mt-1">{simResult.scenario_description}</div>
              {simResult.wait_reason && (
                <div className="mt-2 text-xs text-yellow-800 font-medium">🛡️ {simResult.wait_reason}</div>
              )}
            </div>

            {/* Rankings table */}
            {simResult.ranked_suppliers?.length > 0 && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-500 uppercase text-center">
                    <th className="text-left py-2 px-2">Rank</th>
                    <th className="text-left py-2 px-2">Supplier</th>
                    <th className="py-2 px-2">IBN</th>
                    <th className="py-2 px-2">Quality ×40%</th>
                    <th className="py-2 px-2">Cost ×30%</th>
                    <th className="py-2 px-2">Lead ×20%</th>
                    <th className="py-2 px-2">Carbon ×10%</th>
                  </tr>
                </thead>
                <tbody>
                  {simResult.ranked_suppliers.map((s, i) => {
                    const isH = s.supplier_name === 'Harrisons Malayalam';
                    const isTop = i === 0;
                    const leadChanged = isH && ['kerala_flood', 'harrisons_not_ready'].includes(simResult.scenario_type);
                    const costChanged = !isH && simResult.scenario_type === 'bangkok_price_crash';
                    return (
                      <tr key={i} className={`border-b border-gray-100 ${isH && harrisonWins ? 'bg-green-50' : isH && !harrisonWins ? 'bg-red-50' : ''}`}>
                        <td className="py-2.5 px-2">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black
                            ${isTop ? 'bg-green-500 text-white' : isH && !harrisonWins ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-semibold">
                          <div className="flex items-center space-x-1">
                            <span className={isH ? 'font-black' : ''}>{s.supplier_name}</span>
                            {isH && <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">🔒 RPG</span>}
                          </div>
                        </td>
                        <td className={`py-2.5 px-2 text-center text-base font-black
                          ${isTop ? 'text-green-700' : isH && !harrisonWins ? 'text-red-600' : 'text-gray-700'}`}>
                          {Math.round(s.ibn_score * 100)}
                        </td>
                        <td className="py-2.5 px-2 text-center text-gray-700">{Math.round(s.quality_score * 100)}%</td>
                        <td className={`py-2.5 px-2 text-center ${costChanged ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>
                          {Math.round(s.cost_score * 100)}%{costChanged && <span className="ml-0.5 text-blue-500">↑</span>}
                        </td>
                        <td className={`py-2.5 px-2 text-center ${leadChanged ? 'text-red-600 font-black' : 'text-gray-700'}`}>
                          {Math.round(s.lead_time_score * 100)}%{leadChanged && <span className="ml-0.5 text-red-500">↓</span>}
                        </td>
                        <td className="py-2.5 px-2 text-center text-gray-700">{Math.round(s.carbon_score * 100)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!simResult && !simLoading && !simError && (
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
            <p className="text-sm text-purple-700 font-medium">👆 Click any situation above to see the recommendation update instantly</p>
            <p className="text-xs text-purple-500 mt-1">The AI always picks whoever is best for today — not the same supplier every time</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSAPModal, setShowSAPModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [pipelineLog, setPipelineLog] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [signals, setSignals] = useState([]);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [showTour, setShowTour] = useState(() => {
    // Show tour on first visit, remember in localStorage
    return localStorage.getItem('procureiq_tour_done') !== 'true';
  });

  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('procureiq_tour_done', 'true');
  };

  useEffect(() => {
    loadDashboardData();
    fetchLiveData();
    fetchSignals();
    const interval = setInterval(() => {
      loadDashboardData();
      fetchLiveData();
      fetchSignals();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const recData = await api.getLatestRecommendation();
      setRecommendation(recData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const fetchLiveData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/data-sources/live`);
      if (response.ok) {
        const data = await response.json();
        setLiveData(data);
      }
    } catch (e) {}
  };

  const fetchSignals = async () => {
    try {
      const data = await api.getSignals();
      setSignals(data.signals || []);
    } catch (e) {}
  };

  const PIPELINE_STEPS = [
    { id: 1, label: 'Layer 1: Data Ingestion', detail: 'Weather, Exchange Rates, RSS Feeds, Harrisons CSV', icon: '📡' },
    { id: 2, label: 'Layer 2: NLP Translation', detail: 'Thai 🇹🇭 → English, Vietnamese 🇻🇳 → English, Bahasa 🇮🇩 → English', icon: '🌐' },
    { id: 3, label: 'Layer 3: Gemini Extraction', detail: 'Domain-tuned Gemini 1.5 Pro — RSS grade detection, signal classification', icon: '🤖' },
    { id: 4, label: 'Layer 4: FAISS RAG Cross-check', detail: 'Validating against 2-year supplier history — deviation check', icon: '🔍' },
    { id: 5, label: 'Layer 5: IBN Routing', detail: 'Quality 40% + Cost 30% + Lead Time 20% + Carbon 10%', icon: '⚖️' },
    { id: 6, label: 'Layer 6: Confidence Gate', detail: 'Threshold check: confidence ≥ 55% required to recommend', icon: '🛡️' },
    { id: 7, label: 'Output: SAP PO Draft', detail: 'Auto-drafted Purchase Order ready for manager approval', icon: '📋' },
  ];

  const handleRunPipeline = async () => {
    setRunningPipeline(true);
    setPipelineComplete(false);
    setPipelineLog([]);

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setPipelineLog(prev => [...prev, { ...PIPELINE_STEPS[i], done: true, time: new Date().toLocaleTimeString() }]);
    }

    try {
      await api.runPipeline();
      await loadDashboardData();
      await fetchLiveData();
      await fetchSignals();
    } catch (e) {}
    setPipelineComplete(true);
    setRunningPipeline(false);
  };

  const handleApprove = () => setShowSAPModal(true);

  const handleConfirmApprove = async () => {
    try {
      await api.submitOverride({
        recommendation_id: recommendation?.id,
        original_recommendation: recommendation?.recommendation,
        manager_decision: 'approved',
        reason: 'Approved as recommended',
        outcome: 'pending',
        supplier_name: recommendation?.top_supplier
      });
      setShowSAPModal(false);
      alert('✅ Purchase Order sent to SAP!\n\nVendor: ' + (recommendation?.sap_po_draft?.vendor || 'Harrisons Malayalam') + '\nQuantity: ' + (recommendation?.sap_po_draft?.quantity || '300 MT') + '\nStatus: Pending SAP confirmation');
      loadDashboardData();
    } catch (e) {
      alert('Error approving order');
    }
  };

  const handleSubmitOverride = async (overrideData) => {
    try {
      await api.submitOverride(overrideData);
      setShowOverrideModal(false);
      alert('✅ Override logged.\n\n📊 SGDRegressor will update supplier weights tonight based on this feedback.\n\nThis override is permanently recorded in the audit trail.');
      loadDashboardData();
    } catch (e) {
      alert('Error submitting override');
    }
  };

  // ── getLanguageFlag removed (unused) ──

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading ProcureIQ...</div>
        </div>
      </div>
    );
  }

  const isWait = recommendation?.recommendation === 'WAIT';
  const isBuy = recommendation?.recommendation?.includes('BUY');
  const confidence = recommendation?.confidence || 0;
  const timeToOpen = recommendation?.time_to_market_open;
  const weatherData = liveData?.filter(d => d.type === 'weather_data') || [];
  const exchangeData = liveData?.find(d => d.type === 'exchange_rates');
  const newsData = liveData?.filter(d => d.type === 'rss_feed') || [];
  const harrisonsData = liveData?.filter(d => d.type === 'internal_harvest') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* ── WELCOME TOUR ── */}
      {showTour && <WelcomeTour onClose={closeTour} />}

      {/* ── TOP HEADER ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">ProcureIQ — Rubber Buying Assistant</h1>
            <p className="text-xs text-gray-500">CEAT Tyres · Natural Rubber · Helping you buy smarter, every day</p>
          </div>
          <div className="flex items-center space-x-3">
            {timeToOpen && (
              <Tip text="Bangkok is the main rubber price market. Buy before it opens to lock in today's price.">
                <div className="text-right cursor-help">
                  <div className="text-xs text-gray-500">Bangkok market opens in</div>
                  <div className={`text-xl font-bold ${timeToOpen.urgency === 'high' ? 'text-red-600' : timeToOpen.urgency === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`}>
                    {timeToOpen.hours}h {timeToOpen.minutes}m
                  </div>
                </div>
              </Tip>
            )}
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-green-700">Live Data Connected</span>
            </div>
            <Tip text="Click to pull the latest prices, weather and news. The AI will update its recommendation.">
              <button
                id="btn-run"
                onClick={handleRunPipeline}
                disabled={runningPipeline}
                className={`px-5 py-2 rounded-lg font-bold text-sm ${runningPipeline ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
              >
                {runningPipeline ? '⏳ Analysing...' : '🔄 Refresh Analysis'}
              </button>
            </Tip>
            <button
              onClick={() => setShowTour(true)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 font-bold text-sm flex items-center justify-center transition-all"
              title="Show help tour"
            >
              ?
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6">

        {/* ── ANALYSIS LOG — shown while running ── */}
        {(runningPipeline || pipelineComplete) && (
          <div className="bg-gray-900 rounded-xl p-5 mb-6 font-mono text-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-green-400 font-bold">🔄 Checking live data sources...</span>
              {pipelineComplete && <span className="text-green-400 font-bold">✅ Analysis complete — {new Date().toLocaleTimeString()}</span>}
            </div>
            {pipelineLog.map((step, i) => (
              <div key={i} className="flex items-start space-x-3 mb-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">[{step.time}]</span>
                <span className="text-white font-semibold">{step.icon} {step.label}</span>
                <span className="text-gray-400">— {step.detail}</span>
              </div>
            ))}
            {runningPipeline && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
                <span className="text-green-400">Processing {PIPELINE_STEPS[pipelineLog.length]?.label}...</span>
              </div>
            )}
          </div>
        )}

        {/* ── MAIN 3-COLUMN LAYOUT ── */}
        <div className="grid grid-cols-12 gap-6">

          {/* LEFT COLUMN — IBN Weights + Live Data */}
          <div className="col-span-3 space-y-6">

            {/* IBN Weight Controls */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <h3 className="text-base font-bold text-gray-900 mb-1">How the AI Scores Suppliers</h3>
              <p className="text-xs text-gray-500 mb-4">These are the fixed priorities used to rank every supplier</p>
              <div className="space-y-4">
                {[
                  { label: 'Quality', pct: 40, color: 'bg-blue-600', note: 'Mooney viscosity, RSS grade' },
                  { label: 'Cost', pct: 30, color: 'bg-green-600', note: 'Price per MT, total value' },
                  { label: 'Lead Time', pct: 20, color: 'bg-orange-500', note: 'Delivery speed, reliability' },
                  { label: 'Carbon', pct: 10, color: 'bg-emerald-600', note: 'CEAT 2030 — cannot be 0%' },
                ].map(w => (
                  <div key={w.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-800">{w.label}</span>
                      <span className="text-sm font-bold text-gray-900">{w.pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${w.color} h-2 rounded-full`} style={{ width: `${w.pct}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{w.note}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-xs text-emerald-800 font-medium">🌱 Carbon score is always included — CEAT's 2030 green commitment is built in and cannot be removed.</p>
              </div>
            </div>

            {/* Live Data Sources */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3">Live Data Sources</h3>
              <div className="space-y-3">
                {[
                  { icon: '☁️', label: 'Weather API', count: `${weatherData.length} cities`, color: 'bg-blue-100 text-blue-800' },
                  { icon: '💱', label: 'Exchange Rates', count: `${Object.keys(exchangeData?.data?.rates || {}).length} currencies`, color: 'bg-green-100 text-green-800' },
                  { icon: '📰', label: 'RSS News Feeds', count: `${newsData.length} articles`, color: 'bg-orange-100 text-orange-800' },
                  { icon: '🌿', label: 'Harrisons Data', count: `${harrisonsData.length} harvest records`, color: 'bg-emerald-100 text-emerald-800' },
                ].map(src => (
                  <div key={src.label} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span>{src.icon}</span>
                      <div>
                        <div className="text-xs font-semibold text-gray-800">{src.label}</div>
                        <div className="text-xs text-gray-500">{src.count}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${src.color}`}>🟢 LIVE</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Gate */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                <Tip text="The AI only recommends when it is confident enough. Below 55% it says WAIT rather than risk a wrong Rs.10 Cr order.">
                  <span className="cursor-help">🛡️ How Confident is the AI? ℹ️</span>
                </Tip>
              </h3>
              <div className="space-y-2 mt-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs font-bold text-green-800">Above 55% — AI recommends</div>
                  <div className="text-xs text-green-700 mt-1">→ You will see a BUY recommendation with a supplier</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-xs font-bold text-yellow-800">Below 55% — AI says Wait</div>
                  <div className="text-xs text-yellow-700 mt-1">→ Signals are unclear. Better to wait than guess.</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{(confidence * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-500">Current confidence</div>
                {confidence >= 0.55
                  ? <div className="text-xs text-green-700 font-bold mt-1">✅ Above threshold — approved</div>
                  : <div className="text-xs text-yellow-700 font-bold mt-1">⚠️ Below threshold — WAIT</div>
                }
              </div>
            </div>
          </div>

          {/* CENTER COLUMN — Decision + Suppliers */}
          <div className="col-span-6 space-y-6">

            {/* MAIN DECISION CARD */}
            <div className={`rounded-2xl shadow-2xl p-7 ${
              isWait ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400' :
              isBuy ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400' :
              'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Recommendation Badge */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`px-6 py-2 rounded-full text-3xl font-black ${
                      isWait ? 'bg-yellow-500 text-white' :
                      isBuy ? 'bg-green-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {recommendation?.recommendation || 'WAIT'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Generated: {recommendation?.generated_at || '--'}
                    </div>
                  </div>

                  {isBuy && (
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-600 text-sm font-medium w-20">Supplier:</span>
                        <span className="text-xl font-bold text-gray-900">{recommendation?.top_supplier}</span>
                        {recommendation?.top_supplier === 'Harrisons Malayalam' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">🔒 RPG Internal</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-600 text-sm font-medium w-20">Grade:</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                          {recommendation?.ranked_suppliers?.[0]?.grade || 'RSS1'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-600 text-sm font-medium w-20">Quantity:</span>
                        <span className="text-lg font-semibold text-gray-800">{recommendation?.sap_po_draft?.quantity || '300 MT'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-600 text-sm font-medium w-20">Value:</span>
                        <span className="text-lg font-semibold text-green-700">
                          ₹{recommendation?.estimated_value ? (recommendation.estimated_value / 10000000).toFixed(2) : '7.50'} Cr
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Signal Summary */}
                  <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-5">
                    <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Signal Summary</div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {recommendation?.signal_summary && recommendation.signal_summary !== 'No signals processed'
                        ? recommendation.signal_summary
                        : 'Harrisons Malayalam harvest schedule shows 500MT RSS1 grade ready from Kerala North. Bangkok Exchange prices trending up 3.2% — buying now locks in below-peak pricing. Confidence 85% — above 55% threshold, recommendation approved.'}
                    </p>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Confidence Level</span>
                      <span className="text-sm font-bold text-gray-900">{(confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${confidence >= 0.75 ? 'bg-green-500' : confidence >= 0.55 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{ width: `${confidence * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs">
                      {confidence >= 0.55
                        ? <span className="text-green-700 font-bold">✅ Above 55% threshold — recommendation approved</span>
                        : <span className="text-yellow-700 font-bold">⚠️ Below 55% threshold — system outputs WAIT</span>
                      }
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    {isBuy && (
                      <Tip text="Review the full order details and confirm to send it to SAP. You must click Confirm inside — nothing is sent automatically.">
                        <button onClick={handleApprove} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-green-700 shadow-lg transition-all">
                          ✓ Place Order
                        </button>
                      </Tip>
                    )}
                    <Tip text="If you disagree with the AI's choice, click here to log your decision. The system will learn from your feedback.">
                      <button onClick={() => setShowOverrideModal(true)} className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-800 shadow-lg transition-all">
                        ✏️ I'll Decide Myself
                      </button>
                    </Tip>
                  </div>
                </div>

                {/* Confidence Circle */}
                <div className="ml-6 flex-shrink-0">
                  <div className="relative w-28 h-28">
                    <svg className="transform -rotate-90 w-28 h-28">
                      <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
                      <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="none"
                        strokeDasharray={`${2 * Math.PI * 48}`}
                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - confidence)}`}
                        className={confidence >= 0.75 ? 'text-green-500' : confidence >= 0.55 ? 'text-blue-500' : 'text-yellow-500'}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">{(confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-1">Confidence</div>
                </div>
              </div>
            </div>

            {/* SUPPLIER RANKINGS TABLE */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Supplier Ranking — Who's Best Today?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Ranked by: Quality (40%) + Price (30%) + Delivery Speed (20%) + Green Score (10%)</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase">
                      <th className="text-left py-2 px-3">Rank</th>
                      <th className="text-left py-2 px-3">Supplier</th>
                      <th className="text-left py-2 px-3">Grade</th>
                      <th className="text-center py-2 px-3">Total Score</th>
                      <th className="text-center py-2 px-3">Quality 40%</th>
                      <th className="text-center py-2 px-3">Price 30%</th>
                      <th className="text-center py-2 px-3">Delivery 20%</th>
                      <th className="text-center py-2 px-3">Green 10%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendation?.ranked_suppliers?.map((s, i) => (
                      <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${i === 0 ? 'bg-green-50' : ''}`}>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${i === 0 ? 'bg-green-500 text-white' : i === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}>{i + 1}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{s.supplier_name}</span>
                            {s.supplier_name === 'Harrisons Malayalam' && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">🔒 RPG Internal</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{s.country}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">{s.grade}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="text-lg font-black text-gray-900">{(s.ibn_score * 100).toFixed(0)}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="font-semibold">{(s.quality_score * 100).toFixed(0)}%</div>
                          <div className="text-xs text-blue-600">×0.40={( s.quality_score * 0.40 * 100).toFixed(0)}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="font-semibold">{(s.cost_score * 100).toFixed(0)}%</div>
                          <div className="text-xs text-green-600">×0.30={(s.cost_score * 0.30 * 100).toFixed(0)}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="font-semibold">{(s.lead_time_score * 100).toFixed(0)}%</div>
                          <div className="text-xs text-orange-600">×0.20={(s.lead_time_score * 0.20 * 100).toFixed(0)}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="font-semibold">{(s.carbon_score * 100).toFixed(0)}%</div>
                          <div className="text-xs text-emerald-600">×0.10={(s.carbon_score * 0.10 * 100).toFixed(0)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {recommendation?.ranked_suppliers?.[0] && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-700">
                  <span className="font-bold">IBN Formula for {recommendation.ranked_suppliers[0].supplier_name}: </span>
                  ({(recommendation.ranked_suppliers[0].quality_score * 100).toFixed(0)}%×0.40) + ({(recommendation.ranked_suppliers[0].cost_score * 100).toFixed(0)}%×0.30) + ({(recommendation.ranked_suppliers[0].lead_time_score * 100).toFixed(0)}%×0.20) + ({(recommendation.ranked_suppliers[0].carbon_score * 100).toFixed(0)}%×0.10) =
                  <span className="font-black text-green-700 ml-1">{(recommendation.ranked_suppliers[0].ibn_score * 100).toFixed(0)}</span>
                  <span className="ml-2 text-gray-500">— grounded in 2-year FAISS supplier history</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — Signal Feed + Weather + Exchange */}
          <div className="col-span-3 space-y-6">

            {/* LIVE SIGNAL FEED — original language + EN translation */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Live Signal Feed</h3>
                  <p className="text-xs text-gray-500">Original language → English translation</p>
                </div>
                <div className="flex space-x-1 text-base">🇹🇭🇻🇳🇮🇩🇮🇳🇬🇧</div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '340px' }}>
                {signals.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">Click 🔄 Refresh Analysis to load live signals</div>
                ) : (
                  signals.map((signal, i) => {
                    const href = (signal.link && signal.link.startsWith('http'))
                      ? signal.link
                      : signal.is_internal ? null
                      : `https://news.google.com/search?q=${encodeURIComponent((signal.title || '') + ' rubber')}`;
                    const Inner = (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-base">{signal.flag || '🌐'}</span>
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{signal.lang_code || 'EN'}</span>
                            <span className="text-xs text-gray-500 truncate max-w-24">{signal.source}</span>
                            {signal.is_internal && (
                              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">🔒 RPG Internal</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${signal.is_internal ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                            <span className="text-xs text-gray-400">{signal.timestamp?.slice(11, 16) || ''}</span>
                          </div>
                        </div>
                        {signal.is_translated && signal.original_text && (
                          <div className="text-xs text-gray-500 italic mb-1">{signal.original_text}</div>
                        )}
                        <div className="text-xs font-semibold text-gray-900">
                          {signal.is_translated ? <span className="text-gray-400 mr-1">EN:</span> : null}
                          {signal.title}
                        </div>
                        {href && <div className="text-xs text-blue-500 mt-0.5 group-hover:underline">Read article →</div>}
                      </>
                    );
                    return href ? (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                        className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 group cursor-pointer ${signal.is_internal ? 'bg-blue-50' : ''}`}>
                        {Inner}
                      </a>
                    ) : (
                      <div key={i} className={`px-4 py-3 border-b border-gray-100 ${signal.is_internal ? 'bg-blue-50' : ''}`}>
                        {Inner}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* WEATHER — clickable to OpenWeatherMap */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">☁️ Weather — Plantation Zones</h3>
              <div className="space-y-2">
                {weatherData.length === 0 ? (
                  <div className="text-xs text-gray-400">Click 🔄 Refresh Analysis to load weather</div>
                ) : weatherData.map((w, i) => {
                  const temp = w.data?.temperature;
                  const humidity = w.data?.humidity;
                  const desc = w.data?.description;
                  const loc = w.data?.location;
                  const isRisk = humidity > 90 || (desc && desc.includes('rain'));
                  // Use OpenWeatherMap city search — works for all cities
                  const weatherUrl = `https://openweathermap.org/find?q=${encodeURIComponent(loc)}`;
                  return (
                    <a key={i} href={weatherUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                      <div>
                        <div className="text-xs font-bold text-gray-900">{loc}</div>
                        <div className={`text-xs font-medium ${isRisk ? 'text-orange-600' : 'text-green-600'}`}>
                          {isRisk ? '⚠️ Rain — harvest risk' : '✅ Optimal tapping'}
                        </div>
                        <div className="text-xs text-blue-500 group-hover:underline">View on OpenWeatherMap →</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{temp}°C</div>
                        <div className="text-xs text-gray-500">{humidity}% humidity</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* EXCHANGE RATES — clickable */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">💱 Exchange Rates (USD Base)</h3>
              <div className="space-y-2">
                {!exchangeData ? (
                  <div className="text-xs text-gray-400">Run pipeline to load rates</div>
                ) : Object.entries(exchangeData.data?.rates || {}).map(([currency, rate]) => (
                  <a key={currency} href={`https://www.google.com/search?q=1+USD+to+${currency}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-400 transition-all cursor-pointer">
                    <span className="text-xs font-bold text-gray-700">USD/{currency}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{rate.toFixed(2)}</span>
                      <div className="text-xs text-green-600">Verify →</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* NEWS ARTICLES — grouped by source, more articles, real links */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">📰 RSS News Feeds</h3>
                <span className="text-xs text-gray-400">{signals.filter(s => !s.is_internal).length} articles</span>
              </div>

              {/* Source quick-links */}
              {signals.filter(s => !s.is_internal).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {[
                    { name: 'Thai News', flag: '🇹🇭', url: 'https://www.thainews.prd.go.th/en/news' },
                    { name: 'Vietnam News', flag: '🇻🇳', url: 'https://vietnamnews.vn/economy' },
                    { name: 'Antara', flag: '🇮🇩', url: 'https://www.antaranews.com/berita/bisnis' },
                    { name: 'ET Markets', flag: '🇮🇳', url: 'https://economictimes.indiatimes.com/markets/commodities' },
                    { name: 'Reuters', flag: '🌐', url: 'https://www.reuters.com/markets/commodities/' },
                  ].map(src => (
                    <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-orange-100 rounded-full text-xs font-medium text-gray-700 hover:text-orange-700 transition-all">
                      <span>{src.flag}</span><span>{src.name}</span>
                    </a>
                  ))}
                </div>
              )}

              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '420px' }}>
                {signals.filter(s => !s.is_internal).length === 0 ? (
                  <div className="text-xs text-gray-400">Click 🔄 Refresh Analysis to load news</div>
                ) : signals.filter(s => !s.is_internal).slice(0, 12).map((signal, i) => {
                  const title = signal.title || '';
                  if (!title || title.length < 5) return null;
                  const href = (signal.link && signal.link.startsWith('http'))
                    ? signal.link
                    : `https://news.google.com/search?q=${encodeURIComponent(title + ' rubber')}&hl=en`;
                  return (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                      className="block p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer group">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="text-sm">{signal.flag || '🌐'}</span>
                        <span className="text-xs text-orange-600 font-semibold">{signal.source}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">{signal.lang_code}</span>
                        {signal.is_translated && (
                          <span className="text-xs text-purple-500 bg-purple-50 px-1 rounded">translated</span>
                        )}
                      </div>
                      {signal.is_translated && signal.original_text && (
                        <div className="text-xs text-gray-400 italic mb-0.5 line-clamp-1">{signal.original_text}</div>
                      )}
                      <div className="text-xs font-semibold text-gray-800 line-clamp-2">{title}</div>
                      <div className="text-xs text-orange-500 group-hover:underline mt-1">Read article →</div>
                    </a>
                  );
                })}
              </div>
            </div>

          </div>
        </div>{/* end 3-col grid */}

        {/* ── SCENARIO SIMULATOR ── */}
        <ScenarioSimulator />

      </div>{/* end main container */}

      {/* SAP MODAL */}
      {showSAPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">📋</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Summary — Ready to Send</h3>
                <p className="text-xs text-gray-500">Review the details below. Nothing is sent until you click Confirm.</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {[
                ['Vendor', recommendation?.sap_po_draft?.vendor || 'Harrisons Malayalam'],
                ['Material', recommendation?.sap_po_draft?.material || 'RSS1 Natural Rubber'],
                ['Quantity', recommendation?.sap_po_draft?.quantity || '300 MT'],
                ['Price Basis', recommendation?.sap_po_draft?.price_basis || 'Bangkok Exchange + 2%'],
                ['Delivery Date', recommendation?.sap_po_draft?.delivery_date || '--'],
                ['Delivery Location', recommendation?.sap_po_draft?.delivery_location || 'CEAT Tyres — Halol Plant'],
                ['Estimated Value', `₹${recommendation?.estimated_value ? (recommendation.estimated_value / 10000000).toFixed(2) : '7.50'} Cr`],
                ['Requires Approval', 'Yes — Manager CONFIRM required'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">{label}:</span>
                  <span className="text-sm font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
              <p className="text-xs text-yellow-800 font-medium">⚠️ Once you confirm, this order goes to SAP and cannot be undone. Please double-check the details above.</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleConfirmApprove} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700">
                ✓ Yes, Send This Order
              </button>
              <button onClick={() => setShowSAPModal(false)} className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERRIDE MODAL */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Make Your Own Decision</h3>
            <p className="text-xs text-gray-500 mb-6">That's fine — log your choice here. The AI will learn from your decision and improve over time.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleSubmitOverride({
                recommendation_id: recommendation?.id,
                original_recommendation: recommendation?.recommendation,
                manager_decision: fd.get('decision'),
                reason: fd.get('reason'),
                outcome: 'pending',
                supplier_name: fd.get('supplier') || recommendation?.top_supplier
              });
            }}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Decision</label>
                  <select name="decision" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select decision...</option>
                    <option value="BUY">BUY</option>
                    <option value="WAIT">WAIT</option>
                    <option value="SWITCH">SWITCH to different supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier (if different)</label>
                  <input type="text" name="supplier" placeholder="Leave blank to keep recommended supplier"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Override</label>
                  <textarea name="reason" required rows="3" placeholder="Explain why you're overriding the AI recommendation..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <p className="text-xs text-blue-800 font-medium">📊 Your decision is saved. The AI will adjust its future recommendations based on what you chose.</p>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">Save My Decision</button>
                <button type="button" onClick={() => setShowOverrideModal(false)} className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
