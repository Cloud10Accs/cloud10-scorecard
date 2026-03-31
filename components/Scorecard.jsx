'use client';

import { useState, useCallback } from 'react';
import { Lock, LockOpen, Save, TrendingUp, Target, Info } from 'lucide-react';
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

// KPI descriptions, targets and scoring info
const KPI_INFO = {
  // Sales
  'Networking Events': {
    description: 'Number of networking events attended this week',
    target: '1+',
    maxPoints: 2,
    scoring: '0 = 0pts, 1+ = 2pts',
    type: 'number',
  },
  'One to Ones': {
    description: 'Number of 1-to-1 meetings held with prospects or referral partners',
    target: '1+',
    maxPoints: 2,
    scoring: '0 = 0pts, 1+ = 2pts',
    type: 'number',
  },
  'LinkedIn Posts': {
    description: 'Number of LinkedIn posts published this week',
    target: '5+',
    maxPoints: 3,
    scoring: '0 = 0pts, 1–4 = 1pt, 5+ = 3pts',
    type: 'number',
  },
  'Socket Pricing': {
    description: 'Has Socket pricing been reviewed and updated?',
    target: 'yes',
    maxPoints: 1,
    scoring: 'no = 0pts, yes = 1pt',
    type: 'yesno',
  },
  'Sales Handover': {
    description: 'Has a proper sales handover been completed?',
    target: 'yes',
    maxPoints: 1,
    scoring: 'no = 0pts, yes = 1pt',
    type: 'yesno',
  },
  'Content Hours': {
    description: 'Hours spent on content creation (blogs, videos, social)',
    target: '6+',
    maxPoints: 3,
    scoring: '0–2 = 0pts, 3–5 = 1pt, 6+ = 3pts',
    type: 'number',
  },
  'Proposals Sent': {
    description: 'Number of new proposals sent to prospective clients',
    target: '2+',
    maxPoints: 2,
    scoring: '0 = 0pts, 1 = 1pt, 2+ = 2pts',
    type: 'number',
  },
  'Proposals Won': {
    description: 'Number of proposals accepted by clients',
    target: '2+',
    maxPoints: 2,
    scoring: '0 = 0pts, 1 = 1pt, 2+ = 2pts',
    type: 'number',
  },
  'Clients Won Value': {
    description: 'Total recurring fee value (£) of new clients won',
    target: '£1,001+',
    maxPoints: 2,
    scoring: '£0 = 0pts, £1–1,000 = 1pt, £1,001+ = 2pts',
    type: 'currency',
  },
  'Pipeline Value': {
    description: 'Total value (£) of active sales pipeline',
    target: '£4,001+',
    maxPoints: 2,
    scoring: '£0–2,000 = 0pts, £2,001–4,000 = 1pt, £4,001+ = 2pts',
    type: 'currency',
  },
  // Finance
  'DD Sign Up': {
    description: 'Number of clients not yet on Direct Debit (lower is better)',
    target: '0',
    maxPoints: 3,
    scoring: '0 = 3pts, 1 = 1pt, 2+ = 0pts',
    type: 'number',
    lowerIsBetter: true,
  },
  'Unreconciled Items': {
    description: 'Number of unreconciled bank items across client accounts',
    target: '0',
    maxPoints: 3,
    scoring: '0 = 3pts, 1–3 = 1pt, 4+ = 0pts',
    type: 'number',
    lowerIsBetter: true,
  },
  'Invoice Rec Diff': {
    description: 'Invoice reconciliation difference (£) — should be zero',
    target: '£0',
    maxPoints: 4,
    scoring: '£0 = 4pts, any difference = 0pts',
    type: 'currency',
    lowerIsBetter: true,
  },
  'One Offs Not Billed': {
    description: 'Value (£) of completed one-off work not yet invoiced',
    target: '£0',
    maxPoints: 3,
    scoring: '£0 = 3pts, £1–3,000 = 1pt, £3,001+ = 0pts',
    type: 'currency',
    lowerIsBetter: true,
  },
  'Fee Reviews Old': {
    description: 'Percentage of fee reviews overdue (lower is better)',
    target: '0–10%',
    maxPoints: 3,
    scoring: '0–10% = 3pts, 11–20% = 1pt, 21%+ = 0pts',
    type: 'percentage',
    lowerIsBetter: true,
  },
  'Overdue Balances': {
    description: 'Percentage of client balances overdue (lower is better)',
    target: '<5%',
    maxPoints: 4,
    scoring: '<5% = 4pts, 5%+ = 0pts',
    type: 'percentage',
    lowerIsBetter: true,
  },
  // Operations
  'Complaints': {
    description: 'Number of client complaints received (lower is better)',
    target: '0',
    maxPoints: 2,
    scoring: '0 = 2pts, 1+ = 0pts',
    type: 'number',
    lowerIsBetter: true,
  },
  'Email Comms': {
    description: 'Number of client communication issues or missed emails',
    target: '0',
    maxPoints: 2,
    scoring: '0 = 2pts, 1 = 1pt, 2+ = 0pts',
    type: 'number',
    lowerIsBetter: true,
  },
  'Accounts Completion': {
    description: 'Percentage of year-end accounts completed on time',
    target: '60%+',
    maxPoints: 2,
    scoring: '<60% = 0pts, 60%+ = 2pts',
    type: 'percentage',
  },
  'Accounts Not Started': {
    description: 'Percentage of accounts due but not yet started (lower is better)',
    target: '0%',
    maxPoints: 2,
    scoring: '0% = 2pts, 0.1–10% = 1pt, 11%+ = 0pts',
    type: 'percentage',
    lowerIsBetter: true,
  },
  'SA Completion': {
    description: 'Self Assessment completion % vs monthly target (target increases through the year)',
    target: 'Monthly target',
    maxPoints: 2,
    scoring: 'Below target = 0pts, at/above target = 2pts',
    type: 'percentage',
  },
  'Managements Up To Date': {
    description: 'Are all management accounts up to date?',
    target: 'yes',
    maxPoints: 2,
    scoring: 'no = 0pts, yes = 2pts',
    type: 'yesno',
  },
  'Xero Insights BK': {
    description: 'Percentage of bookkeeping clients with Xero Insights enabled',
    target: '90%+',
    maxPoints: 2,
    scoring: '<90% = 0pts, 90%+ = 2pts',
    type: 'percentage',
  },
  'Client Referrals': {
    description: 'Number of client referrals received this week',
    target: '1+',
    maxPoints: 2,
    scoring: '0 = 0pts, 1+ = 2pts',
    type: 'number',
  },
  'Staff Satisfaction': {
    description: 'Average staff satisfaction score (out of 10)',
    target: '7+',
    maxPoints: 2,
    scoring: '<7 = 0pts, 7+ = 2pts',
    type: 'number',
  },
  'Google Reviews': {
    description: 'Number of new Google reviews received this week',
    target: '1+',
    maxPoints: 1,
    scoring: '0 = 0pts, 1+ = 1pt',
    type: 'number',
  },
  'Kudos': {
    description: 'Number of kudos/thank-you messages from clients',
    target: '2+',
    maxPoints: 1,
    scoring: '<2 = 0pts, 2+ = 1pt',
    type: 'number',
  },
};

