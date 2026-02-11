import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const defaultEmergencyContacts = [
  { id: 1, name: 'Kitchen Emergency', relation: 'Service', phone: '112' },
  { id: 2, name: 'Family Doctor', relation: 'Medical', phone: '+91 98765 43210' }
]

export default function Family() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState('')
  const [contacts, setContacts] = useState(defaultEmergencyContacts)
  const [contactForm, setContactForm] = useState({ name: '', relation: '', phone: '' })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase.from('family_members').select('*').order('created_at')
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
      const { error } = await supabase.from('family_members').insert([{ email, role: 'member' }])
      if (error) throw error
      setEmail('')
      setShowAdd(false)
      fetchMembers()
    } catch (error) {
      console.error('Add member error:', error)
    }
  }

  const addEmergencyContact = () => {
    if (!contactForm.name || !contactForm.phone) return
    setContacts(prev => [...prev, { ...contactForm, id: Date.now() }])
    setContactForm({ name: '', relation: '', phone: '' })
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🏠 Family Room</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary">{showAdd ? 'Close' : '+ Add Member'}</button>
      </div>

      {showAdd && (
        <div className="form-box">
          <input type="email" placeholder="Member email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />
          <button onClick={addMember} className="btn-primary">Invite</button>
        </div>
      )}

      {loading ? <p>Loading family members...</p> : (
        <div className="members-list">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-avatar">{member.email.charAt(0).toUpperCase()}</div>
              <div className="member-info"><h4>{member.email}</h4><p className="role">{member.role}</p></div>
              <span className={`status ${member.status || 'offline'}`}>{member.status === 'online' ? '🟢 Online' : '⚫ Offline'}</span>
            </div>
          ))}
        </div>
      )}

      <div className="settings-group">
        <h3>Emergency Contacts</h3>
        {contacts.map(contact => (
          <div key={contact.id} className="setting-item">
            <div><b>{contact.name}</b><p className="text-muted">{contact.relation || 'Family'}</p></div>
            <a className="btn-primary" href={`tel:${contact.phone}`}>Call {contact.phone}</a>
          </div>
        ))}

        <div className="contact-form">
          <input
            className="form-input"
            placeholder="Contact name"
            value={contactForm.name}
            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="form-input"
            placeholder="Relation / type"
            value={contactForm.relation}
            onChange={(e) => setContactForm(prev => ({ ...prev, relation: e.target.value }))}
          />
          <input
            className="form-input"
            placeholder="Phone number"
            value={contactForm.phone}
            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
          />
          <button onClick={addEmergencyContact} className="btn-secondary">+ Save Contact</button>
        </div>
      </div>
    </div>
  )
}
