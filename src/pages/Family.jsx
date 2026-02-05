import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Family() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .order('created_at')
      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Fetch members error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMember = async () => {
    if (!email) return
    try {
      const { error } = await supabase
        .from('family_members')
        .insert([{ email, role: 'member' }])
      if (error) throw error
      setEmail('')
      setShowAdd(false)
      fetchMembers()
    } catch (error) {
      console.error('Add member error:', error)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>👨‍👩‍👧‍👦 Family Members</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary">
          {showAdd ? '✕ Cancel' : '+ Add Member'}
        </button>
      </div>

      {showAdd && (
        <div className="form-box">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
          <button onClick={addMember} className="btn-primary">Invite</button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : members.length === 0 ? (
        <div className="empty-state">
          <p>No family members yet</p>
          <p className="text-muted">Invite members to share access</p>
        </div>
      ) : (
        <div className="members-list">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-avatar">{member.email.charAt(0).toUpperCase()}</div>
              <div className="member-info">
                <h4>{member.email}</h4>
                <p className="role">{member.role}</p>
              </div>
              <span className={`status ${member.status || 'offline'}`}>
                {member.status === 'online' ? '🟢' : '⚫'} {member.status || 'Offline'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
