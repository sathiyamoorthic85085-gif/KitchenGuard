import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'

export default function Profile() {
  const [user, setUser] = useState(null)
  const { profile, updateProfile } = useProfile(user?.id)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name)
  }, [profile])

  const handleSave = async () => {
    if (!fullName.trim()) {
      showToast('Please enter a name', 'warning')
      return
    }

    try {
      setSaving(true)
      await updateProfile({ full_name: fullName.trim() })
      setEditing(false)
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      showToast('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFullName(profile?.full_name || '')
    setEditing(false)
    showToast('Changes cancelled', 'info')
  }

  return (
    <div>
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
        <div style={{
          width: '100px', height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: '2.5rem',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 10px 30px rgba(187, 134, 252, 0.5)',
          border: '4px solid rgba(255,255,255,0.1)',
          textTransform: 'uppercase'
        }}>
          {user?.email?.charAt(0) || 'U'}
        </div>

        {editing ? (
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="form-input"
              style={{
                marginBottom: '1rem',
                textAlign: 'center',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-hover)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                width: '100%'
              }}
              disabled={saving}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={saving}
                style={{
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary"
                disabled={saving}
                style={{
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {profile?.full_name || 'Kitchen Guardian'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{user?.email}</p>
            <button onClick={() => setEditing(true)} className="btn-secondary">
              ✏️ Edit Profile
            </button>
          </div>
        )}
      </div>

      <div className="glass-card">
        <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem', fontSize: '1.2rem' }}>
          Account Details
        </h4>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Email</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
            <span style={{ color: 'var(--text-main)' }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Auth Method</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <span style={{ fontSize: '1.2rem' }}>🔐</span> Google OAuth
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Account Status</span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--success)',
              fontWeight: 600
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--success)'
              }}></span>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
