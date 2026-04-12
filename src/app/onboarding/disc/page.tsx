'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ChevronLeft, LayoutGrid, Info, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type DiscType = 'D' | 'I' | 'S' | 'C'

interface DiscOption {
  text: string
  type: DiscType
}

interface DiscQuestion {
  id: number
  section: string
  options: DiscOption[]
}

interface QuestionAnswer {
  most: number   // index of selected option
  least: number  // index of selected option
}

interface DiscScores {
  D: number
  I: number
  S: number
  C: number
}

// ─── DISC Questions ────────────────────────────────────────────────────────────

const SECTIONS = [
  'Work Style',
  'Leadership & Decision Making',
  'Communication & Relationships',
  'Challenges & Pressure',
]

const QUESTIONS: DiscQuestion[] = [
  // Section 1 — Work Style
  { id: 1,  section: SECTIONS[0], options: [{ text: 'Daring',       type: 'D' }, { text: 'Cautious',     type: 'C' }, { text: 'Expressive',   type: 'I' }, { text: 'Gentle',       type: 'S' }] },
  { id: 2,  section: SECTIONS[0], options: [{ text: 'Forceful',     type: 'D' }, { text: 'Precise',      type: 'C' }, { text: 'Enthusiastic', type: 'I' }, { text: 'Supportive',   type: 'S' }] },
  { id: 3,  section: SECTIONS[0], options: [{ text: 'Pioneering',   type: 'D' }, { text: 'Optimistic',   type: 'I' }, { text: 'Systematic',   type: 'C' }, { text: 'Stable',       type: 'S' }] },
  { id: 4,  section: SECTIONS[0], options: [{ text: 'Competitive',  type: 'D' }, { text: 'Accurate',     type: 'C' }, { text: 'Popular',      type: 'I' }, { text: 'Patient',      type: 'S' }] },
  { id: 5,  section: SECTIONS[0], options: [{ text: 'Decisive',     type: 'D' }, { text: 'Consistent',   type: 'S' }, { text: 'Persuasive',   type: 'I' }, { text: 'Diplomatic',   type: 'C' }] },
  { id: 6,  section: SECTIONS[0], options: [{ text: 'Results-driven', type: 'D' }, { text: 'Analytical', type: 'C' }, { text: 'Inspiring',    type: 'I' }, { text: 'Loyal',        type: 'S' }] },
  { id: 7,  section: SECTIONS[0], options: [{ text: 'Bold',         type: 'D' }, { text: 'Meticulous',   type: 'C' }, { text: 'Sociable',     type: 'I' }, { text: 'Peaceful',     type: 'S' }] },

  // Section 2 — Leadership & Decision Making
  { id: 8,  section: SECTIONS[1], options: [{ text: 'Commanding',   type: 'D' }, { text: 'Thoughtful',   type: 'C' }, { text: 'Motivating',   type: 'I' }, { text: 'Cooperative',  type: 'S' }] },
  { id: 9,  section: SECTIONS[1], options: [{ text: 'Direct',       type: 'D' }, { text: 'Careful',      type: 'C' }, { text: 'Outgoing',     type: 'I' }, { text: 'Steady',       type: 'S' }] },
  { id: 10, section: SECTIONS[1], options: [{ text: 'Assertive',    type: 'D' }, { text: 'Systematic',   type: 'C' }, { text: 'Talkative',    type: 'I' }, { text: 'Reliable',     type: 'S' }] },
  { id: 11, section: SECTIONS[1], options: [{ text: 'Strong-willed', type: 'D' }, { text: 'Conscientious', type: 'C' }, { text: 'Charming',    type: 'I' }, { text: 'Accommodating', type: 'S' }] },
  { id: 12, section: SECTIONS[1], options: [{ text: 'Independent',  type: 'D' }, { text: 'Logical',      type: 'C' }, { text: 'Playful',      type: 'I' }, { text: 'Agreeable',    type: 'S' }] },
  { id: 13, section: SECTIONS[1], options: [{ text: 'Tenacious',    type: 'D' }, { text: 'Precise',      type: 'C' }, { text: 'Lively',       type: 'I' }, { text: 'Devoted',      type: 'S' }] },
  { id: 14, section: SECTIONS[1], options: [{ text: 'Ambitious',    type: 'D' }, { text: 'Detailed',     type: 'C' }, { text: 'Generous',     type: 'I' }, { text: 'Balanced',     type: 'S' }] },

  // Section 3 — Communication & Relationships
  { id: 15, section: SECTIONS[2], options: [{ text: 'Demanding',    type: 'D' }, { text: 'Reserved',     type: 'C' }, { text: 'Animated',     type: 'I' }, { text: 'Warm',         type: 'S' }] },
  { id: 16, section: SECTIONS[2], options: [{ text: 'Frank',        type: 'D' }, { text: 'Factual',      type: 'C' }, { text: 'Cheerful',     type: 'I' }, { text: 'Considerate',  type: 'S' }] },
  { id: 17, section: SECTIONS[2], options: [{ text: 'Adventurous',  type: 'D' }, { text: 'Methodical',   type: 'C' }, { text: 'Spontaneous',  type: 'I' }, { text: 'Easygoing',    type: 'S' }] },
  { id: 18, section: SECTIONS[2], options: [{ text: 'Confrontational', type: 'D' }, { text: 'Objective', type: 'C' }, { text: 'Vivacious',   type: 'I' }, { text: 'Gentle',       type: 'S' }] },
  { id: 19, section: SECTIONS[2], options: [{ text: 'Driven',       type: 'D' }, { text: 'Orderly',      type: 'C' }, { text: 'Expressive',   type: 'I' }, { text: 'Patient',      type: 'S' }] },
  { id: 20, section: SECTIONS[2], options: [{ text: 'Decisive',     type: 'D' }, { text: 'Accurate',     type: 'C' }, { text: 'Trusting',     type: 'I' }, { text: 'Sincere',      type: 'S' }] },
  { id: 21, section: SECTIONS[2], options: [{ text: 'Urgent',       type: 'D' }, { text: 'Systematic',   type: 'C' }, { text: 'Open',         type: 'I' }, { text: 'Modest',       type: 'S' }] },

  // Section 4 — Challenges & Pressure
  { id: 22, section: SECTIONS[3], options: [{ text: 'Impatient',    type: 'D' }, { text: 'Perfectionist', type: 'C' }, { text: 'Impulsive',   type: 'I' }, { text: 'Indecisive',   type: 'S' }] },
  { id: 23, section: SECTIONS[3], options: [{ text: 'Blunt',        type: 'D' }, { text: 'Critical',     type: 'C' }, { text: 'Disorganized', type: 'I' }, { text: 'Passive',      type: 'S' }] },
  { id: 24, section: SECTIONS[3], options: [{ text: 'Domineering',  type: 'D' }, { text: 'Withdrawn',    type: 'C' }, { text: 'Talkative',    type: 'I' }, { text: 'Complacent',   type: 'S' }] },
  { id: 25, section: SECTIONS[3], options: [{ text: 'Overconfident', type: 'D' }, { text: 'Skeptical',   type: 'C' }, { text: 'Overpromising', type: 'I' }, { text: 'Resistant',    type: 'S' }] },
  { id: 26, section: SECTIONS[3], options: [{ text: 'Aggressive',   type: 'D' }, { text: 'Rigid',        type: 'C' }, { text: 'Superficial',  type: 'I' }, { text: 'Stubborn',     type: 'S' }] },
  { id: 27, section: SECTIONS[3], options: [{ text: 'Inflexible',   type: 'D' }, { text: 'Overcautious', type: 'C' }, { text: 'Excitable',    type: 'I' }, { text: 'Too lenient',  type: 'S' }] },
  { id: 28, section: SECTIONS[3], options: [{ text: 'Egotistical',  type: 'D' }, { text: 'Unsociable',   type: 'C' }, { text: 'Restless',     type: 'I' }, { text: 'Docile',       type: 'S' }] },
]

