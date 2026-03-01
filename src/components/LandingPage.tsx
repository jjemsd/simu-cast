/**
 * SimuCast — Landing Page (TSX)
 * Matches the light theme screenshot exactly
 *
 * ─────────────────────────────────────────────────────────
 *  🎨 THEME COLORS
 * ─────────────────────────────────────────────────────────
 *  --bg              #f8f8fa   Off-white page background
 *  --bg-white        #ffffff   Cards, nav surface
 *  --border          #e5e7eb   Subtle card borders
 *
 *  --accent          #f97316   Orange-500  — primary CTA, headline, buttons
 *  --accent-hover    #ea6c0a   Orange-600  — hover state
 *  --accent-light    #fff7ed   Orange-50   — badge/pill backgrounds
 *  --accent-border   #fed7aa   Orange-200  — badge borders
 *
 *  --text-primary    #111827   Near-black  — headlines
 *  --text-body       #374151   Dark grey   — body copy
 *  --text-muted      #6b7280   Mid grey    — labels / sub-text
 *
 *  --purple          #8b5cf6   Violet-500  — Precision bar (matching screenshot)
 *  --green           #16a34a   Green-600   — Improvement metric
 * ─────────────────────────────────────────────────────────
 */

import { useEffect } from 'react';
import { CheckCircle2, Play } from 'lucide-react';
import { AnimateIn } from './AnimateIn';

// ─── Props ────────────────────────────────────────────────────────────────────
interface LandingPageProps {
  onGetStarted: () => void;
  scrollToDemo?: boolean;
  onShowAuth: () => void;
}

// ─── Shared style tokens ──────────────────────────────────────────────────────
const C = {
  accent:        '#f97316',
  accentHover:   '#ea6c0a',
  accentLight:   '#fff7ed',
  accentBorder:  '#fed7aa',
  bg:            '#f8f8fa',
  white:         '#ffffff',
  border:        '#e5e7eb',
  textPrimary:   '#111827',
  textBody:      '#374151',
  textMuted:     '#6b7280',
  purple:        '#8b5cf6',
  green:         '#16a34a',
  greenLight:    '#f0fdf4',
  greenBorder:   '#bbf7d0',
};

