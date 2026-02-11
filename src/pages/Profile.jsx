import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export default function Profile() {
  const [user, setUser] = useState(null)
  const { profile, updateProfile } = useProfile(user?.id)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name)
    if (profile?.phone) setPhone(profile.phone)
  }, [profile])

  const handleSave = async () => {
    await updateProfile({ full_name: fullName, phone })
    setEditing(false)
  }

  return (
    <div className="page-container">
      <h2>👤 Profile Dashboard</h2>
      <div className="profile-card modern">
        <div className="profile-avatar">{user?.email?.charAt(0).toUpperCase() || 'U'}</div>
        <div className="profile-info">
          <h3>{profile?.full_name || 'Kitchen Guardian'}</h3>
          <p>{user?.email}</p>
          <small>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</small>
        </div>
      </div>

      {editing ? (
        <div className="form-box">
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="form-input" />
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="form-input" />
          <div className="button-group">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      ) : <button onClick={() => setEditing(true)} className="btn-secondary">Edit Profile</button>}
    </div>
  )
}
