import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const SEA_FACTS = [
  { animal: '🐋', fact: 'Blue whales are the largest animals ever known to have lived — their hearts are the size of a small car.' },
  { animal: '🐬', fact: 'Dolphins sleep with one eye open, resting one hemisphere of their brain at a time.' },
  { animal: '🐙', fact: 'Octopuses have three hearts, blue blood, and can taste with their suckers.' },
  { animal: '🦑', fact: 'Giant squids have the largest eyes of any animal — up to 30 cm wide, the size of a dinner plate.' },
  { animal: '🪼', fact: 'Jellyfish have no brain, heart, or bones — and have existed for over 500 million years.' },
  { animal: '🐡', fact: 'Pufferfish can inflate to three times their normal size by swallowing water.' },
  { animal: '🐢', fact: 'Sea turtles can hold their breath for up to 7 hours while resting underwater.' },
  { animal: '🦈', fact: "Sharks are older than trees — they've been swimming the oceans for 450 million years." },
  { animal: '🐠', fact: "Clownfish can change sex — all clownfish are born male; the dominant one becomes female." },
  { animal: '🦞', fact: "Lobsters communicate by peeing at each other from glands located in their faces." },
  { animal: '🐚', fact: "A seahorse is the only animal where the male carries and gives birth to the young." },
  { animal: '🌊', fact: "The ocean covers 71% of Earth's surface but over 80% of it remains unexplored." },
]

function LoadingScreen() {
  const [factIdx] = useState(() => Math.floor(Math.random() * SEA_FACTS.length))
  const { animal, fact } = SEA_FACTS[factIdx]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg)',
      padding: 32, textAlign: 'center',
    }}>
      {/* Pulsing bubble logo */}
      <div style={{ position: 'relative', marginBottom: 36 }}>
        <style>{`
          @keyframes bubblePulse {
            0%, 100% { transform: scale(1);    opacity: 0.9; }
            50%       { transform: scale(1.08); opacity: 1;   }
          }
          @keyframes bubblePulse2 {
            0%, 100% { transform: scale(1);    opacity: 0.55; }
            50%       { transform: scale(1.06); opacity: 0.7;  }
          }
          @keyframes bubblePulse3 {
            0%, 100% { transform: scale(1);    opacity: 0.35; }
            50%       { transform: scale(1.05); opacity: 0.5;  }
          }
        `}</style>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Large ring */}
          <circle cx="32" cy="46" r="20"
            fill="none" stroke="var(--brass)" strokeWidth="2"
            style={{ transformOrigin: '32px 46px', animation: 'bubblePulse 2.4s ease-in-out infinite' }}
          />
          {/* Medium ring */}
          <circle cx="52" cy="30" r="13"
            fill="none" stroke="var(--brass)" strokeWidth="1.8"
            style={{ transformOrigin: '52px 30px', animation: 'bubblePulse2 2.4s ease-in-out 0.3s infinite' }}
          />
          {/* Small ring */}
          <circle cx="20" cy="25" r="8"
            fill="none" stroke="var(--brass)" strokeWidth="1.5"
            style={{ transformOrigin: '20px 25px', animation: 'bubblePulse3 2.4s ease-in-out 0.6s infinite' }}
          />
          {/* Specular dots */}
          <circle cx="26" cy="40" r="2"   fill="var(--brass)" opacity="0.55"/>
          <circle cx="48" cy="27" r="1.4" fill="var(--brass)" opacity="0.4"/>
          <circle cx="16" cy="22" r="0.9" fill="var(--brass)" opacity="0.3"/>
        </svg>
      </div>

      {/* Fact */}
      <div style={{ maxWidth: 320 }}>
        <div style={{ fontSize: '2rem', marginBottom: 16, lineHeight: 1 }}>{animal}</div>
        <p style={{
          fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
          color: 'var(--text-2)', lineHeight: 1.65, margin: 0,
        }}>
          {fact}
        </p>
      </div>

      {/* Loading label */}
      <div style={{
        marginTop: 40, fontFamily: 'DM Mono, monospace',
        fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.2em',
      }}>
        loading…
      </div>
    </div>
  )
}