// ─── Component ────────────────────────────────────────────────────────────────
export function LandingPage({ onGetStarted, scrollToDemo, onShowAuth }: LandingPageProps) {

  useEffect(() => {
    if (scrollToDemo) {
      setTimeout(() => {
        document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [scrollToDemo]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.textPrimary, fontFamily: "'Sora', sans-serif" }}>

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Brand */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40,
              background: C.accent,
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, color: '#fff', letterSpacing: 0.5,
            }}>SC</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.textPrimary }}>SimuCast</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Predictive Analytics Platform</div>
            </div>
          </a>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 36 }} className="hidden md:flex">
            {[
              { label: 'Features',     id: 'features'    },
              { label: 'Workflow',     id: 'workflow'     },
              { label: 'Designed For', id: 'designed-for' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: C.textBody, fontSize: 14, fontWeight: 500,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.textBody; e.currentTarget.style.transform = 'scale(1)'; }}
              >{label}</button>
            ))}
          </div>

          {/* Launch CTA */}
          <button
            onClick={onShowAuth}
            style={{
              background: C.accent, border: 'none', color: '#fff',
              fontWeight: 600, fontSize: 14, padding: '10px 20px',
              borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          >
            Launch Platform →
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 48, alignItems: 'center',
        }}>

          {/* Left — text */}
          <AnimateIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Badge pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px',
              background: C.accentLight, border: `1px solid ${C.accentBorder}`,
              borderRadius: 999, width: 'fit-content',
              fontSize: 13, color: C.accent, fontWeight: 500,
            }}>
              ⚡ Predictive Modeling &amp; What-if Analysis Platform
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
              <span style={{ color: C.accent }}>Predictive Intelligence</span>
              <br />
              <span style={{ color: C.textPrimary }}>for Data-Driven Decisions</span>
            </h1>

            {/* Sub */}
            <p style={{ fontSize: 17, color: C.textBody, lineHeight: 1.7, margin: 0, maxWidth: 500 }}>
              Transform your data into strategic insights with machine learning,
              scenario analysis, and actionable recommendations, all without
              writing a single line of code.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={onGetStarted}
                style={{
                  background: C.accent, border: 'none', color: '#fff',
                  fontWeight: 700, fontSize: 15, padding: '13px 28px',
                  borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              >
                Get Started Free →
              </button>
              <button
                onClick={() => scrollTo('demo-section')}
                style={{
                  background: 'transparent',
                  border: `2px solid ${C.textPrimary}`,
                  color: C.textPrimary,
                  fontWeight: 600, fontSize: 15, padding: '12px 28px',
                  borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = C.textPrimary;
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = C.textPrimary;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              >
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
              gap: 16, paddingTop: 20,
              borderTop: `1px solid ${C.border}`,
            }}>
              {[
                { val: '5+',      label: 'ML Models'            },
                { val: 'What-if', label: 'Scenarios'            },
                { val: 'Dataset', label: 'Expansion Generation' },
                { val: 'Report',  label: 'Generations'          },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div style={{ fontSize: val.length <= 3 ? 24 : 16, fontWeight: 700, color: C.textPrimary }}>{val}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          </AnimateIn>

          {/* Right — Floating cards */}
          <AnimateIn delay={200}>
          <div style={{ position: 'relative', height: 480 }}>

            {/* Card 1 — Model Performance */}
            <div style={{
              position: 'absolute', top: 20, left: 20, width: 290,
              background: C.white,
              borderRadius: 16, padding: '20px 24px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.accent, display: 'inline-block', flexShrink: 0 }} />
                Model Performance
              </div>
              {[
                { label: 'Accuracy',  pct: 85, color: C.accent  },
                { label: 'Precision', pct: 78, color: C.purple  },
              ].map(({ label, pct, color }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.textMuted, marginBottom: 7 }}>
                    <span>{label}</span>
                    <span style={{ fontWeight: 600, color: C.textPrimary }}>{pct}%</span>
                  </div>
                  <div style={{ height: 7, background: '#f3f4f6', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Improvement badge */}
            <div style={{
              position: 'absolute', top: 200, right: 20,
              width: 108, height: 108,
              background: C.accent,
              borderRadius: 18,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(249,115,22,0.35)',
              color: '#fff',
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>+12%</span>
              <span style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>Improvement</span>
            </div>

            {/* Card 2 — AI Insight */}
            <div style={{
              position: 'absolute', bottom: 20, left: 60, width: 280,
              background: C.white,
              borderRadius: 16, padding: '20px 24px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
                🤖 AI Insight
              </div>
              <p style={{ fontSize: 13, color: C.textBody, lineHeight: 1.6, margin: '0 0 14px' }}>
                Records with high engagement metrics show 23% better outcomes.
              </p>
              <button
                onClick={() => scrollTo('features')}
                style={{
                  background: C.accent, border: 'none', color: '#fff',
                  fontSize: 13, fontWeight: 600, padding: '8px 16px',
                  borderRadius: 7, cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              >
                View Details
              </button>
            </div>

          </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── DEMO ─────────────────────────────────────────────────────── */}
      <AnimateIn>
      <section id="demo-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 16px',
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 999, fontSize: 13, color: C.textMuted, marginBottom: 16,
          }}>
            ▶ Product Walkthrough
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>
            See SimuCast in Action
          </h2>
          <p style={{ fontSize: 17, color: C.textMuted, maxWidth: 520, margin: '0 auto' }}>
            Watch this quick demo to learn how SimuCast transforms student data into strategic insights
          </p>
        </div>

        {/* Player */}
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            border: `1px solid ${C.border}`,
            background: C.white,
          }}>
            {/* Screen */}
            <div style={{
              aspectRatio: '16/9', background: '#1e1e2e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12, cursor: 'pointer',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: C.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 32px rgba(249,115,22,0.5)`,
              }}>
                <Play size={28} color="#fff" style={{ marginLeft: 4 }} />
              </div>
              <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>SimuCast Platform Demo</p>
              <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>5 min walkthrough</p>
            </div>
            {/* Controls */}
            <div style={{
              background: C.white, padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderTop: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>0:00</span>
              <div style={{ flex: 1, height: 4, background: '#f3f4f6', borderRadius: 99 }} />
              <span style={{ fontSize: 12, color: C.textMuted }}>5:25</span>
            </div>
          </div>

          {/* Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 24 }}>
            {[
              { icon: '⚙️', title: 'Quick Setup',        desc: 'Upload data and start analysing in under 2 minutes' },
              { icon: '✋', title: 'No Coding Required', desc: 'Point-and-click interface for all ML operations'     },
              { icon: '💡', title: 'Instant Insights',   desc: 'AI-powered recommendations in real-time'            },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </AnimateIn>

      {/* ── WORKFLOW ─────────────────────────────────────────────────── */}
      <AnimateIn>
      <section id="workflow" style={{
        background: `linear-gradient(135deg, ${C.accentLight}, #fdf4ff, ${C.accentLight})`,
        borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>Simple 5-Step Workflow</h2>
            <p style={{ fontSize: 17, color: C.textMuted, margin: 0 }}>From data upload to actionable insights in minutes</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
            {[
              { num: '1', icon: '📤', title: 'Upload Data',    sub: 'CSV or Excel files'   },
              { num: '2', icon: '🧠', title: 'Build Models',   sub: 'AI training & tuning' },
              { num: '3', icon: '🔬', title: 'Test Scenarios', sub: 'What-if analysis'     },
              { num: '4', icon: '📊', title: 'View Insights',  sub: 'AI recommendations'  },
              { num: '5', icon: '📄', title: 'Export Report',  sub: 'PDF & Excel'          },
            ].map(({ num, icon, title, sub }, i, arr) => (
              <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: 130 }}>
                  <div style={{ position: 'relative', marginBottom: 14 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: C.white, border: `2px solid ${C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                    }}>{icon}</div>
                    <div style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 24, height: 24, borderRadius: '50%',
                      background: C.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                    }}>{num}</div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ color: C.textMuted, fontSize: 22, margin: '0 2px', paddingBottom: 28 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      </AnimateIn>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <AnimateIn>
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>Everything You Need</h2>
          <p style={{ fontSize: 17, color: C.textMuted, margin: 0 }}>Comprehensive analytics suite for educational institutions</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16 }}>

          {/* Wide — Predictive Modeling */}
          <div style={{
            gridColumn: 'span 4',
            background: `linear-gradient(135deg, #fff7ed, #fffbf5)`,
            border: `1px solid ${C.accentBorder}`,
            borderRadius: 20, padding: 32,
          }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🧮</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>Advanced Predictive Modeling</h3>
            <p style={{ color: C.textBody, lineHeight: 1.7, margin: '0 0 20px', fontSize: 15 }}>
              Train and compare multiple machine learning models including Random Forest, Gradient Boosting,
              Neural Networks, and more. Fine-tune hyperparameters and achieve up to 94% prediction accuracy.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Random Forest', 'Gradient Boosting', 'Neural Networks', 'SVM'].map(tag => (
                <span key={tag} style={{
                  padding: '4px 12px', borderRadius: 999,
                  background: C.accentLight, border: `1px solid ${C.accentBorder}`,
                  fontSize: 12, fontWeight: 500, color: C.accent,
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Tall — Synthetic Data */}
          <div style={{
            gridColumn: 'span 2', gridRow: 'span 2',
            background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
            border: '1px solid #bfdbfe',
            borderRadius: 20, padding: 28,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: 34, marginBottom: 16 }}>🧬</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>Synthetic Data Engine</h3>
            <p style={{ color: C.textBody, lineHeight: 1.7, fontSize: 14, margin: '0 0 20px', flex: 1 }}>
              Generate statistically valid synthetic records to expand small datasets while maintaining
              data distributions and correlations.
            </p>
            {['Preserve correlations', 'Maintain distributions', 'Quality validation'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: C.textBody }}>
                <CheckCircle2 size={15} style={{ color: '#3b82f6', flexShrink: 0 }} /> {item}
              </div>
            ))}
          </div>

          {/* Wide — What-If */}
          <div style={{
            gridColumn: 'span 4',
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 20, padding: 28,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 34, marginBottom: 14 }}>🔀</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 6px' }}>Interactive What-If Scenarios</h3>
            <p style={{ color: C.textMuted, fontSize: 14, margin: '0 0 20px' }}>Test unlimited intervention scenarios in real-time.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { label: 'Base Outcome', val: '72.5%', bg: '#f9fafb', color: C.textPrimary, border: C.border },
                { label: 'With Changes', val: '84.2%', bg: C.accentLight,  color: C.accent,  border: C.accentBorder },
                { label: 'Improvement',  val: '+11.7%', bg: C.greenLight,  color: C.green,   border: C.greenBorder  },
              ].map(({ label, val, bg, color, border }) => (
                <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Small cards */}
          {[
            { icon: '💡', title: 'AI Insights',      desc: 'Automated recommendations and risk alerts powered by your live models.'   },
            { icon: '📑', title: 'Export Reports',   desc: 'Professional PDF and Excel reports ready to share with stakeholders.'      },
            { icon: '📈', title: 'Visual Analytics', desc: 'Interactive charts and dashboards to explore every angle of your data.'    },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              gridColumn: 'span 2',
              background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 20, padding: 24,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              transition: 'box-shadow .2s, border-color .2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 6px 24px rgba(249,115,22,0.12)`;
                e.currentTarget.style.borderColor = C.accentBorder;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = C.border;
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
      </AnimateIn>

      {/* ── DESIGNED FOR ─────────────────────────────────────────────── */}
      <AnimateIn>
      <section id="designed-for" style={{
        background: '#f3f4f6',
        borderTop: `1px solid ${C.border}`,
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>Designed For</h2>
            <p style={{ fontSize: 17, color: C.textMuted, margin: 0 }}>Supporting diverse educational stakeholders</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              {
                icon: '🎓', title: 'Academic Administrators',
                desc: 'Make data-driven decisions on resource allocation, intervention programs, and student support strategies.',
                checks: ['Enrollment forecasting', 'Retention planning'],
                checkColor: C.accent,
              },
              {
                icon: '🔬', title: 'Educational Researchers',
                desc: 'Analyse patterns, test hypotheses, and publish findings with comprehensive analytical tools.',
                checks: ['Pattern discovery', 'Hypothesis testing'],
                checkColor: C.purple,
              },
              {
                icon: '📊', title: 'Data Analysts',
                desc: 'Streamline workflows with automated modelling, scenario testing, and report generation capabilities.',
                checks: ['Automated workflows', 'Quick reporting'],
                checkColor: '#3b82f6',
              },
            ].map(({ icon, title, desc, checks, checkColor }) => (
              <div key={title} style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: 20, padding: 28,
                transition: 'box-shadow .2s, transform .2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.10)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 12px' }}>{title}</h3>
                <p style={{ fontSize: 14, color: C.textBody, lineHeight: 1.7, margin: '0 0 20px' }}>{desc}</p>
                {checks.map(c => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, color: C.textBody }}>
                    <CheckCircle2 size={15} style={{ color: checkColor, flexShrink: 0 }} /> {c}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
      </AnimateIn>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <AnimateIn>
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{
          borderRadius: 28, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${C.accent}, #ea580c)`,
          padding: '72px 48px', textAlign: 'center',
          boxShadow: `0 20px 60px rgba(249,115,22,0.30)`,
        }}>
          <div style={{ position: 'absolute', top: -60, left: '15%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, right: '15%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(50px)', pointerEvents: 'none' }} />

          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', margin: '0 0 16px', position: 'relative' }}>
            Ready to Transform Your Analytics?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7, position: 'relative' }}>
            Join institutions leveraging SimuCast for predictive insights and strategic decision-making.
          </p>
          <button
            onClick={onGetStarted}
            style={{
              background: '#fff', border: 'none', color: C.accent,
              fontWeight: 700, fontSize: 16, padding: '14px 32px',
              borderRadius: 10, cursor: 'pointer', position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.20)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          >
            Try SimuCast Now →
          </button>
        </div>
      </section>
      </AnimateIn>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.white, padding: '28px 24px' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: C.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}>SC</div>
            <span style={{ fontSize: 14, color: C.textMuted, fontWeight: 500 }}>SimuCast Platform</span>
          </div>
          <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>© 2024 SimuCast Platform</p>
        </div>
      </footer>

    </div>
  );
}