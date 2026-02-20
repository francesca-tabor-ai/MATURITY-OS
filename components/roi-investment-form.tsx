'use client';

import { useState, useEffect } from 'react';

export function ROIInvestmentForm({
  organisationId,
  onSuccess,
}: {
  organisationId: string;
  onSuccess: (result: Record<string, unknown>) => void;
}) {
  const [currentData, setCurrentData] = useState('');
  const [targetData, setTargetData] = useState('100');
  const [currentAi, setCurrentAi] = useState('');
  const [targetAi, setTargetAi] = useState('100');
  const [estimatedBenefits, setEstimatedBenefits] = useState('');
  const [annualBenefits, setAnnualBenefits] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/organisations/${organisationId}/data-audit`).then((r) => r.json()),
      fetch(`/api/organisations/${organisationId}/ai-audit`).then((r) => r.json()),
      fetch(`/api/organisations/${organisationId}/financial-impact`).then((r) => r.json()),
    ]).then(([dataRes, aiRes, finRes]) => {
      const dataLatest = Array.isArray(dataRes) ? dataRes[0] : null;
      const aiLatest = Array.isArray(aiRes) ? aiRes[0] : null;
      const finLatest = Array.isArray(finRes) ? finRes[0] : null;
      if (dataLatest?.maturity_index != null && !currentData) setCurrentData(String(dataLatest.maturity_index));
      if (aiLatest?.maturity_score != null && !currentAi) setCurrentAi(String(aiLatest.maturity_score));
      if (finLatest && !estimatedBenefits) {
        const rev = Number(finLatest.revenue_upside ?? 0);
        const margin = Number(finLatest.profit_margin_expansion_value ?? 0);
        const cost = Number(finLatest.cost_reduction ?? 0);
        setEstimatedBenefits(String(rev + margin + cost));
      }
    }).catch(() => {});
  }, [organisationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const cD = parseFloat(currentData) || 0;
    const tD = parseFloat(targetData) || 100;
    const cA = parseFloat(currentAi) || 0;
    const tA = parseFloat(targetAi) || 100;
    const benefits = parseFloat(estimatedBenefits) || 0;
    const annual = annualBenefits ? parseFloat(annualBenefits) : undefined;

    if (tD < cD || tA < cA) {
      setError('Target maturity must be ≥ current');
      return;
    }
    if (benefits < 0) {
      setError('Estimated benefits must be ≥ 0');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/${organisationId}/roi-investment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_data_maturity: cD,
          target_data_maturity: tD,
          current_ai_maturity: cA,
          target_ai_maturity: tA,
          estimated_financial_benefits: benefits,
          annual_benefits: annual,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');
      onSuccess(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 max-w-lg">
      <h3 className="font-semibold text-zinc-900">Current & target maturity (0–100)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Current Data Maturity</label>
          <input
            type="number"
            min={0}
            max={100}
            value={currentData}
            onChange={(e) => setCurrentData(e.target.value)}
            className="input-field"
            placeholder="From Data Audit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Target Data Maturity</label>
          <input
            type="number"
            min={0}
            max={100}
            value={targetData}
            onChange={(e) => setTargetData(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Current AI Maturity</label>
          <input
            type="number"
            min={0}
            max={100}
            value={currentAi}
            onChange={(e) => setCurrentAi(e.target.value)}
            className="input-field"
            placeholder="From AI Audit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Target AI Maturity</label>
          <input
            type="number"
            min={0}
            max={100}
            value={targetAi}
            onChange={(e) => setTargetAi(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Estimated financial benefits (total)</label>
        <input
          type="number"
          min={0}
          step={1000}
          value={estimatedBenefits}
          onChange={(e) => setEstimatedBenefits(e.target.value)}
          className="input-field"
          placeholder="From Financial Impact or manual"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Annual benefits (optional, for payback)</label>
        <input
          type="number"
          min={0}
          step={1000}
          value={annualBenefits}
          onChange={(e) => setAnnualBenefits(e.target.value)}
          className="input-field"
          placeholder="Same as above if left blank"
        />
      </div>
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Calculating…' : 'Calculate ROI & investment'}
      </button>
    </form>
  );
}
