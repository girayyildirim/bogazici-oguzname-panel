import React, { useMemo, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { PanelDataErrorView } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]) {
  const m = mean(arr);
  const v = mean(arr.map((x) => (x - m) * (x - m)));
  return Math.sqrt(v);
}

function pickNumericValues(data: any): number[] {
  const series = data?.series?.[0];
  if (!series?.fields?.length) return [];

  const numericField =
    series.fields.find((f: any) => f.type === 'number') ||
    series.fields.find((f: any) => typeof f.values?.get?.(0) === 'number');

  if (!numericField?.values) return [];

  const vals: number[] = [];
  const len = numericField.values.length ?? 0;
  for (let i = 0; i < len; i++) {
    const v = numericField.values.get(i);
    if (typeof v === 'number' && Number.isFinite(v)) vals.push(v);
  }
  return vals;
}

function buildAiInsight(values: number[], mode: 'safe' | 'balanced' | 'aggressive', sensitivity: number) {
  if (values.length < 6) {
    return {
      riskScore: 10,
      title: 'AI Insight',
      summary: 'Not enough data points for deeper analysis. Try a time series query with more samples.',
      bullets: ['Add more datapoints (>= 6) to enable trend/volatility checks.'],
      zThresh: null as number | null,
      volatility: null as number | null,
      spikeCount: 0,
      trendPct: 0,
      trendDir: 'LOW_DATA' as 'UP' | 'DOWN' | 'FLAT' | 'LOW_DATA',
    };
  }

  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;

  const m = mean(values);
  const s = std(values);
  const vol = s / (Math.abs(m) + 1e-9);

  const baseZ = mode === 'safe' ? 3.2 : mode === 'aggressive' ? 2.2 : 2.7;
  const sensAdj = (60 - sensitivity) / 100;
  const zThresh = clamp(baseZ + sensAdj, 1.8, 4.0);

  let spikeCount = 0;
  for (const v of values) {
    const z = s > 0 ? Math.abs((v - m) / s) : 0;
    if (z >= zThresh) spikeCount++;
  }

  const trendPct = (delta / (Math.abs(first) + 1e-9)) * 100;
  const trendDir = trendPct > 1 ? 'UP' : trendPct < -1 ? 'DOWN' : 'FLAT';

  let risk = 0;
  if (trendDir === 'DOWN') risk += 18;
  if (vol > 0.25) risk += 22;
  if (vol > 0.45) risk += 18;
  if (spikeCount >= 1) risk += 20;
  if (spikeCount >= 3) risk += 12;
  risk += clamp(Math.round((sensitivity - 50) * 0.2), -5, 8);
  risk = clamp(risk, 0, 100);

  const bullets: string[] = [];

  if (trendDir === 'UP') bullets.push(`Trend: rising (~${trendPct.toFixed(1)}%).`);
  if (trendDir === 'DOWN') bullets.push(`Trend: decreasing (~${trendPct.toFixed(1)}%). Consider investigating causes.`);
  if (trendDir === 'FLAT') bullets.push('Trend: mostly stable.');

  if (vol <= 0.15) bullets.push('Volatility: low (stable signal).');
  else if (vol <= 0.35) bullets.push('Volatility: medium (watch for changes).');
  else bullets.push('Volatility: high (noisy/unstable). Consider smoothing/alerts.');

  if (spikeCount === 0) bullets.push('Anomalies: no strong spikes detected.');
  else bullets.push(`Anomalies: ${spikeCount} potential spike(s) detected (z ≥ ${zThresh.toFixed(1)}).`);

  const summary =
    risk >= 70
      ? 'High risk pattern detected. Consider alert rules and anomaly review.'
      : risk >= 40
      ? 'Moderate risk. Monitor trend & spikes; consider thresholds.'
      : 'Looks healthy. Keep monitoring and validate with business context.';

  return {
    riskScore: risk,
    title: 'AI Insight Engine',
    summary,
    bullets,
    zThresh,
    volatility: vol,
    spikeCount,
    trendPct,
    trendDir,
  };
}

// ✅ EXTRA BONUS B: Data Quality indicator
function computeDataQuality(values: number[]) {
  if (!values || values.length < 6) {
    return { label: 'LOW', reason: 'Not enough data points (< 6)' as const };
  }

  const m = mean(values);
  const s = std(values);
  const vol = s / (Math.abs(m) + 1e-9);

  if (vol > 0.5) {
    return { label: 'MEDIUM', reason: 'High volatility (noisy signal)' as const };
  }

  return { label: 'GOOD', reason: 'Sufficient points and stable signal' as const };
}

