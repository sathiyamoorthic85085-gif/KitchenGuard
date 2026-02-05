import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export default function Profile() {
  const [user, setUser] = useState(null)
  const { profile, updateProfile } = useProfile(user?.id)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')

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
    await updateProfile({ full_name: fullName })
    setEditing(false)
  }

  return (
    <div className="page-container">
      <h2>👤 Profile</h2>

      <div className="profile-card">
        <div className="profile-avatar">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <h3>{profile?.full_name || 'User'}</h3>
          <p>{user?.email}</p>
          <small>Member since {new Date(user?.created_at).toLocaleDateString()}</small>
        </div>
      </div>

      {editing ? (
        <div className="form-box">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="form-input"
          />
          <div className="button-group">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="btn-secondary">Edit Profile</button>
      )}

      <div className="profile-section">
        <h4>Account Settings</h4>
        <ul>
          <li>Email: {user?.email}</li>
          <li>Auth Method: Google OAuth</li>
          <li>Two-Factor: Disabled</li>
        </ul>
      </div>
    </div>
  )
}
