'use client';

import { useState, useMemo } from 'react';
import { AIRPORT_PRESETS, calculateTrueCost } from '@/lib/true-cost';
import type { AirportPairPreset } from '@/lib/true-cost';

function CurrencyInput({
  label,
  sublabel,
  value,
  onChange,
  prefix = '$',
}: {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-soft">{label}</label>
      {sublabel && <div className="text-[10px] text-ink-muted mt-0.5">{sublabel}</div>}
      <div className="mt-1 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm">{prefix}</span>
        <input
          type="number"
          min={0}
          step={1}
          value={value || ''}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-full pl-7 pr-3 py-2 rounded-lg border border-border bg-cream text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/50"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function MinuteInput({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-soft">{label}</label>
      {sublabel && <div className="text-[10px] text-ink-muted mt-0.5">{sublabel}</div>}
      <div className="mt-1 relative">
        <input
          type="number"
          min={0}
          step={5}
          value={value || ''}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-full pl-3 pr-12 py-2 rounded-lg border border-border bg-cream text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/50"
          placeholder="0"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted text-xs">min</span>
      </div>
    </div>
  );
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function TrueCostCalculator({ locale = 'en' }: { locale?: 'en' | 'ko' }) {
  const isKo = locale === 'ko';

  const [mainTicket, setMainTicket] = useState(350);
  const [altTicket, setAltTicket] = useState(220);
  const [mainTransportCost, setMainTransportCost] = useState(10);
  const [mainTransportMinutes, setMainTransportMinutes] = useState(25);
  const [altTransportCost, setAltTransportCost] = useState(25);
  const [altTransportMinutes, setAltTransportMinutes] = useState(65);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [travelers, setTravelers] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  function applyPreset(preset: AirportPairPreset) {
    setMainTransportCost(preset.mainTransportCost);
    setMainTransportMinutes(preset.mainTransportMinutes);
    setAltTransportCost(preset.altTransportCost);
    setAltTransportMinutes(preset.altTransportMinutes);
    setSelectedPreset(preset.label);
  }

  const result = useMemo(
    () => calculateTrueCost(mainTicket, altTicket, mainTransportCost, mainTransportMinutes, altTransportCost, altTransportMinutes, hourlyRate, travelers),
    [mainTicket, altTicket, mainTransportCost, mainTransportMinutes, altTransportCost, altTransportMinutes, hourlyRate, travelers],
  );

  const ticketSavings = mainTicket - altTicket;
  const mainTotal = result.mainTrueCost;
  const altTotal = result.altTrueCost;
  const maxCost = Math.max(mainTotal, altTotal, 1);

  return (
    <div className="space-y-8">
      {/* Preset selector */}
      <div>
        <label className="block text-xs font-semibold text-ink-soft mb-2">
          {isKo ? '공항 쌍 프리셋 선택 (선택사항)' : 'Quick preset (optional)'}
        </label>
        <select
          value={selectedPreset}
          onChange={(e) => {
            const preset = AIRPORT_PRESETS.find((p) => p.label === e.target.value);
            if (preset) applyPreset(preset);
          }}
          className="w-full py-2 px-3 rounded-lg border border-border bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30"
        >
          <option value="">{isKo ? '직접 입력하기' : 'Enter your own values'}</option>
          {(['US', 'JP', 'EU', 'KR'] as const).map((region) => {
            const presets = AIRPORT_PRESETS.filter((p) => p.region === region);
            if (presets.length === 0) return null;
            const regionLabel = { US: isKo ? '미국' : 'United States', JP: isKo ? '일본' : 'Japan', EU: isKo ? '유럽' : 'Europe', KR: isKo ? '한국' : 'Korea' }[region];
            return (
              <optgroup key={region} label={regionLabel}>
                {presets.map((p) => (
                  <option key={p.label} value={p.label}>{p.label}</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {/* Input cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Main airport */}
        <div className="p-4 rounded-xl border-2 border-teal/20 bg-teal-light/30 space-y-3">
          <h3 className="text-sm font-display font-semibold text-teal">
            {isKo ? 'Option A: 주요 공항' : 'Option A: Main Airport'}
          </h3>
          <CurrencyInput
            label={isKo ? '항공권 가격 (왕복)' : 'Flight price (round trip)'}
            value={mainTicket}
            onChange={setMainTicket}
          />
          <CurrencyInput
            label={isKo ? '공항까지 교통비 (편도)' : 'Transport to airport (one way)'}
            sublabel={isKo ? '택시, 우버, 전철 등' : 'Uber, taxi, train, etc.'}
            value={mainTransportCost}
            onChange={setMainTransportCost}
          />
          <MinuteInput
            label={isKo ? '공항까지 이동 시간 (편도)' : 'Transport time (one way)'}
            value={mainTransportMinutes}
            onChange={setMainTransportMinutes}
          />
        </div>

        {/* Alt airport */}
        <div className="p-4 rounded-xl border-2 border-amber/20 bg-amber-light/30 space-y-3">
          <h3 className="text-sm font-display font-semibold text-amber">
            {isKo ? 'Option B: 대체 공항' : 'Option B: Alternative Airport'}
          </h3>
          <CurrencyInput
            label={isKo ? '항공권 가격 (왕복)' : 'Flight price (round trip)'}
            value={altTicket}
            onChange={setAltTicket}
          />
          <CurrencyInput
            label={isKo ? '공항까지 교통비 (편도)' : 'Transport to airport (one way)'}
            sublabel={isKo ? '택시, 우버, 전철 등' : 'Uber, taxi, train, etc.'}
            value={altTransportCost}
            onChange={setAltTransportCost}
          />
          <MinuteInput
            label={isKo ? '공항까지 이동 시간 (편도)' : 'Transport time (one way)'}
            value={altTransportMinutes}
            onChange={setAltTransportMinutes}
          />
        </div>
      </div>

      {/* Time value + travelers */}
      <div className="p-4 rounded-xl border border-border bg-cream-dark/40 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-ink-soft">
              {isKo ? '나의 시간 가치' : 'How much is your time worth?'}
            </label>
            <span className="text-sm font-display font-semibold text-ink">${hourlyRate}/hr</span>
          </div>
          <p className="text-[10px] text-ink-muted mb-2">
            {isKo
              ? '시간당 가치 — 시급이 아닌, 여행 중 1시간이 나에게 얼마의 가치인지 생각해보세요'
              : 'Not your salary — what is an hour of your vacation worth to you?'}
          </p>
          <input
            type="range"
            min={0}
            max={150}
            step={5}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full accent-teal"
          />
          <div className="flex justify-between text-[10px] text-ink-muted mt-1">
            <span>{isKo ? '$0 (시간 무관)' : '$0 (time is free)'}</span>
            <span>{isKo ? '$75 (적당히 중요)' : '$75 (moderate)'}</span>
            <span>{isKo ? '$150 (시간이 최우선)' : '$150 (time is everything)'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-ink-soft">
              {isKo ? '여행자 수' : 'Number of travelers'}
            </div>
            <div className="text-[10px] text-ink-muted">{isKo ? '항공권과 교통비에 곱해집니다' : 'Multiplies ticket + transport costs'}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTravelers(Math.max(1, travelers - 1))}
              disabled={travelers <= 1}
              className="w-8 h-8 rounded-lg border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-display font-semibold text-ink">{travelers}</span>
            <button
              type="button"
              onClick={() => setTravelers(Math.min(10, travelers + 1))}
              disabled={travelers >= 10}
              className="w-8 h-8 rounded-lg border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-5 rounded-xl border border-border bg-cream space-y-5">
        {/* Verdict */}
        <div className="text-center">
          {result.verdict === 'alt-wins' ? (
            <>
              <p className="text-2xl font-display font-bold text-sage">
                {isKo
                  ? `대체 공항이 ${formatCurrency(result.netSavings)} 더 저렴합니다`
                  : `The cheaper flight saves you ${formatCurrency(result.netSavings)}`}
              </p>
              <p className="text-sm text-ink-muted mt-1">
                {result.extraMinutes > 0
                  ? isKo
                    ? `하지만 왕복 ${formatMinutes(result.extraMinutes)} 더 소요됩니다`
                    : `But you'll spend ${formatMinutes(result.extraMinutes)} extra traveling (round trip)`
                  : isKo ? '이동 시간도 더 짧습니다!' : 'And it\'s actually faster too!'}
              </p>
            </>
          ) : result.verdict === 'main-wins' ? (
            <>
              <p className="text-2xl font-display font-bold text-coral">
                {isKo
                  ? `"저렴한" 항공편이 오히려 ${formatCurrency(Math.abs(result.netSavings))} 더 비쌉니다`
                  : `The "cheaper" flight actually costs ${formatCurrency(Math.abs(result.netSavings))} more`}
              </p>
              <p className="text-sm text-ink-muted mt-1">
                {isKo
                  ? `교통비와 이동 시간을 고려하면 주요 공항이 더 나은 선택입니다`
                  : `When you factor in transport costs and travel time, the main airport is the better deal`}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-display font-bold text-ink">
                {isKo ? '거의 차이가 없습니다' : 'It\'s basically a wash'}
              </p>
              <p className="text-sm text-ink-muted mt-1">
                {isKo
                  ? '편의성과 선호도에 따라 선택하세요'
                  : 'Go with whichever airport is more convenient'}
              </p>
            </>
          )}
        </div>

        {/* Cost bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-teal">{isKo ? 'Option A: 주요 공항' : 'Option A: Main Airport'}</span>
              <span className="font-display font-bold text-ink">{formatCurrency(mainTotal)}</span>
            </div>
            <div className="h-6 rounded-full bg-cream-dark overflow-hidden flex">
              <div
                className="h-full bg-teal/70 transition-all duration-300"
                style={{ width: `${((mainTicket * travelers) / maxCost) * 100}%` }}
                title={`Ticket: ${formatCurrency(mainTicket * travelers)}`}
              />
              <div
                className="h-full bg-teal/40 transition-all duration-300"
                style={{ width: `${((mainTransportCost * 2 * travelers) / maxCost) * 100}%` }}
                title={`Transport: ${formatCurrency(mainTransportCost * 2 * travelers)}`}
              />
              <div
                className="h-full bg-teal/20 transition-all duration-300"
                style={{ width: `${(((mainTransportMinutes * 2 / 60) * hourlyRate) / maxCost) * 100}%` }}
                title={`Time cost: ${formatCurrency(Math.round((mainTransportMinutes * 2 / 60) * hourlyRate))}`}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-amber">{isKo ? 'Option B: 대체 공항' : 'Option B: Alternative Airport'}</span>
              <span className="font-display font-bold text-ink">{formatCurrency(altTotal)}</span>
            </div>
            <div className="h-6 rounded-full bg-cream-dark overflow-hidden flex">
              <div
                className="h-full bg-amber/70 transition-all duration-300"
                style={{ width: `${((altTicket * travelers) / maxCost) * 100}%` }}
                title={`Ticket: ${formatCurrency(altTicket * travelers)}`}
              />
              <div
                className="h-full bg-amber/40 transition-all duration-300"
                style={{ width: `${((altTransportCost * 2 * travelers) / maxCost) * 100}%` }}
                title={`Transport: ${formatCurrency(altTransportCost * 2 * travelers)}`}
              />
              <div
                className="h-full bg-amber/20 transition-all duration-300"
                style={{ width: `${(((altTransportMinutes * 2 / 60) * hourlyRate) / maxCost) * 100}%` }}
                title={`Time cost: ${formatCurrency(Math.round((altTransportMinutes * 2 / 60) * hourlyRate))}`}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-[10px] text-ink-muted pt-1">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-teal/70 inline-block" /> {isKo ? '항공권' : 'Flight ticket'}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-teal/40 inline-block" /> {isKo ? '교통비 (왕복)' : 'Transport (round trip)'}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-teal/20 inline-block" /> {isKo ? '시간 비용' : 'Time cost'}</span>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-semibold text-ink-soft">{isKo ? '항목' : 'Breakdown'}</th>
                <th className="text-right py-2 font-semibold text-teal">{isKo ? '주요 공항' : 'Main Airport'}</th>
                <th className="text-right py-2 font-semibold text-amber">{isKo ? '대체 공항' : 'Alt Airport'}</th>
              </tr>
            </thead>
            <tbody className="text-ink-soft">
              <tr className="border-b border-border/50">
                <td className="py-1.5">{isKo ? '항공권' : 'Flight ticket'}{travelers > 1 ? ` x${travelers}` : ''}</td>
                <td className="text-right">{formatCurrency(mainTicket * travelers)}</td>
                <td className="text-right">{formatCurrency(altTicket * travelers)}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5">{isKo ? '교통비 (왕복)' : 'Ground transport (round trip)'}{travelers > 1 ? ` x${travelers}` : ''}</td>
                <td className="text-right">{formatCurrency(mainTransportCost * 2 * travelers)}</td>
                <td className="text-right">{formatCurrency(altTransportCost * 2 * travelers)}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5">
                  {isKo ? '이동 시간 비용' : 'Time cost'} ({formatMinutes(mainTransportMinutes * 2)} vs {formatMinutes(altTransportMinutes * 2)})
                </td>
                <td className="text-right">{formatCurrency(Math.round((mainTransportMinutes * 2 / 60) * hourlyRate))}</td>
                <td className="text-right">{formatCurrency(Math.round((altTransportMinutes * 2 / 60) * hourlyRate))}</td>
              </tr>
              <tr className="font-semibold text-ink">
                <td className="py-2">{isKo ? '실제 총비용' : 'True total cost'}</td>
                <td className="text-right">{formatCurrency(mainTotal)}</td>
                <td className="text-right">{formatCurrency(altTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Insight */}
        <div className="p-3 rounded-lg bg-cream-dark/60 text-xs text-ink-soft leading-relaxed">
          <p className="font-semibold text-ink mb-1">{isKo ? '인사이트' : 'The takeaway'}</p>
          {ticketSavings > 0 ? (
            <p>
              {isKo
                ? `대체 공항 항공권이 ${formatCurrency(ticketSavings * travelers)} 더 저렴하지만, 교통비 차이 ${formatCurrency(Math.abs(result.transportCostDifference))}와 이동 시간의 가치 ${formatCurrency(Math.abs(result.timeCostDifference))}을 고려하면 ${result.verdict === 'alt-wins' ? '여전히 좋은 선택입니다' : '주요 공항이 더 합리적입니다'}.`
                : `The alternative airport ticket is ${formatCurrency(ticketSavings * travelers)} cheaper, but after ${formatCurrency(Math.abs(result.transportCostDifference))} in extra transport and ${formatCurrency(Math.abs(result.timeCostDifference))} in time value, ${result.verdict === 'alt-wins' ? 'it\'s still the better deal.' : 'the main airport actually wins.'}`}
            </p>
          ) : (
            <p>
              {isKo
                ? '대체 공항 항공권이 더 비싸므로, 교통비와 시간을 고려하기 전부터 주요 공항이 더 나은 선택입니다.'
                : 'The alternative airport ticket isn\'t even cheaper before factoring in transport and time.'}
            </p>
          )}
          {hourlyRate === 0 && (
            <p className="mt-1 text-ink-muted italic">
              {isKo
                ? '시간 가치를 $0으로 설정하셨습니다. 시간이 무한하지 않다면 슬라이더를 올려보세요.'
                : 'You set your time value to $0. Unless you truly have unlimited time, try sliding it up.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
