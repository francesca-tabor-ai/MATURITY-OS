'use client';

import { useState, useEffect, useCallback } from 'react';

function formatCurrency(n: number): string {
  if (n >= 1e9) return `£${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `£${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `£${(n / 1e3).toFixed(2)}K`;
  return `£${n.toFixed(0)}`;
}

interface ValuationResult {
  current_valuation: number;
  potential_valuation: number;
  valuation_upside: number;
  valuation_upside_pct: number;
  data_maturity_index: number;
  ai_maturity_score: number;
  model_explanation?: string;
}

export function ValuationAdjustmentDisplay({ organisationId }: { organisationId: string }) {
  const [currentValuation, setCurrentValuation] = useState('');
  const [dataMaturity, setDataMaturity] = useState(50);
  const [aiMaturity, setAiMaturity] = useState(50);
  const [preview, setPreview] = useState<ValuationResult | null>(null);
  const [saved, setSaved] = useState<ValuationResult | null>(null);
  const [history, setHistory] = useState<ValuationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPreview = useCallback(() => {
    const current = parseFloat(currentValuation) || 0;
    if (current <= 0) {
      setPreview(null);
      return;
    }
    setLoading(true);
    setError('');
    const params = new URLSearchParams({
      current_valuation: String(current),
      data_maturity_index: String(dataMaturity),
      ai_maturity_score: String(aiMaturity),
    });
    fetch(`/api/organisations/${organisationId}/valuation-adjustment?${params}`)
      .then((r) => r.json())
      .then((data) => setPreview(data))
      .catch(() => setPreview(null))
      .finally(() => setLoading(false));
  }, [organisationId, currentValuation, dataMaturity, aiMaturity]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/valuation-adjustment`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSaved(data[0]);
          setHistory(data);
        }
      })
      .catch(() => {});
  }, [organisationId]);

  function handleSave() {
    const current = parseFloat(currentValuation) || 0;
    if (current <= 0) {
      setError('Enter a valid current valuation');
      return;
    }
    setSaveLoading(true);
    setError('');
    fetch(`/api/organisations/${organisationId}/valuation-adjustment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_valuation: current,
        data_maturity_index: dataMaturity,
        ai_maturity_score: aiMaturity,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Save failed');
        return r.json();
      })
      .then((data) => {
        setSaved(data);
        setHistory((prev) => [data, ...prev]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Save failed'))
      .finally(() => setSaveLoading(false));
  }

  const display = preview ?? saved;
  const current = parseFloat(currentValuation) || 0;

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 max-w-lg space-y-4">
        <h3 className="font-semibold text-zinc-900">Inputs</h3>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Current valuation (£)</label>
          <input
            type="number"
            min={0}
            step={10000}
            value={currentValuation}
            onChange={(e) => setCurrentValuation(e.target.value)}
            className="input-field w-full"
            placeholder="e.g. 10000000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Data maturity (0–100): {dataMaturity}</label>
          <input
            type="range"
            min={0}
            max={100}
            value={dataMaturity}
            onChange={(e) => setDataMaturity(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none bg-zinc-200 accent-indigo-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">AI maturity (0–100): {aiMaturity}</label>
          <input
            type="range"
            min={0}
            max={100}
            value={aiMaturity}
            onChange={(e) => setAiMaturity(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none bg-zinc-200 accent-indigo-600"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveLoading || current <= 0}
          className="btn-primary"
        >
          {saveLoading ? 'Saving…' : 'Calculate & save'}
        </button>
      </div>

      {loading && !display && <p className="text-zinc-500">Calculating…</p>}

      {display && current > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card p-6">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Current valuation</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{formatCurrency(display.current_valuation)}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Potential valuation</p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{formatCurrency(display.potential_valuation)}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Valuation upside</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {formatCurrency(display.valuation_upside)}
                <span className="ml-1 text-lg">({display.valuation_upside_pct >= 0 ? '+' : ''}{display.valuation_upside_pct.toFixed(1)}%)</span>
              </p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Valuation waterfall</h3>
            <div className="flex items-end gap-4 h-28">
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full max-w-[80px] bg-zinc-300 rounded-t transition-all"
                  style={{
                    height: `${Math.max(4, (display.current_valuation / (display.potential_valuation || display.current_valuation || 1)) * 96)}px`,
                  }}
                />
                <p className="text-xs text-zinc-600 mt-1">Current</p>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full max-w-[80px] bg-emerald-500 rounded-t transition-all"
                  style={{
                    height: `${Math.max(0, (display.valuation_upside / (display.potential_valuation || 1)) * 96)}px`,
                  }}
                />
                <p className="text-xs text-zinc-600 mt-1">Upside</p>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full max-w-[80px] bg-indigo-500 rounded-t transition-all"
                  style={{ height: '96px' }}
                />
                <p className="text-xs text-zinc-600 mt-1">Potential</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">Bars scaled to potential (current + upside = potential).</p>
          </div>

          {display.model_explanation && (
            <p className="text-sm text-zinc-600">{display.model_explanation}</p>
          )}
        </>
      )}

      {history.length > 1 && (
        <div className="glass-card overflow-hidden">
          <h3 className="px-4 py-3 text-sm font-medium text-zinc-700 bg-zinc-50 border-b border-zinc-200">Previous runs</h3>
          <ul className="divide-y divide-zinc-100">
            {history.slice(1, 8).map((h, i) => (
              <li key={i} className="px-4 py-2 flex justify-between text-sm">
                <span className="text-zinc-600">{formatCurrency(h.current_valuation)} → {formatCurrency(h.potential_valuation)}</span>
                <span className="font-medium text-emerald-600">+{h.valuation_upside_pct.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
