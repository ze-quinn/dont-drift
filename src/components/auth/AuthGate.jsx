import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthGate({ children }) {
  const [session,  setSession]  = useState(undefined) // undefined = loading
  const [mode,     setMode]     = useState('signin')  // 'signin' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [message,  setMessage]  = useState(null)

  useEffect(() => {
    // If Supabase isn't configured, skip auth entirely
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setSession(null) // null = no session → show login (or we could skip to app)
      console.warn('Supabase env vars missing — auth disabled')
      return
    }

    // Timeout safety — if getSession hangs (bad keys etc), show login after 5s
    const timeout = setTimeout(() => setSession(null), 5000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      setSession(session)
    }).catch(() => {
      clearTimeout(timeout)
      setSession(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  // Still checking session
  if (session === undefined) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg)',
      }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem',
          color: 'var(--text-3)', letterSpacing: '0.15em' }}>
          loading…
        </div>
      </div>
    )
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
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // session change handled by onAuthStateChange above
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
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="20" cy="26" r="12" fill="var(--brass)" opacity="0.9"/>
              <circle cx="32" cy="20" r="8"  fill="var(--aqua)"  opacity="0.7"/>
              <circle cx="14" cy="16" r="5"  fill="var(--brass)" opacity="0.5"/>
              <circle cx="34" cy="32" r="4"  fill="var(--aqua)"  opacity="0.4"/>
              <circle cx="22" cy="11" r="3"  fill="var(--brass)" opacity="0.35"/>
              {/* specular dots */}
              <circle cx="17" cy="22" r="1.5" fill="white" opacity="0.4"/>
              <circle cx="30" cy="17" r="1"   fill="white" opacity="0.35"/>
            </svg>
          </div>

          <h1 className="font-serif font-light" style={{
            fontSize: '2.5rem', color: 'var(--text-1)', margin: '0 0 6px', lineHeight: 1,
          }}>
            Don't Drift
          </h1>
          <div className="label-xs">Your ocean, any device</div>
        </div>

        {/* Art deco rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--brass)' }} />
          <div style={{ width: 4, height: 4, background: 'var(--brass)', transform: 'rotate(45deg)' }} />
          <div style={{ flex: 1, height: 1, background: 'var(--brass)' }} />
        </div>

        {/* Mode toggle */}
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
            {loading ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

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
