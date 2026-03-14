import React from 'react';

function FlowArrows() {
  return (
    <>
      <style>{`
        @keyframes flowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .flow-arrow {
          animation: flowPulse 2s ease-in-out infinite;
        }
        
        .flow-arrow-fast {
          animation: flowPulse 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default FlowArrows;