function getScoreForKpi(kpi, value) {
  const info = KPI_INFO[kpi];
  if (!info) return null;
  const v = parseFloat(value) || 0;
  const isYes = String(value).toLowerCase() === 'yes';

  switch (kpi) {
    case 'Networking Events': return v > 0 ? 2 : 0;
    case 'One to Ones': return v > 0 ? 2 : 0;
    case 'LinkedIn Posts': return v === 0 ? 0 : v <= 4 ? 1 : 3;
    case 'Socket Pricing': return isYes ? 1 : 0;
    case 'Sales Handover': return isYes ? 1 : 0;
    case 'Content Hours': return v <= 2 ? 0 : v <= 5 ? 1 : 3;
    case 'Proposals Sent': return v === 0 ? 0 : v === 1 ? 1 : 2;
    case 'Proposals Won': return v === 0 ? 0 : v === 1 ? 1 : 2;
    case 'Clients Won Value': return v === 0 ? 0 : v <= 1000 ? 1 : 2;
    case 'Pipeline Value': return v <= 2000 ? 0 : v <= 4000 ? 1 : 2;
    case 'DD Sign Up': return v === 0 ? 3 : v === 1 ? 1 : 0;
    case 'Unreconciled Items': return v === 0 ? 3 : v <= 3 ? 1 : 0;
    case 'Invoice Rec Diff': return v === 0 ? 4 : 0;
    case 'One Offs Not Billed': return v === 0 ? 3 : v <= 3000 ? 1 : 0;
    case 'Fee Reviews Old': return v <= 10 ? 3 : v <= 20 ? 1 : 0;
    case 'Overdue Balances': return v < 5 ? 4 : 0;
    case 'Complaints': return v === 0 ? 2 : 0;
    case 'Email Comms': return v === 0 ? 2 : v === 1 ? 1 : 0;
    case 'Accounts Completion': return v >= 60 ? 2 : 0;
    case 'Accounts Not Started': return v === 0 ? 2 : v <= 10 ? 1 : 0;
    case 'SA Completion': return v >= 100 ? 2 : 0; // simplified
    case 'Managements Up To Date': return isYes ? 2 : 0;
    case 'Xero Insights BK': return v >= 90 ? 2 : 0;
    case 'Client Referrals': return v >= 1 ? 2 : 0;
    case 'Staff Satisfaction': return v >= 7 ? 2 : 0;
    case 'Google Reviews': return v >= 1 ? 1 : 0;
    case 'Kudos': return v >= 2 ? 1 : 0;
    default: return null;
  }
}

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

  // Calculate max points for current department
  const deptMaxPoints = currentDeptKeys.reduce((sum, kpi) => sum + (KPI_INFO[kpi]?.maxPoints || 0), 0);
  const deptCurrentPoints = currentDeptKeys.reduce((sum, kpi) => {
    const score = getScoreForKpi(kpi, currentDeptData[kpi]);
    return sum + (score || 0);
  }, 0);

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
        {/* Overall Score Summary */}
        <section className="bg-white/5 border border-white/10 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-2">Overall Performance</h2>
          <p className="text-gray-400 text-sm mb-8">
            Weekly scorecard across Sales, Finance and Operations — each department scores up to 20 points (60 total).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
            <div className="md:col-span-1">
              <GaugeChart value={overallScore} label="Overall" percentOnly={true} />
            </div>

            <div className="md:col-span-3 grid grid-cols-3 gap-6">
              <div className="text-center">
                <GaugeChart
                  value={salesPercentage}
                  score={salesScore}
                  label="Sales"
                />
                <p className="text-xs text-gray-400 mt-2">{salesScore}/20 points</p>
              </div>
              <div className="text-center">
                <GaugeChart
                  value={financePercentage}
                  score={financeScore}
                  label="Finance"
                />
                <p className="text-xs text-gray-400 mt-2">{financeScore}/20 points</p>
              </div>
              <div className="text-center">
                <GaugeChart
                  value={operationsPercentage}
                  score={operationsScore}
                  label="Operations"
                />
                <p className="text-xs text-gray-400 mt-2">{operationsScore}/20 points</p>
              </div>
            </div>
          </div>

          {/* Score breakdown bar */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-300 font-semibold">Score Breakdown</span>
              <span className="text-white font-bold">{salesScore + financeScore + operationsScore} / 60</span>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden flex">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${(salesScore / 60) * 100}%`, backgroundColor: '#FF4D9A' }}
                title={`Sales: ${salesScore}`}
              />
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${(financeScore / 60) * 100}%`, backgroundColor: '#FF6535' }}
                title={`Finance: ${financeScore}`}
              />
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${(operationsScore / 60) * 100}%`, backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
                title={`Operations: ${operationsScore}`}
              />
            </div>
            <div className="flex gap-6 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#FF4D9A' }} />
                Sales ({salesScore})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#FF6535' }} />
                Finance ({financeScore})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }} />
                Operations ({operationsScore})
              </span>
            </div>
          </div>
        </section>

        {/* 12-week trend — always shown */}
        <section className="bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={22} className="text-c10-pink" />
            <h2 className="text-2xl font-bold">12-Week Trend</h2>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Track performance over time — each line shows a department&apos;s weekly score percentage.
          </p>
          {historicalData && historicalData.length > 0 ? (
            <TrendChart data={historicalData} />
          ) : (
            <div className="w-full h-48 flex flex-col items-center justify-center bg-white/5 rounded-lg border border-dashed border-white/20">
              <TrendingUp size={32} className="text-gray-500 mb-3" />
              <p className="text-gray-400 font-semibold">Trend data will appear here</p>
              <p className="text-gray-500 text-sm mt-1">Enter scores for a few weeks to start seeing trends</p>
            </div>
          )}
        </section>

        {/* Department tabs */}
        <section className="bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="mb-6">
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

          {/* Department score summary */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                {activeTab} score this week
              </p>
              <p className="text-2xl font-bold">
                {deptCurrentPoints} <span className="text-sm font-normal text-gray-400">/ {deptMaxPoints} points</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">KPIs at target</p>
              <p className="text-2xl font-bold">
                {currentDeptKeys.filter(kpi => {
                  const score = getScoreForKpi(kpi, currentDeptData[kpi]);
                  const info = KPI_INFO[kpi];
                  return score !== null && info && score >= info.maxPoints;
                }).length}
                <span className="text-sm font-normal text-gray-400"> / {currentDeptKeys.length}</span>
              </p>
            </div>
          </div>

          {/* KPI inputs with descriptions */}
          <div className="space-y-4">
            {currentDeptKeys.map((kpi) => {
              const info = KPI_INFO[kpi] || {};
              const score = getScoreForKpi(kpi, currentDeptData[kpi]);
              const atMax = score !== null && score >= (info.maxPoints || 0);
              const hasValue = currentDeptData[kpi] !== undefined && currentDeptData[kpi] !== '' && currentDeptData[kpi] !== null;

              return (
                <div
                  key={kpi}
                  className={`p-4 rounded-lg border transition-colors ${
                    hasValue && atMax
                      ? 'bg-green-900/20 border-green-500/30'
                      : hasValue && score === 0
                      ? 'bg-red-900/10 border-red-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* KPI info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-sm font-bold text-white">{kpi}</label>
                        {hasValue && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            atMax ? 'bg-green-500/20 text-green-400' : score === 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {score}/{info.maxPoints}pts
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{info.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Target size={10} /> Target: <span className="text-gray-300">{info.target}</span>
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Info size={10} /> {info.scoring}
                        </span>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="w-full md:w-48 flex-shrink-0">
                      {info.type === 'yesno' ? (
                        <select
                          value={currentDeptData[kpi] || ''}
                          onChange={(e) => handleKpiChange(activeTab, kpi, e.target.value)}
                          disabled={!isEditorMode}
                          className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-c10-pink focus:bg-white/15 transition-colors ${
                            !isEditorMode ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">Select...</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={currentDeptData[kpi] || ''}
                          onChange={(e) => handleKpiChange(activeTab, kpi, e.target.value)}
                          disabled={!isEditorMode}
                          className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-c10-pink focus:bg-white/15 transition-colors ${
                            !isEditorMode ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          placeholder={info.type === 'currency' ? '£0' : info.type === 'percentage' ? '0%' : '0'}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
