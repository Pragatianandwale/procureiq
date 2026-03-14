import React, { useState, useEffect } from 'react';
import { api } from '../api';
import CountdownTimer from '../components/CountdownTimer';
import DataSourcesPanel from '../components/DataSourcesPanel';
import AIProcessingBox from '../components/AIProcessingBox';
import ConfidenceGauge from '../components/ConfidenceGauge';
import IBNBarChart from '../components/IBNBarChart';
import DecisionLayerBox from '../components/DecisionLayerBox';
import FeedbackLoops from '../components/FeedbackLoops';
import SAPModal from '../components/SAPModal';
import OverrideModal from '../components/OverrideModal';
import FlowArrows from '../components/FlowArrows';

function ArchitectureDashboard() {
  const [recommendation, setRecommendation] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSAPModal, setShowSAPModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [recData, suppData] = await Promise.all([
        api.getLatestRecommendation(),
        api.getSuppliers()
      ]);
      
      setRecommendation(recData);
      setSuppliers(suppData.suppliers || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleApprove = () => setShowSAPModal(true);
  const handleOverride = () => setShowOverrideModal(true);

  const handleConfirmApprove = async () => {
    try {
      await api.submitOverride({
        recommendation_id: recommendation?.id,
        original_recommendation: recommendation?.recommendation,
        manager_decision: recommendation?.recommendation,
        reason: 'Approved as recommended',
        outcome: 'pending',
        supplier_name: recommendation?.top_supplier,
        confidence_score: recommendation?.confidence,
        ibn_score: recommendation?.ibn_score
      });
      
      setShowSAPModal(false);
      alert('Order approved!');
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmitOverride = async (overrideData) => {
    try {
      await api.submitOverride(overrideData);
      setShowOverrideModal(false);
      alert('Override submitted!');
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <FlowArrows />
      
      {/* Navy Header */}
      <div className="bg-[#1F3864] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">ProcureIQ</div>
          <div className="text-sm">
            {new Date().toLocaleDateString()} • Pipeline ran at 5:00 AM IST
          </div>
          <CountdownTimer />
        </div>
      </div>

      {/* Main Layout - 3 Columns */}
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* LEFT COLUMN - Data Sources */}
        <div className="col-span-2">
          <DataSourcesPanel />
        </div>

        {/* CENTER COLUMN */}
        <div className="col-span-7 space-y-6">
          {/* Top Row - AI Processing & Confidence */}
          <div className="grid grid-cols-2 gap-6">
            <AIProcessingBox />
            <ConfidenceGauge confidence={recommendation?.confidence || 0.76} />
          </div>

          {/* Middle Row - IBN Bar Chart */}
          <IBNBarChart suppliers={suppliers} />

          {/* Bottom Row - Feedback Loops */}
          <FeedbackLoops />
        </div>

        {/* RIGHT COLUMN - Decision Layer */}
        <div className="col-span-3">
          <DecisionLayerBox
            recommendation={recommendation}
            onApprove={handleApprove}
            onOverride={handleOverride}
          />
        </div>
      </div>

      {/* Modals */}
      {showSAPModal && (
        <SAPModal
          sapPO={recommendation?.sap_po_draft}
          onConfirm={handleConfirmApprove}
          onCancel={() => setShowSAPModal(false)}
        />
      )}

      {showOverrideModal && (
        <OverrideModal
          recommendation={recommendation}
          onSubmit={handleSubmitOverride}
          onCancel={() => setShowOverrideModal(false)}
        />
      )}
    </div>
  );
}

export default ArchitectureDashboard;
