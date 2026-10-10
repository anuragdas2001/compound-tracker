'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Flame, Minus, Plus, X } from 'lucide-react';

import { C, fontDisplay, fontMono } from './constants';

/* ----------------------------------------------------------------------- */
/* Types & shared helpers (export so Today / Insights can reuse them)      */
/* ----------------------------------------------------------------------- */

export type HabitMode = 'daily' | 'days' | 'flex';
export type HabitGoal = 'done' | 'count';
export type HabitColor = 'green' | 'sky' | 'violet' | 'rose' | 'amber' | 'teal';

export interface NewHabitDraft {
  name: string;
  /** daily = every day, days = chosen weekdays, flex = N days a week on any days */
  mode: HabitMode;
  /** Weekday indexes, Mon = 0 ... Sun = 6 (matches `weekDays` in MomentumApp). Used when mode === 'days'. */
  days: number[];
  /** Used when mode === 'flex' (1-6). */
  perWeek: number;
  goal: HabitGoal;
  /** Used when goal === 'count'. */
  target: number;
  unit: string;
  /** Short reason, shown back to the user when they need it. */
  why: string;
  /** "Smallest version" for hard days. Completing it still counts. */
  mini: string;
  color: HabitColor;
}

export interface NewHabitModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (draft: NewHabitDraft) => void;
  isSubmitting?: boolean;
  habitToEdit?: { 
    name: string; category?: string; color?: string; 
    mode?: string; days?: number[]; perWeek?: number; goal?: string; target?: number; unit?: string; why?: string; mini?: string; 
  } | null;
}

export const HABIT_COLORS: Record<HabitColor, string> = {
  green: '#22C55E',
  sky: '#38BDF8',
  violet: '#A78BFA',
  rose: '#FB7185',
  amber: '#FBBF24',
  teal: '#2DD4BF',
};

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const QUICK: (Partial<NewHabitDraft> & { name: string })[] = [
  { name: 'Drink water', goal: 'count', target: 8, unit: 'glasses', color: 'sky' },
  { name: 'Read 10 pages', mini: 'Read one page', color: 'violet' },
  { name: 'Walk outside', mini: 'Step out for five minutes', color: 'green' },
  { name: 'Stretch', mini: 'Touch your toes once', color: 'teal' },
  { name: 'Journal', mini: 'Write one sentence', color: 'rose' },
  { name: 'Meditate', mini: 'Three slow breaths', color: 'amber' },
];

export function scheduleLabel(h: Pick<NewHabitDraft, 'mode' | 'days' | 'perWeek'>) {
  if (h.mode === 'daily') return 'Every day';
  if (h.mode === 'flex') return `${h.perWeek}× a week, any days`;
  const d = [...h.days].sort((a, b) => a - b);
  if (d.length === 7) return 'Every day';
  if (d.join() === '0,1,2,3,4') return 'Weekdays';
  if (d.join() === '5,6') return 'Weekends';
  return d.map((i) => WEEK[i]).join(' · ');
}

const emptyDraft = (): NewHabitDraft => ({
  name: '',
  mode: 'daily',
  days: [0, 1, 2, 3, 4],
  perWeek: 3,
  goal: 'done',
  target: 8,
  unit: '',
  why: '',
  mini: '',
  color: 'green',
});

/* ----------------------------------------------------------------------- */
/* Small UI pieces                                                         */
/* ----------------------------------------------------------------------- */

const inputCls =
  'w-full rounded-xl border px-3.5 py-3 text-base outline-none transition-colors placeholder:text-[#7E9486]/70 focus:border-[#22C55E]/70 focus:ring-2 focus:ring-[#22C55E]/20';
const inputStyle: React.CSSProperties = {
  borderColor: C.border,
  backgroundColor: C.surfaceSoft,
  color: C.text,
};