export default function AuthGate({ children }) {
  const [session,     setSession]     = useState(undefined) // undefined = loading
  const [mode,        setMode]        = useState('signin')  // 'signin' | 'signup' | 'forgot' | 'reset'
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [message,     setMessage]     = useState(null)

  useEffect(() => {
    // If Supabase isn't configured, skip auth entirely
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setSession(null)
      console.warn('Supabase env vars missing — auth disabled')
      return
    }

    const timeout = setTimeout(() => setSession(null), 5000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      setSession(session)
    }).catch(() => {
      clearTimeout(timeout)
      setSession(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      // User clicked the reset link in their email — show the set-new-password form
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset')
        setError(null)
        setMessage(null)
      }
    })
    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  // Still checking session
  if (session === undefined) return <LoadingScreen />

  // Password reset mode — user is temporarily logged in via recovery token
  if (session && mode === 'reset') {
    async function handleReset(e) {
      e.preventDefault()
      setError(null)
      setLoading(true)
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
        setMode('signin')
        setNewPassword('')
        // Sign out so they log in fresh with new password
        await supabase.auth.signOut()
        setSession(null)
        setMessage('Password updated. Please sign in with your new password.')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    return <ResetPasswordScreen
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      onSubmit={handleReset}
      loading={loading}
      error={error}
    />
  }

  // Logged in — render the app
  if (session) return children

  // ── Auth screen ──────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: 'https://dont-drift.vercel.app' },
        })
        if (error) throw error
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('signin')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://dont-drift.vercel.app',
        })
        if (error) throw error
        setMessage('Reset link sent — check your email.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem',
    background: 'var(--bg-input)', border: '1px solid var(--border-dim)',
    borderRadius: 1, color: 'var(--text-1)', outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }} className="animate-fade-in">

        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          {/* Bubble cluster mark */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="22" cy="30" r="13"  fill="none" stroke="var(--brass)" strokeWidth="1.8" opacity="0.9"/>
              <circle cx="34" cy="21" r="8.5" fill="none" stroke="var(--brass)" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="14" cy="18" r="5.5" fill="none" stroke="var(--brass)" strokeWidth="1.3" opacity="0.4"/>
              <circle cx="18.5" cy="26" r="1.6" fill="var(--brass)" opacity="0.55"/>
              <circle cx="31"   cy="18" r="1.1" fill="var(--brass)" opacity="0.4"/>
              <circle cx="12"   cy="16" r="0.7" fill="var(--brass)" opacity="0.3"/>
            </svg>
          </div>

          <h1 className="font-serif font-light" style={{
            fontSize: '2.5rem', color: 'var(--text-1)', margin: '0 0 6px', lineHeight: 1,
          }}>
            Don't Drift
          </h1>
          <div className="label-xs">Just keep swimming</div>
        </div>

        {/* Art deco rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--brass)' }} />
          <div style={{ width: 4, height: 4, background: 'var(--brass)', transform: 'rotate(45deg)' }} />
          <div style={{ flex: 1, height: 1, background: 'var(--brass)' }} />
        </div>

        {/* Mode toggle — only for signin/signup */}
        {mode !== 'forgot' && (
          <div style={{
            display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 1,
            marginBottom: 24, overflow: 'hidden', width: '100%',
          }}>
            {[['signin', 'Sign in'], ['signup', 'Create account']].map(([key, label]) => (
              <button key={key} onClick={() => { setMode(key); setError(null); setMessage(null) }}
                style={{
                  flex: 1, padding: '9px 0',
                  fontSize: '0.65rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  background: mode === key ? 'rgba(201,168,76,0.1)' : 'transparent',
                  color: mode === key ? 'var(--brass)' : 'var(--text-3)',
                  borderBottom: mode === key ? '2px solid var(--brass)' : '2px solid transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Forgot password heading */}
        {mode === 'forgot' && (
          <div style={{ marginBottom: 24 }}>
            <div className="font-serif font-light" style={{ fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: 4 }}>
              Reset password
            </div>
            <div className="label-xs">We'll send a link to your email.</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div className="label-xs" style={{ marginBottom: 6 }}>Email</div>
            <input
              type="email" value={email} required
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'}
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="label-xs" style={{ marginBottom: 6 }}>Password</div>
              <input
                type="password" value={password} required minLength={6}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'}
              />
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 12px', fontSize: '0.75rem',
              background: 'rgba(91,156,196,0.08)', border: '1px solid rgba(91,156,196,0.25)',
              borderRadius: 1, color: 'var(--negative)', fontFamily: 'DM Sans, sans-serif',
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              padding: '10px 12px', fontSize: '0.75rem',
              background: 'rgba(126,207,192,0.08)', border: '1px solid rgba(126,207,192,0.25)',
              borderRadius: 1, color: 'var(--aqua)', fontFamily: 'DM Sans, sans-serif',
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-brass"
            style={{ marginTop: 4, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'One moment…'
              : mode === 'signup' ? 'Create account'
              : mode === 'forgot' ? 'Send reset link'
              : 'Sign in'}
          </button>
        </form>

        {/* Forgot password link (sign in only) */}
        {mode === 'signin' && (
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <button
              onClick={() => { setMode('forgot'); setError(null); setMessage(null) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.7rem', color: 'var(--text-3)',
                fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
                textDecoration: 'underline', textDecorationColor: 'var(--border-dim)',
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Back to sign in (forgot mode) */}
        {mode === 'forgot' && (
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <button
              onClick={() => { setMode('signin'); setError(null); setMessage(null) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.7rem', color: 'var(--text-3)',
                fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
                textDecoration: 'underline', textDecorationColor: 'var(--border-dim)',
              }}
            >
              Back to sign in
            </button>
          </div>
        )}

        {mode === 'signup' && (
          <div style={{
            marginTop: 16, fontSize: '0.7rem', color: 'var(--text-3)',
            fontFamily: 'DM Sans, sans-serif', textAlign: 'center', lineHeight: 1.6,
          }}>
            Your existing data on this device will be synced to your new account automatically.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Set new password screen (shown after clicking reset link) ────
function ResetPasswordScreen({ newPassword, setNewPassword, onSubmit, loading, error }) {
  const inputStyle = {
    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem',
    background: 'var(--bg-input)', border: '1px solid var(--border-dim)',
    borderRadius: 1, color: 'var(--text-1)', outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }} className="animate-fade-in">
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="22" cy="30" r="13"  fill="none" stroke="var(--brass)" strokeWidth="1.8" opacity="0.9"/>
              <circle cx="34" cy="21" r="8.5" fill="none" stroke="var(--brass)" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="14" cy="18" r="5.5" fill="none" stroke="var(--brass)" strokeWidth="1.3" opacity="0.4"/>
            </svg>
          </div>
          <h1 className="font-serif font-light" style={{ fontSize: '2rem', color: 'var(--text-1)', margin: '0 0 6px', lineHeight: 1 }}>
            New password
          </h1>
          <div className="label-xs">Choose something you'll remember.</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--brass)' }} />
          <div style={{ width: 4, height: 4, background: 'var(--brass)', transform: 'rotate(45deg)' }} />
          <div style={{ flex: 1, height: 1, background: 'var(--brass)' }} />
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div className="label-xs" style={{ marginBottom: 6 }}>New password</div>
            <input
              type="password" value={newPassword} required minLength={6}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'}
              autoFocus
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 12px', fontSize: '0.75rem',
              background: 'rgba(91,156,196,0.08)', border: '1px solid rgba(91,156,196,0.25)',
              borderRadius: 1, color: 'var(--negative)', fontFamily: 'DM Sans, sans-serif',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading} className="btn-brass"
            style={{ marginTop: 4, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