export const SimplePanel: React.FC<Props> = ({ options, data, fieldConfig, id, width, height }) => {
  const showName = (options as any).showName ?? true;
  const bgColor = (options as any).bgColor ?? '#1f1f1f';
  const displayMode = (options as any).displayMode ?? 'center';

  const showSeriesCount = (options as any).showSeriesCount ?? false;
  const seriesCountSize = (options as any).seriesCountSize ?? 'sm';

  // ✅ AI Bonus options
  const showAiInsight = (options as any).showAiInsight ?? true;
  const aiInsightMode = ((options as any).aiInsightMode ?? 'balanced') as 'safe' | 'balanced' | 'aggressive';

  // aiSensitivity comes from TextInput => string | number
  const aiSensitivityRaw = (options as any).aiSensitivity ?? 60;
  const aiSensitivity = Number.isFinite(Number(aiSensitivityRaw)) ? Number(aiSensitivityRaw) : 60;

  // ✅ EXTRA BONUS options
  const showAiExplanation = (options as any).showAiExplanation ?? false;
  const showDataQuality = (options as any).showDataQuality ?? true;

  const [clicked, setClicked] = useState(false);

  // ✅ BONUS 6: Error handling
  if (!data || data.series.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>No data received</h3>
        <p style={{ marginBottom: 12 }}>
          Please run a query or select a data source. This panel gracefully handles empty or unreachable data states.
        </p>

        <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />
      </div>
    );
  }

  const seriesCountFontSize = seriesCountSize === 'lg' ? 22 : seriesCountSize === 'md' ? 18 : 14;
  const isCompact = displayMode === 'compact';

  const numericValues = useMemo(() => pickNumericValues(data), [data]);
  const ai = useMemo(
    () => buildAiInsight(numericValues, aiInsightMode, aiSensitivity),
    [numericValues, aiInsightMode, aiSensitivity]
  );
  const quality = useMemo(() => computeDataQuality(numericValues), [numericValues]);

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: 20,
        paddingTop: isCompact ? 10 : 20,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isCompact ? 'flex-start' : 'center',
        borderRadius: 8,
        overflow: 'hidden',
        gap: 10,
      }}
    >
      {showName && <h2 style={{ margin: 0 }}>Developed by Oguz Yildirim</h2>}

      <p style={{ margin: 0 }}>Fall 2025 – Grafana Panel Plugin</p>
      <p style={{ margin: 0 }}>Student id: 2022502129</p>

      <p style={{ margin: 0, opacity: 0.85 }}>Received {data.series.length} series from Grafana query</p>

      {/* ✅ BONUS 7: Responsive */}
      <p style={{ margin: 0, fontSize: 12, opacity: 0.65 }}>
        Panel size: {Math.round(width)} × {Math.round(height)}
      </p>

      {showSeriesCount && (
        <p style={{ margin: 0, fontSize: seriesCountFontSize }}>Series count: {data.series.length}</p>
      )}

      {/* ✅ AI BONUS: AI Insight box */}
      {showAiInsight && (
        <div
          style={{
            width: 'min(720px, 95%)',
            borderRadius: 10,
            padding: 12,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong>{ai.title}</strong>

              {/* ✅ EXTRA BONUS B: Data Quality badge */}
              {showDataQuality && (
                <span
                  style={{
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                  title={quality.reason}
                >
                  Data Quality: {quality.label}
                </span>
              )}
            </div>

            <span style={{ fontSize: 12, opacity: 0.8 }}>
              Mode: {aiInsightMode} • Sensitivity: {aiSensitivity} • Risk: {ai.riskScore}/100
            </span>
          </div>

          <p style={{ marginTop: 8, marginBottom: 8, opacity: 0.9 }}>{ai.summary}</p>

          <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
            {ai.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>

          {/* ✅ EXTRA BONUS A: AI Explainability */}
          {showAiExplanation && (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.88 }}>
              <strong>AI Explanation</strong>
              <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 18 }}>
                <li>Trend is estimated from first vs last value (direction & percentage change).</li>
                <li>Volatility is measured using standard deviation relative to the mean.</li>
                <li>
                  Anomalies are detected using a z-score threshold (mode + sensitivity affect threshold).
                </li>
                <li>Risk score combines trend direction, volatility, and anomaly count.</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ✅ Interactivity (hover + click) + mode-based behavior */}
      <div
        style={{
          marginTop: 6,
          width: 220,
          height: 140,
          borderRadius: '50%',
          backgroundColor: '#4C78FF',
          transition: 'transform 0.25s',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setClicked((v) => !v)}
        onMouseEnter={(e) => {
          if (displayMode === 'center') {
            e.currentTarget.style.transform = 'scale(1.08)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Hover or click me!"
      />

      {clicked && <p style={{ margin: 0 }}>You clicked the panel 🎯</p>}
    </div>
  );
};