function Label({
  htmlFor,
  id,
  children,
  aside,
}: {
  htmlFor?: string;
  id?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        id={id}
        className="text-[11px] font-medium uppercase tracking-[0.16em]"
        style={{ color: C.muted, ...fontMono }}
      >
        {children}
      </label>
      {aside && (
        <span className="text-xs" style={{ color: C.muted }}>
          {aside}
        </span>
      )}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  labelledBy,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  labelledBy: string;
}) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="grid gap-1 rounded-2xl border p-1"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        borderColor: C.border,
        backgroundColor: C.surfaceSoft,
      }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className="rounded-xl px-2 py-2.5 text-sm font-medium transition-all"
            style={{
              backgroundColor: on ? C.deep : 'transparent',
              color: on ? '#FFFFFF' : C.muted,
              fontWeight: on ? 600 : 500,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Modal                                                                   */
/* ----------------------------------------------------------------------- */

export function AddHabitModal({ open, onClose, onCreate, isSubmitting = false, habitToEdit }: NewHabitModalProps) {
  const [draft, setDraft] = useState<NewHabitDraft>(emptyDraft);
  const [moreOpen, setMoreOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const set = <K extends keyof NewHabitDraft>(k: K, v: NewHabitDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // Fresh form each time it opens; restore focus when it closes.
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    
    if (habitToEdit) {
      setDraft({
        ...emptyDraft(),
        name: habitToEdit.name,
        why: habitToEdit.why || habitToEdit.category || '',
        color: (habitToEdit.color as HabitColor) || 'green',
        mode: (habitToEdit.mode as HabitMode) || 'daily',
        days: habitToEdit.days || [0, 1, 2, 3, 4],
        perWeek: habitToEdit.perWeek || 3,
        goal: (habitToEdit.goal as HabitGoal) || 'done',
        target: habitToEdit.target || 8,
        unit: habitToEdit.unit || '',
        mini: habitToEdit.mini || '',
      });
      setMoreOpen(!!habitToEdit.why || !!habitToEdit.category || !!habitToEdit.mini || !!habitToEdit.unit);
    } else {
      setDraft(emptyDraft());
      setMoreOpen(false);
    }
    
    const t = setTimeout(() => nameRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      returnFocus.current?.focus?.();
    };
  }, [open, habitToEdit]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const name = draft.name.trim();
  const problem = !name
    ? 'Give it a name to continue'
    : draft.mode === 'days' && draft.days.length === 0
    ? 'Pick at least one day'
    : draft.goal === 'count' && draft.target < 2
    ? 'Set a target of 2 or more'
    : '';
  const canSubmit = !problem && !isSubmitting;

  const color = HABIT_COLORS[draft.color];
  const dueToday = (() => {
    if (draft.mode !== 'days') return true;
    const todayIdx = (new Date().getDay() + 6) % 7;
    return draft.days.includes(todayIdx);
  })();
  const nextDue = (() => {
    const todayIdx = (new Date().getDay() + 6) % 7;
    for (let k = 1; k <= 7; k++) {
      const i = (todayIdx + k) % 7;
      if (draft.days.includes(i)) return WEEK[i];
    }
    return '';
  })();

  const applyQuick = (q: (typeof QUICK)[number]) => {
    setDraft((d) => ({
      ...d,
      name: q.name,
      goal: q.goal ?? 'done',
      target: q.target ?? 8,
      unit: q.unit ?? '',
      mini: q.mini ?? '',
      color: q.color ?? d.color,
    }));
    setMoreOpen(true);
    nameRef.current?.focus();
  };

  const toggleDay = (i: number) =>
    setDraft((d) => ({
      ...d,
      days: d.days.includes(i) ? d.days.filter((x) => x !== i) : [...d.days, i].sort((a, b) => a - b),
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onCreate({
      ...draft,
      name,
      days: draft.mode === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : draft.days,
      unit: draft.unit.trim(),
      why: draft.why.trim(),
      mini: draft.mini.trim(),
      target: draft.goal === 'count' ? draft.target : 1,
    });
  };

  const modeHint =
    draft.mode === 'daily'
      ? 'Due every day. Do it at any hour.'
      : draft.mode === 'days'
      ? 'Due only on the days you pick. Other days it rests.'
      : 'Hit the number any way you like. No fixed days.';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nh-title"
        className="grid max-h-[92vh] w-full max-w-[900px] overflow-y-auto rounded-[26px] border shadow-2xl md:grid-cols-[minmax(0,1fr)_300px]"
        style={{ borderColor: C.borderHover, backgroundColor: C.surface }}
      >
        {/* ============ FORM ============ */}
        <form onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-[22px] p-5 pb-0 sm:p-[26px] sm:pb-0">
          <div className="flex items-center justify-between">
            <h2 id="nh-title" className="text-2xl font-semibold" style={{ color: C.text, ...fontDisplay }}>
              {habitToEdit ? 'Edit habit' : 'New habit'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:text-[var(--c-text)]"
              style={{ borderColor: C.border, backgroundColor: C.surfaceSoft, color: C.muted }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nh-name" aside={`${draft.name.length}/40`}>
              What will you do?
            </Label>
            <input
              id="nh-name"
              ref={nameRef}
              value={draft.name}
              maxLength={40}
              autoComplete="off"
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Read 10 pages"
              className={inputCls}
              style={inputStyle}
            />
            <div className="flex flex-wrap gap-2" aria-label="Quick start ideas">
              {QUICK.map((q) => {
                const on = draft.name === q.name;
                return (
                  <button
                    key={q.name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => applyQuick(q)}
                    className="rounded-full border px-3.5 py-1.5 text-[13px] transition-colors hover:text-[var(--c-text)]"
                    style={{
                      borderColor: on ? C.primary : C.border,
                      backgroundColor: on ? `${C.primary}29` : C.surfaceSoft,
                      color: on ? C.text : C.muted,
                    }}
                  >
                    {q.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days */}
          <div className="flex flex-col gap-2">
            <Label id="nh-days">Which days?</Label>
            <Segmented<HabitMode>
              labelledBy="nh-days"
              value={draft.mode}
              onChange={(v) => set('mode', v)}
              options={[
                { value: 'daily', label: 'Every day' },
                { value: 'days', label: 'Pick days' },
                { value: 'flex', label: 'Flexible' },
              ]}
            />

            {draft.mode === 'days' && (
              <div className="grid grid-cols-7 gap-1.5">
                {WEEK.map((d, i) => {
                  const on = draft.days.includes(i);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleDay(i)}
                      className="rounded-xl border py-2.5 text-[12.5px] font-medium transition-colors"
                      style={{
                        borderColor: on ? C.primary : C.border,
                        backgroundColor: on ? `${C.primary}2E` : C.surfaceSoft,
                        color: on ? C.text : C.muted,
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            )}

            {draft.mode === 'flex' && (
              <div className="flex flex-wrap items-center gap-3.5">
                <div className="inline-flex items-center overflow-hidden rounded-xl border" style={{ borderColor: C.border }}>
                  <button
                    type="button"
                    aria-label="Fewer days per week"
                    disabled={draft.perWeek <= 1}
                    onClick={() => set('perWeek', Math.max(1, draft.perWeek - 1))}
                    className="flex h-10 w-10 items-center justify-center transition-colors enabled:hover:bg-[var(--c-border-hover)] disabled:opacity-35"
                    style={{ backgroundColor: C.surface, color: C.muted }}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <output className="min-w-[44px] text-center text-base" style={{ color: C.text, ...fontMono }}>
                    {draft.perWeek}
                  </output>
                  <button
                    type="button"
                    aria-label="More days per week"
                    disabled={draft.perWeek >= 6}
                    onClick={() => set('perWeek', Math.min(6, draft.perWeek + 1))}
                    className="flex h-10 w-10 items-center justify-center transition-colors enabled:hover:bg-[var(--c-border-hover)] disabled:opacity-35"
                    style={{ backgroundColor: C.surface, color: C.muted }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[12.5px]" style={{ color: C.muted }}>
                  days a week, on any days you like
                </p>
              </div>
            )}

            <p className="text-[12.5px]" style={{ color: C.muted }}>
              {modeHint}
            </p>
          </div>

          {/* More options */}
          <div className="border-t pt-4" style={{ borderColor: C.border }}>
            <button
              type="button"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((o) => !o)}
              className="flex w-full items-center justify-between text-sm font-medium"
              style={{ color: C.text }}
            >
              <span>
                More options{' '}
                <span className="ml-1 text-[12.5px] font-normal" style={{ color: C.muted }}>
                  all optional
                </span>
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} style={{ color: C.muted }} />
            </button>

            {moreOpen && (
              <div className="flex flex-col gap-[18px] pt-[18px]">
                <div className="flex flex-col gap-2">
                  <Label id="nh-goal">How do you finish it?</Label>
                  <Segmented<HabitGoal>
                    labelledBy="nh-goal"
                    value={draft.goal}
                    onChange={(v) => set('goal', v)}
                    options={[
                      { value: 'done', label: 'Just done' },
                      { value: 'count', label: 'Reach a count' },
                    ]}
                  />
                  {draft.goal === 'count' && (
                    <div className="grid gap-2.5 sm:grid-cols-[110px_minmax(0,1fr)]">
                      <input
                        type="number"
                        min={2}
                        max={99}
                        aria-label="Daily target"
                        value={draft.target || ''}
                        onChange={(e) => set('target', Math.min(99, parseInt(e.target.value, 10) || 0))}
                        className={inputCls}
                        style={inputStyle}
                      />
                      <input
                        aria-label="Unit"
                        maxLength={14}
                        value={draft.unit}
                        onChange={(e) => set('unit', e.target.value)}
                        placeholder="glasses, pages, minutes"
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="nh-why" aside="shown when you need it">
                    Why it matters
                  </Label>
                  <input
                    id="nh-why"
                    maxLength={80}
                    value={draft.why}
                    onChange={(e) => set('why', e.target.value)}
                    placeholder="e.g. A calmer mind before sleep"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="nh-mini" aside="for hard days">
                    Smallest version
                  </Label>
                  <input
                    id="nh-mini"
                    maxLength={40}
                    value={draft.mini}
                    onChange={(e) => set('mini', e.target.value)}
                    placeholder="e.g. Read one page"
                    className={inputCls}
                    style={inputStyle}
                  />
                  <p className="text-[12.5px]" style={{ color: C.muted }}>
                    Doing this still counts, so a rough day never breaks your chain.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label id="nh-colour">Colour</Label>
                  <div role="group" aria-labelledby="nh-colour" className="flex flex-wrap gap-2.5">
                    {(Object.keys(HABIT_COLORS) as HabitColor[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        aria-label={k}
                        aria-pressed={draft.color === k}
                        onClick={() => set('color', k)}
                        className="h-[30px] w-[30px] rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: HABIT_COLORS[k],
                          borderColor: draft.color === k ? C.text : 'transparent',
                          boxShadow: `0 0 0 2px ${C.surface}`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky footer */}
          <div
            className="sticky bottom-0 z-[2] -mx-5 mt-auto flex flex-wrap items-center justify-end gap-2.5 border-t px-5 py-3.5 sm:-mx-[26px] sm:px-[26px]"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            <p
              className="mr-auto text-[12.5px]"
              style={{ color: name && problem ? C.danger : C.muted }}
              aria-live="polite"
            >
              {problem}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border px-5 py-3 text-sm font-medium transition-colors hover:text-[var(--c-text)]"
              style={{ borderColor: C.border, color: C.muted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: C.primary, color: '#FFFFFF' }}
            >
              {isSubmitting ? 'Saving…' : habitToEdit ? 'Save changes' : 'Create habit'}
            </button>
          </div>
        </form>

        {/* ============ LIVE PREVIEW ============ */}
        <aside
          aria-label="Preview"
          className="flex flex-col gap-3.5 border-t p-5 sm:p-[26px] md:rounded-r-[26px] md:border-l md:border-t-0"
          style={{ borderColor: C.border, backgroundColor: C.surfaceSoft }}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: C.muted, ...fontMono }}>
            How it looks on Today
          </span>

          <div
            className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3.5 rounded-2xl border p-3.5"
            style={{ borderColor: C.border, backgroundColor: C.surfaceSoft }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border-2"
              style={{ borderColor: `${color}8C` }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="break-words font-semibold" style={{ color: C.text }}>
                {name || 'Your new habit'}
              </p>
              <p className="mt-0.5 text-[12.5px]" style={{ color: C.muted }}>
                {scheduleLabel(draft)}
                {draft.goal === 'count' && ` · 0 / ${Math.max(2, draft.target)}${draft.unit.trim() ? ` ${draft.unit.trim()}` : ''}`}
              </p>
              {draft.goal === 'count' && (
                <div className="mt-2.5 h-1.5 rounded-full" style={{ backgroundColor: C.border }} />
              )}
              {draft.why.trim() && (
                <p className="mt-1.5 text-[13.5px] italic" style={{ color: C.muted, ...fontDisplay }}>
                  “{draft.why.trim()}”
                </p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
                  style={{ borderColor: `${color}59`, backgroundColor: `${color}1F`, color, ...fontMono }}
                >
                  <Flame className="h-3 w-3" />0
                </span>
                {draft.mini.trim() && (
                  <span
                    className="max-w-full truncate rounded-full border border-dashed px-3 py-1 text-xs"
                    style={{ borderColor: C.borderHover, color: C.muted }}
                  >
                    Small version: {draft.mini.trim()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-[13px]" style={{ color: C.muted }}>
            No clock, no deadline. It is simply due on its days, and you finish it whenever you like.
          </p>

          <div
            className="mt-auto rounded-xl border p-3 text-[12.5px]"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
          >
            {dueToday ? (
              <>
                <b style={{ color: C.text }}>Due today.</b> It will appear in your To do list right away.
              </>
            ) : (
              <>
                <b style={{ color: C.text }}>Not due today.</b> It rests until {nextDue}.
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AddHabitModal;