// ─── DISC Type Definitions ────────────────────────────────────────────────────

const DISC_INFO: Record<DiscType, { label: string; color: string; bg: string; border: string; description: string; traits: string[] }> = {
  D: {
    label: 'Dominance',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    description: 'You are results-oriented, decisive, and direct. You thrive on challenges, take initiative, and drive toward your goals with confidence and urgency.',
    traits: ['Results-oriented', 'Decisive', 'Competitive', 'Direct', 'Strong-willed', 'Pioneering', 'Problem-solver'],
  },
  I: {
    label: 'Influence',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    description: 'You are enthusiastic, optimistic, and people-oriented. You inspire others, build relationships easily, and bring energy and creativity to everything you do.',
    traits: ['Enthusiastic', 'Optimistic', 'Persuasive', 'Sociable', 'Creative', 'Collaborative', 'Inspiring'],
  },
  S: {
    label: 'Steadiness',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description: 'You are patient, reliable, and team-focused. You value stability, consistency, and building deep relationships. You are a dependable team player.',
    traits: ['Patient', 'Loyal', 'Dependable', 'Consistent', 'Supportive', 'Empathetic', 'Team-oriented'],
  },
  C: {
    label: 'Conscientiousness',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'You are analytical, accurate, and systematic. You prioritize quality, follow processes, and make decisions based on data and thorough analysis.',
    traits: ['Analytical', 'Accurate', 'Systematic', 'Careful', 'Logical', 'Detail-oriented', 'Quality-focused'],
  },
}

const TYPE_COLORS: Record<DiscType, string> = {
  D: 'bg-red-500',
  I: 'bg-yellow-400',
  S: 'bg-green-500',
  C: 'bg-blue-500',
}

