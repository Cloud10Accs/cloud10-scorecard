'use client';

import { useState, useCallback } from 'react';
import { Lock, LockOpen, Save } from 'lucide-react';
import Cloud10Logo from './Cloud10Logo';
import GaugeChart from './GaugeChart';
import TrendChart from './TrendChart';
import PinModal from './PinModal';
import {
  calculateSalesScore,
  calculateFinanceScore,
  calculateOperationsScore,
  calculateOverallScore,
  calculateDepartmentPercentage,
} from '@/lib/scoring';

const DEPARTMENT_KEYS = {
  Sales: [
    'Networking Events',
    'One to Ones',
    'LinkedIn Posts',
    'Socket Pricing',
    'Sales Handover',
    'Content Hours',
    'Proposals Sent',
    'Proposals Won',
    'Clients Won Value',
    'Pipeline Value',
  ],
  Finance: [
    'DD Sign Up',
    'Unreconciled Items',
    'Invoice Rec Diff',
    'One Offs Not Billed',
    'Fee Reviews Old',
    'Overdue Balances',
  ],
  Operations: [
    'Complaints',
    'Email Comms',
    'Accounts Completion',
    'Accounts Not Started',
    'SA Completion',
    'Managements Up To Date',
    'Xero Insights BK',
    'Client Referrals',
    'Staff Satisfaction',
    'Google Reviews',
    'Kudos',
  ],
};

export default function Scorecard({ data, onSave, historicalData = [], isEditor = false }) {
  const [activeTab, setActiveTab] = useState('Sales');
  const [kpiData, setKpiData] = useState(data || {});
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(isEditor);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleKpiChange = useCallback((department, kpi, value) => {
    if (!isEditorMode) return;

    setKpiData((prev) => ({
      ...prev,
      [department]: {
        ...(prev[department] || {}),
        [kpi]: value,
      },
    }));
  }, [isEditorMode]);

  const handlePinSubmit = (pin) => {
    setIsEditorMode(true);
    sessionStorage.setItem('c10-editor-mode', 'true');
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      await onSave(kpiData);
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving data');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate scores
  const salesScore = calculateSalesScore(kpiData.Sales || {});
  const financeScore = calculateFinanceScore(kpiData.Finance || {});
  const operationsScore = calculateOperationsScore(kpiData.Operations || {});
  const overallScore = calculateOverallScore(salesScore, financeScore, operationsScore);

  const salesPercentage = calculateDepartmentPercentage(salesScore);
  const financePercentage = calculateDepartmentPercentage(financeScore);
  const operationsPercentage = calculateDepartmentPercentage(operationsScore);

  const currentDeptData = kpiData[activeTab] || {};
  const currentDeptKeys = DEPARTMENT_KEYS[activeTab] || [];

  return (
    <div className="min-h-screen bg-c10-dark text-white font-nunito">
      {/* Header */}
      <header className="bg-black/30 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <Cloud10Logo className="h-16 w-auto" />
            </div>

            <div className="flex items-center gap-4">
              {!isEditorMode && (
                <span className="px-3 py-1 bg-white/10 text-xs font-semibold rounded-full">
                  View only
                </span>
              )}
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={isEditorMode ? 'Editor mode active' : 'Click to unlock editor mode'}
              >
                {isEditorMode ? (
                  <LockOpen size={20} className="text-c10-pink" />
                ) : (
                  <Lock size={20} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Overall Score */}
        <section className="bg-white/5 border border-white/10 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-8">Overall Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
            <div className="md:col-span-1">
              <GaugeChart value={overallScore} label="Overall" percentOnly={true} />
            </div>

            <div className="md:col-span-3 grid grid-cols-3 gap-6">
              <GaugeChart
                value={salesPercentage}
                score={salesScore}
                label="Sales"
              />
              <GaugeChart
                value={financePercentage}
                score={financeScore}
                label="Finance"
              />
              <GaugeChart
                value={operationsPercentage}
                score={operationsScore}
                label="Operations"
              />
            </div>
          </div>
        </section>

        {/* 12-week trend */}
        {historicalData && historicalData.length > 0 && (
          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">12-Week Trend</h2>
            <TrendChart data={historicalData} />
          </section>
        )}

        {/* Department tabs */}
        <section className="bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="mb-8">
            <div className="flex gap-4 border-b border-white/10">
              {Object.keys(DEPARTMENT_KEYS).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveTab(dept)}
                  className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                    activeTab === dept
                      ? 'border-c10-pink text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* KPI inputs */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentDeptKeys.map((kpi) => (
                <div key={kpi} className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">{kpi}</label>
                  <input
                    type="text"
                    value={currentDeptData[kpi] || ''}
                    onChange={(e) => handleKpiChange(activeTab, kpi, e.target.value)}
                    disabled={!isEditorMode}
                    className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-c10-pink focus:bg-white/15 transition-colors ${
                      !isEditorMode ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter value"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          {isEditorMode && (
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-c10-pink to-c10-orange text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Week'}
              </button>

              {saveMessage && (
                <span
                  className={`text-sm font-semibold ${
                    saveMessage.includes('Error') ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {saveMessage}
                </span>
              )}
            </div>
          )}
        </section>
      </main>

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSubmit={handlePinSubmit}
      />
    </div>
  );
}
