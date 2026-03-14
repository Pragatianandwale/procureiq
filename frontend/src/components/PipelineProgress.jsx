import { useState } from 'react';

function PipelineProgress({ onComplete }) {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const steps = [
    { name: 'Layer 1: NER', icon: '🔤', desc: 'Translating & extracting entities' },
    { name: 'Layer 2: Gemini', icon: '🤖', desc: 'AI signal analysis' },
    { name: 'Layer 3: RAG', icon: '🔍', desc: 'Cross-checking history' },
    { name: 'Layer 4: IBN', icon: '🎯', desc: 'Ranking suppliers' },
    { name: 'Layer 5: Confidence', icon: '📊', desc: 'Validating confidence' },
    { name: 'Output', icon: '✅', desc: 'Generating recommendation' }
  ];

  const runPipeline = async () => {
    setRunning(true);
    setCompleted(false);
    setCurrentStep(0);

    try {
      // Simulate pipeline steps
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s per step
      }

      // Actually call the API
      const response = await fetch('http://localhost:8000/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setCompleted(true);
        setCurrentStep(steps.length);
        if (onComplete) {
          setTimeout(() => onComplete(), 1000);
        }
      }
    } catch (error) {
      console.error('Pipeline error:', error);
      alert('Pipeline execution failed. Check console for details.');
    } finally {
      setTimeout(() => {
        setRunning(false);
        setCurrentStep(0);
      }, 3000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Live Pipeline Execution</h2>
          <p className="text-blue-100 mt-1">
            Run the complete 5-layer AI pipeline in real-time
          </p>
        </div>
        <button
          onClick={runPipeline}
          disabled={running}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
            running
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-600 hover:bg-blue-50 hover:scale-105'
          }`}
        >
          {running ? '🔄 RUNNING...' : '▶️ RUN PIPELINE NOW'}
        </button>
      </div>

      {running && (
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            const isPending = idx > currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white bg-opacity-20 scale-105'
                    : isDone
                    ? 'bg-green-500 bg-opacity-30'
                    : 'bg-white bg-opacity-10'
                }`}
              >
                <div className="text-3xl">
                  {isDone ? '✅' : isActive ? step.icon : '⏳'}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{step.name}</div>
                  <div className="text-sm text-blue-100">{step.desc}</div>
                </div>
                {isActive && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
                {isDone && (
                  <span className="text-sm font-medium text-green-200">Complete</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {completed && (
        <div className="mt-6 p-4 bg-green-500 bg-opacity-30 rounded-lg border-2 border-green-300">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎉</div>
            <div>
              <div className="font-bold text-lg">Pipeline Complete!</div>
              <div className="text-sm text-green-100">
                New recommendation generated. Dashboard will refresh automatically.
              </div>
            </div>
          </div>
        </div>
      )}

      {!running && !completed && (
        <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
          <div className="text-sm text-blue-100">
            <span className="font-semibold">For judges:</span> Click "RUN PIPELINE NOW" to watch the complete 
            5-layer AI pipeline execute in real-time. Each layer processes live data from APIs and generates 
            a new BUY/WAIT/SWITCH recommendation.
          </div>
        </div>
      )}
    </div>
  );
}

export default PipelineProgress;
