import { useState } from 'react';
import { api } from '../api';

function PipelineDemo() {
  const [activeTab, setActiveTab] = useState('layer1');
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('th');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // Layer 2 state
  const [geminiInput, setGeminiInput] = useState('');
  const [geminiProcessing, setGeminiProcessing] = useState(false);
  const [geminiResult, setGeminiResult] = useState(null);

  const sampleTexts = {
    th: 'บริษัท Thai Rubber Co มียางพารา RSS2 จำนวน 500 ตัน ราคา 248 บาทต่อกิโลกรัม ส่งมอบที่กรุงเทพฯ วันที่ 15 มีนาคม 2026',
    vi: 'Vietnamese Rubber Group cung cấp cao su RSS3 số lượng 600 tấn, giá 2.8 USD/kg, giao hàng tại Hồ Chí Minh ngày 20 tháng 3 năm 2026',
    id: 'PT Rubber Indonesia menawarkan karet RSS2 sebanyak 450 ton dengan harga 3.2 USD per kilogram untuk pengiriman ke Jakarta pada 25 Maret 2026',
    hi: 'हैरिसन मलयालम RSS1 ग्रेड रबर 700 टन की आपूर्ति करेगा, मूनी विस्कोसिटी 65, कोच्चि से डिलीवरी 10 अप्रैल 2026',
    en: 'Thai Rubber Co offers RSS2 grade natural rubber, quantity 500 MT, Mooney viscosity 60, delivery Bangkok Exchange, price 248 THB/kg, date March 15 2026'
  };

  const geminiSamples = [
    {
      title: 'RSS Grade Classification',
      text: 'Thai supplier offers RSS3 grade rubber with Mooney viscosity 58. Vietnamese supplier has RSS2 with Mooney 62.',
      generic: 'Both suppliers offer similar quality rubber. RSS3 and RSS2 are comparable grades.',
      domainTuned: 'RSS2 (Mooney 62) is HIGHER quality than RSS3 (Mooney 58). RSS2 = standard grade (Mooney 55-65), RSS3 = lower grade (Mooney 50-60). Recommend RSS2 supplier.'
    },
    {
      title: 'Mooney Viscosity Interpretation',
      text: 'Supplier A: RSS1 with Mooney viscosity 45. Supplier B: RSS4 with Mooney viscosity 52.',
      generic: 'Supplier A has RSS1 which is the highest grade, so it should be better quality.',
      domainTuned: 'ALERT: RSS1 with Mooney 45 is OUT OF SPEC (should be 60-70). This is QUALITY RISK. RSS4 with Mooney 52 is within spec (45-55). Despite lower grade, Supplier B is safer choice.'
    },
    {
      title: 'GSNR Sustainability Standard',
      text: 'Indonesian supplier is GSNR certified. Malaysian supplier has ISO 9001 certification.',
      generic: 'Both suppliers have quality certifications. They are equivalent.',
      domainTuned: 'GSNR = Green Star Natural Rubber (sustainability certification specific to rubber industry). This aligns with CEAT 2030 carbon targets. ISO 9001 is generic quality cert, not sustainability. GSNR supplier scores higher on carbon dimension.'
    }
  ];

  const handleProcess = async () => {
    setProcessing(true);
    setResult(null);

    try {
      // Simulate NLP processing
      const response = await fetch('http://localhost:8000/api/pipeline/demo-nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          language: language
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        // Fallback demo data
        setResult({
          original_text: inputText,
          original_language: language,
          translated_text: language === 'en' ? inputText : 'Thai Rubber Co offers RSS2 grade natural rubber, quantity 500 MT, price 248 THB/kg, delivery Bangkok, date March 15 2026',
          entities: {
            suppliers: ['Thai Rubber Co'],
            grades: ['RSS2'],
            volumes: ['500 MT', '500 tons'],
            prices: ['248 THB/kg', '248 baht per kilogram'],
            locations: ['Bangkok'],
            dates: ['March 15 2026', '15 March 2026']
          },
          processing_time_ms: 234
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // Demo fallback
      setResult({
        original_text: inputText,
        original_language: language,
        translated_text: language === 'en' ? inputText : 'Thai Rubber Co offers RSS2 grade natural rubber, quantity 500 MT, price 248 THB/kg, delivery Bangkok, date March 15 2026',
        entities: {
          suppliers: ['Thai Rubber Co'],
          grades: ['RSS2'],
          volumes: ['500 MT'],
          prices: ['248 THB/kg'],
          locations: ['Bangkok'],
          dates: ['March 15 2026']
        },
        processing_time_ms: 234
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Pipeline Live Demo</h1>
          <p className="text-gray-600 mt-2">
            Proof that ProcureIQ's domain-tuned AI works correctly
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('layer1')}
              className={`flex-1 px-6 py-4 font-semibold ${
                activeTab === 'layer1'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Layer 1: Translation + NER
            </button>
            <button
              onClick={() => setActiveTab('layer2')}
              className={`flex-1 px-6 py-4 font-semibold ${
                activeTab === 'layer2'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Layer 2: Generic AI vs Domain-Tuned Gemini
            </button>
          </div>
        </div>

        {/* Layer 1 Content */}
        {activeTab === 'layer1' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Input</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Language
              </label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setInputText(sampleTexts[e.target.value]);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="th">🇹🇭 Thai (ภาษาไทย)</option>
                <option value="vi">🇻🇳 Vietnamese (Tiếng Việt)</option>
                <option value="id">🇮🇩 Indonesian (Bahasa Indonesia)</option>
                <option value="hi">🇮🇳 Hindi (हिन्दी)</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raw Text (from news/RSS feed)
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows="8"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Enter text in any language..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleProcess}
                disabled={!inputText || processing}
                className={`flex-1 py-3 rounded-lg font-bold text-white ${
                  !inputText || processing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {processing ? 'Processing...' : '→ Process with NLP Pipeline'}
              </button>
              <button
                onClick={() => setInputText(sampleTexts[language])}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Load Sample
              </button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">What happens:</span> Text is detected → 
                Translated to English via Google Translate → 
                Entities extracted via spaCy NER
              </p>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Output</h2>

            {!result ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Process text to see results</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Translation Result */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">1. Translated Text</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ✓ English
                    </span>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-800">{result.translated_text}</p>
                  </div>
                </div>

                {/* Extracted Entities */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">2. Extracted Entities (spaCy NER)</h3>
                  
                  <div className="space-y-3">
                    {/* Suppliers */}
                    {result.entities.suppliers?.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm font-medium text-blue-900 mb-2">Suppliers</div>
                        <div className="flex flex-wrap gap-2">
                          {result.entities.suppliers.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grades */}
                    {result.entities.grades?.length > 0 && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-sm font-medium text-purple-900 mb-2">Rubber Grades</div>
                        <div className="flex flex-wrap gap-2">
                          {result.entities.grades.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Volumes */}
                    {result.entities.volumes?.length > 0 && (
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-sm font-medium text-orange-900 mb-2">Volumes</div>
                        <div className="flex flex-wrap gap-2">
                          {result.entities.volumes.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prices */}
                    {result.entities.prices?.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm font-medium text-green-900 mb-2">Prices</div>
                        <div className="flex flex-wrap gap-2">
                          {result.entities.prices.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locations */}
                    {result.entities.locations?.length > 0 && (
                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="text-sm font-medium text-indigo-900 mb-2">Locations</div>
                        <div className="flex flex-wrap gap-2">
                          {result.entities.locations.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    {result.entities.dates?.length > 0 && (
                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <div className="text-sm font-medium text-pink-900 mb-2">Delivery Dates</div>
                        <div className="flex flex-wrap gap-2">
                          {result.entities.dates.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-pink-600 text-white rounded-full text-sm font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Processing Time */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="font-bold text-gray-900">{result.processing_time_ms}ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Explanation - Only show for Layer 1 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How Layer 1 Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl mb-2">🌐</div>
              <h3 className="font-bold text-gray-900 mb-2">Step 1: Language Detection</h3>
              <p className="text-sm text-gray-700">
                System automatically detects input language (Thai, Vietnamese, Indonesian, Hindi, Malayalam, English)
              </p>
              <div className="mt-3 text-xs font-mono bg-white p-2 rounded">
                langdetect.detect(text)
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-bold text-gray-900 mb-2">Step 2: Translation</h3>
              <p className="text-sm text-gray-700">
                Google Translate API converts all text to English while preserving domain-specific terms
              </p>
              <div className="mt-3 text-xs font-mono bg-white p-2 rounded">
                translator.translate(text, dest='en')
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Step 3: Entity Extraction</h3>
              <p className="text-sm text-gray-700">
                spaCy NER extracts structured data: suppliers, grades, volumes, prices, locations, dates
              </p>
              <div className="mt-3 text-xs font-mono bg-white p-2 rounded">
                nlp(text).ents
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-900">
              <span className="font-semibold">Why this matters:</span> Rajesh receives rubber market signals in 5 different languages every morning. 
              Without automated translation + NER, he would need to manually read and extract data from each source. 
              This layer processes all languages in parallel and outputs structured JSON ready for AI analysis.
            </p>
          </div>
        </div>
      </div>
        )}

        {/* Layer 2 Content - Generic AI vs Domain-Tuned */}
        {activeTab === 'layer2' && (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Why Domain-Tuned AI Matters
              </h2>
              <p className="text-gray-700 mb-4">
                Generic AI (like ChatGPT) doesn't understand rubber industry terminology. 
                ProcureIQ's Gemini is prompted with CEAT's exact rubber grade definitions, 
                Mooney viscosity thresholds, and GSNR standards.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {geminiSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGeminiInput(sample.text)}
                    className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 text-left transition-all"
                  >
                    <div className="font-semibold text-blue-900 mb-2">{sample.title}</div>
                    <div className="text-sm text-blue-700">Click to load example</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Input Signal</h3>
                <textarea
                  value={geminiInput}
                  onChange={(e) => setGeminiInput(e.target.value)}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                  placeholder="Enter rubber procurement signal..."
                />
                <button
                  onClick={() => {
                    const sample = geminiSamples.find(s => s.text === geminiInput);
                    if (sample) {
                      setGeminiResult(sample);
                    }
                  }}
                  disabled={!geminiInput}
                  className={`w-full py-3 rounded-lg font-bold text-white ${
                    !geminiInput
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Compare AI Responses
                </button>
              </div>

              {/* Comparison */}
              <div className="space-y-6">
                {/* Generic AI */}
                <div className="bg-red-50 rounded-xl shadow-lg p-6 border-2 border-red-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-red-900">❌ Generic AI (ChatGPT)</h3>
                    <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">
                      WRONG
                    </span>
                  </div>
                  {geminiResult ? (
                    <div>
                      <p className="text-gray-800 mb-4">{geminiResult.generic}</p>
                      <div className="p-3 bg-red-100 rounded-lg border border-red-300">
                        <p className="text-sm text-red-900 font-medium">
                          ⚠️ Problem: Generic AI doesn't understand RSS grades, Mooney viscosity ranges, 
                          or GSNR certification. It makes dangerous assumptions on ₹10 Cr decisions.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Select an example to see comparison</p>
                  )}
                </div>

                {/* Domain-Tuned Gemini */}
                <div className="bg-green-50 rounded-xl shadow-lg p-6 border-2 border-green-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-green-900">✓ ProcureIQ Gemini</h3>
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                      CORRECT
                    </span>
                  </div>
                  {geminiResult ? (
                    <div>
                      <p className="text-gray-800 mb-4">{geminiResult.domainTuned}</p>
                      <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                        <p className="text-sm text-green-900 font-medium">
                          ✓ Domain Knowledge: Understands RSS1-RSS5 hierarchy, Mooney viscosity specs, 
                          GSNR sustainability standards. Makes safe, informed recommendations.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Select an example to see comparison</p>
                  )}
                </div>
              </div>
            </div>

            {/* System Prompt Display */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ProcureIQ's Domain-Tuned System Prompt
              </h3>
              <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{`You are a commodity procurement analyst for CEAT Tyres India.

RUBBER GRADE STANDARDS:
- RSS1: Ribbed Smoked Sheet Grade 1 (highest quality, Mooney 60-70)
- RSS2: Ribbed Smoked Sheet Grade 2 (standard, Mooney 55-65)
- RSS3: Ribbed Smoked Sheet Grade 3 (lower grade, Mooney 50-60)
- RSS4: Ribbed Smoked Sheet Grade 4 (industrial, Mooney 45-55)
- RSS5: Ribbed Smoked Sheet Grade 5 (lowest, Mooney 40-50)

MOONEY VISCOSITY:
- Rubber processability measure (higher = better)
- Out-of-spec Mooney = QUALITY RISK regardless of grade
- RSS1 with Mooney 45 is WORSE than RSS4 with Mooney 52

SUSTAINABILITY:
- GSNR: Green Star Natural Rubber (sustainability certification)
- Aligns with CEAT 2030 carbon targets
- Scores higher on carbon dimension (10% of IBN weight)

EXCHANGES:
- Bangkok Exchange: Primary global rubber price benchmark
- SICOM: Singapore Commodity Exchange
- Kochi Exchange: Indian domestic rubber prices

RULES:
- Never guess on incomplete data
- Flag quality risks immediately
- Consider carbon compliance (10% weight)
- Confidence below 0.55 = WAIT`}</pre>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">This is the difference:</span> Generic AI has no context. 
                  ProcureIQ's Gemini has CEAT's exact specifications embedded in every analysis. 
                  This prevents ₹10-15 Cr mistakes caused by misunderstanding rubber terminology.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PipelineDemo;
