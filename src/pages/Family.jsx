import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'

export default function Family() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchMembers()

    // Set up real-time subscription for family members
    const subscription = supabase
      .channel('family_members_channel')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'family_members'
        },
        (payload) => {
          console.log('Family member change:', payload)

          if (payload.eventType === 'INSERT') {
            setMembers(prev => [...prev, payload.new])
            showToast(`${payload.new.email} added to family`, 'success')
          } else if (payload.eventType === 'UPDATE') {
            setMembers(prev => prev.map(m => m.id === payload.new.id ? payload.new : m))
          } else if (payload.eventType === 'DELETE') {
            setMembers(prev => prev.filter(m => m.id !== payload.old.id))
            showToast('Family member removed', 'info')
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [showToast])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Fetch members error:', error)
      showToast('Failed to load family members', 'error')
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const addMember = async () => {
    if (!email.trim()) {
      showToast('Please enter an email address', 'warning')
      return
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    try {
      setSubmitting(true)

      // Check if member already exists
      const { data: existing } = await supabase
        .from('family_members')
        .select('email')
        .eq('email', email.toLowerCase())
        .single()

      if (existing) {
        showToast('This email is already a family member', 'warning')
        return
      }

      const { error } = await supabase
        .from('family_members')
        .insert([{
          email: email.toLowerCase(),
          role: 'member',
          status: 'offline'
        }])

      if (error) throw error

      setEmail('')
      setShowAdd(false)
      showToast(`Invitation sent to ${email}`, 'success')
    } catch (error) {
      console.error('Add member error:', error)
      showToast('Failed to add family member', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const removeMember = async (memberId, memberEmail) => {
    if (!confirm(`Remove ${memberEmail} from family?`)) return

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
      // Toast will be shown by real-time subscription
    } catch (error) {
      console.error('Remove member error:', error)
      showToast('Failed to remove family member', 'error')
    }
  }

  return (
    <div>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>👨‍👩‍👧‍👦 Family Members</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage access to your kitchen ({members.length} members)</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary"
          style={{
            background: showAdd ? 'var(--danger)' : 'var(--primary)',
            borderColor: showAdd ? 'var(--danger)' : 'var(--primary)'
          }}
        >
          {showAdd ? '✕ Cancel' : '+ Add Member'}
        </button>
      </div>

      {showAdd && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Invite Family Member</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMember()}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-main)',
                  fontSize: '1rem'
                }}
                disabled={submitting}
              />
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                They will receive an invitation to join your kitchen monitoring
              </p>
            </div>
            <button
              onClick={addMember}
              className="btn-primary"
              disabled={submitting}
              style={{
                padding: '0.75rem 1.5rem',
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading family members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>No family members yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Add family members to share kitchen monitoring access
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary"
          >
            + Add First Member
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {members.map(member => (
            <div
              key={member.id}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1.25rem',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                marginRight: '1rem',
                boxShadow: '0 4px 10px rgba(187, 134, 252, 0.4)',
                textTransform: 'uppercase'
              }}>
                {member.email.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{member.email}</h4>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {member.role} • Added {new Date(member.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: member.status === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                    color: member.status === 'online' ? 'var(--success)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: member.status === 'online' ? 'var(--success)' : 'var(--text-muted)'
                  }}></span>
                  {member.status === 'online' ? 'Online' : 'Offline'}
                </span>
                <button
                  onClick={() => removeMember(member.id, member.email)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--danger)'
                    e.target.style.borderColor = 'var(--danger)'
                    e.target.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                    e.target.style.borderColor = 'var(--border)'
                    e.target.style.color = 'var(--text-muted)'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