// ─── Welcome Screen ────────────────────────────────────────────────────────────

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="w-full max-w-2xl animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-[0.2em]">Phase 1: Self-Discovery</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter text-gray-900 mb-4">
          DISC Assessment
        </h1>
        <p className="text-gray-500 font-light max-w-md mx-auto leading-relaxed">
          Deepen your self-awareness and optimize how you build, lead, and collaborate within the INCUBX ecosystem.
        </p>
      </div>

      <Card className="shadow-premium overflow-hidden border-none bg-white/80 backdrop-blur-xl">
        <CardContent className="p-8 md:p-12">
          <div className="grid grid-cols-2 gap-4 mb-10">
            {(Object.entries(DISC_INFO) as [DiscType, typeof DISC_INFO.D][]).map(([type, info]) => (
              <div key={type} className={cn('rounded-2xl border p-5 transition-all hover:scale-[1.02]', info.bg, info.border)}>
                <div className="flex items-center justify-between mb-3">
                  <span className={cn('text-2xl font-black', info.color)}>{type}</span>
                  <div className={cn('h-1.5 w-1.5 rounded-full', info.color.replace('text', 'bg'))} />
                </div>
                <h3 className={cn('text-sm font-bold uppercase tracking-wider mb-2', info.color)}>{info.label}</h3>
                <p className="text-[11px] text-gray-600 leading-normal opacity-80">
                  {info.description.split('.')[0]}.
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest text-center">Guidelines</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                '28 questions across 4 distinct work dimensions',
                'Identify word pairs that highlight your strengths and growth areas',
                'Choose instinctively — your first reaction is often the most accurate',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <span className="text-[10px] font-bold text-indigo-600">{i + 1}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-light leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-200/50 group" onClick={onStart}>
            Begin Assessment
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-[0.2em] font-medium">
            Estimated time: 8-10 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  questionIndex,
  total,
  answer,
  onAnswer,
  onBack,
  onNext,
}: {
  question: DiscQuestion
  questionIndex: number
  total: number
  answer: QuestionAnswer | undefined
  onAnswer: (most: number, least: number) => void
  onBack: () => void
  onNext: () => void
}) {
  const [most, setMost] = useState<number | null>(answer?.most ?? null)
  const [least, setLeast] = useState<number | null>(answer?.least ?? null)

  const isValid = most !== null && least !== null && most !== least
  const progress = ((questionIndex) / total) * 100

  function handleMost(idx: number) {
    setMost(idx)
    if (least === idx) setLeast(null)
  }

  function handleLeast(idx: number) {
    setLeast(idx)
    if (most === idx) setMost(null)
  }

  function handleNext() {
    if (!isValid) return
    onAnswer(most!, least!)
    onNext()
  }

  const currentSection = question.section
  const sectionIdx = SECTIONS.indexOf(currentSection) + 1

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
            Section {sectionIdx} — {currentSection}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            Question {questionIndex + 1} of {total}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-gray-900">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="shadow-md">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-base font-semibold text-gray-800 mb-6 text-center">
            Which words describe you?
          </h2>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_80px_80px] gap-2 mb-2 px-1">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Word</div>
            <div className="text-xs text-center font-semibold text-indigo-700 uppercase tracking-wide">Most</div>
            <div className="text-xs text-center font-semibold text-gray-500 uppercase tracking-wide">Least</div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((opt, idx) => (
              <div
                key={idx}
                className={cn(
                  'grid grid-cols-[1fr_80px_80px] gap-2 items-center rounded-lg border px-4 py-3 transition-colors',
                  most === idx
                    ? 'border-indigo-300 bg-indigo-50'
                    : least === idx
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <span className="text-sm font-medium text-gray-900">{opt.text}</span>

                {/* Most radio */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleMost(idx)}
                    disabled={least === idx}
                    className={cn(
                      'h-5 w-5 rounded-full border-2 transition-colors flex items-center justify-center',
                      most === idx
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300 bg-white hover:border-indigo-400',
                      least === idx && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    {most === idx && (
                      <span className="h-2 w-2 rounded-full bg-white block" />
                    )}
                  </button>
                </div>

                {/* Least radio */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleLeast(idx)}
                    disabled={most === idx}
                    className={cn(
                      'h-5 w-5 rounded-full border-2 transition-colors flex items-center justify-center',
                      least === idx
                        ? 'border-gray-600 bg-gray-600'
                        : 'border-gray-300 bg-white hover:border-gray-500',
                      most === idx && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    {least === idx && (
                      <span className="h-2 w-2 rounded-full bg-white block" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              size="md"
              onClick={onBack}
              disabled={questionIndex === 0}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              size="md"
              onClick={handleNext}
              disabled={!isValid}
              className="flex-2 flex-1"
            >
              {questionIndex === total - 1 ? 'See Results' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Results Screen ────────────────────────────────────────────────────────────

function ResultsScreen({
  scores,
  primaryType,
  onComplete,
  saving,
}: {
  scores: DiscScores
  primaryType: DiscType
  onComplete: () => void
  saving: boolean
}) {
  const info = DISC_INFO[primaryType]
  const maxScore = Math.max(...Object.values(scores))

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <span className="text-4xl font-extrabold tracking-tight text-indigo-700">INCUBX</span>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-8">
          {/* Primary type hero */}
          <div className={cn('rounded-xl border-2 p-6 mb-6 text-center', info.bg, info.border)}>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-2">
              Your Primary Style
            </p>
            <div className={cn('text-7xl font-black mb-2', info.color)}>
              {primaryType}
            </div>
            <h2 className={cn('text-xl font-bold mb-3', info.color)}>{info.label}</h2>
            <p className="text-sm text-gray-700 leading-relaxed max-w-md mx-auto">
              {info.description}
            </p>
          </div>

          {/* Score bars */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Score Breakdown</h3>
          <div className="space-y-3 mb-6">
            {(Object.entries(scores) as [DiscType, number][]).map(([type, score]) => {
              const pct = maxScore > 0 ? Math.max(0, (score / (maxScore * 1.2)) * 100) : 0
              const tInfo = DISC_INFO[type]
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className={cn('text-sm font-bold w-4 shrink-0', tInfo.color)}>{type}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', TYPE_COLORS[type])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-6 text-right">{score}</span>
                </div>
              )
            })}
          </div>

          {/* Traits */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Traits</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {info.traits.map((trait) => (
              <span
                key={trait}
                className={cn('rounded-full px-3 py-1 text-xs font-medium border', info.bg, info.border, info.color)}
              >
                {trait}
              </span>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={onComplete}
            isLoading={saving}
            disabled={saving}
          >
            {saving ? 'Saving results…' : 'Complete Profile'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DiscPage() {
  const router = useRouter()
  const [step, setStep] = useState<'welcome' | 'questions' | 'results'>('welcome')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, QuestionAnswer>>({})
  const [scores, setScores] = useState<DiscScores>({ D: 0, I: 0, S: 0, C: 0 })
  const [primaryType, setPrimaryType] = useState<DiscType>('D')
  const [saving, setSaving] = useState(false)

  function calculateScores(answersMap: Record<number, QuestionAnswer>): DiscScores {
    const result: DiscScores = { D: 0, I: 0, S: 0, C: 0 }

    QUESTIONS.forEach((q) => {
      const answer = answersMap[q.id]
      if (!answer) return
      // Add for MOST, subtract for LEAST
      const mostType = q.options[answer.most].type
      const leastType = q.options[answer.least].type
      result[mostType] += 1
      result[leastType] -= 1
    })

    return result
  }

  function handleAnswer(most: number, least: number) {
    const question = QUESTIONS[currentQ]
    const newAnswers = { ...answers, [question.id]: { most, least } }
    setAnswers(newAnswers)
  }

  function handleNext() {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      // Calculate final scores
      const finalAnswers = { ...answers }
      const question = QUESTIONS[currentQ]
      // answers already saved by handleAnswer before onNext
      const computed = calculateScores(finalAnswers)
      setScores(computed)

      // Find primary type
      const entries = Object.entries(computed) as [DiscType, number][]
      const primary = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
      setPrimaryType(primary)
      setStep('results')
    }
  }

  function handleBack() {
    if (currentQ > 0) setCurrentQ(currentQ - 1)
  }

  async function handleComplete() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const discPayload = {
        D: scores.D,
        I: scores.I,
        S: scores.S,
        C: scores.C,
        primary_type: primaryType,
        completed_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('users')
        .update({
          disc_results: discPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        // Table may not have disc_results column — try upsert to disc_results table
        await supabase.from('disc_results').upsert({
          user_id: user.id,
          scores: discPayload,
          primary_type: primaryType,
          completed_at: new Date().toISOString(),
        })
      }

      router.push('/onboarding/profile')
    } catch {
      // Continue even if save fails
      router.push('/onboarding/profile')
    } finally {
      setSaving(false)
    }
  }

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <WelcomeScreen onStart={() => setStep('questions')} />
      </div>
    )
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ResultsScreen
          scores={scores}
          primaryType={primaryType}
          onComplete={handleComplete}
          saving={saving}
        />
      </div>
    )
  }

  const currentQuestion = QUESTIONS[currentQ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <QuestionCard
        question={currentQuestion}
        questionIndex={currentQ}
        total={QUESTIONS.length}
        answer={answers[currentQuestion.id]}
        onAnswer={handleAnswer}
        onBack={handleBack}
        onNext={handleNext}
      />
    </div>
  )
}
