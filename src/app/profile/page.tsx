'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Save, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter'
import { useOptimizedLoading } from '@/contexts/OptimizedLoadingContext'
import SharedSidebar from '@/components/layout/SharedSidebar'
import SimpleLoader from '@/components/ui/SimpleLoader'
import { createClient } from '@/utils/supabase/client'

export default function ProfilePage() {
  const { user, loading, updatePassword } = useAuth()
  const { setPageLoading } = useOptimizedLoading()
  const router = useOptimizedRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    title: '',
    phone: '',
    country: '',
    language: '',
    address: ''
  })

  useEffect(() => {
    if (!loading && !user) {
      setPageLoading(true, 'Redirecting to authentication...')
      router.push('/auth')
    } else if (user && !loading) {
      setPageLoading(false)
    }
  }, [loading, router, setPageLoading, user])

  useEffect(() => {
    if (!user) return

    const metadata = (user.user_metadata as Record<string, string>) || {}
    setFormData({
      fullName: metadata.full_name || (user.email ? user.email.split('@')[0] : 'User'),
      email: user.email || '',
      title: metadata.title || '',
      phone: metadata.phone || '',
      country: metadata.country || '',
      language: metadata.language || 'English',
      address: metadata.address || ''
    })
    setProfileImage(metadata.avatar_url || null)
  }, [user])

  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status.type])

  if (loading) {
    return <SimpleLoader message="Loading profile..." />
  }

  if (!user) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setStatus({ type: null, message: '' })

    try {
      const supabase = createClient()
      let avatarUrl = (user.user_metadata as Record<string, string>)?.avatar_url || null

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, selectedFile, { upsert: true })

        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
          avatarUrl = data.publicUrl
        }
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          title: formData.title,
          phone: formData.phone,
          country: formData.country,
          language: formData.language,
          address: formData.address,
          avatar_url: avatarUrl
        }
      })

      if (error) {
        setStatus({ type: 'error', message: 'Failed to update profile.' })
      } else {
        setStatus({ type: 'success', message: 'Profile updated successfully.' })
        setSelectedFile(null)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setStatus({ type: 'error', message: 'Something went wrong while saving.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setStatus({ type: 'error', message: 'Please confirm the new password correctly.' })
      return
    }

    const result = await updatePassword(passwordForm.currentPassword, passwordForm.newPassword)
    if (result.error) {
      setStatus({ type: 'error', message: result.error.message })
      return
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    setStatus({ type: 'success', message: 'Password updated successfully.' })
  }

  const initials = formData.fullName.charAt(0).toUpperCase()

  return (
    <div className="flex h-screen bg-transparent text-white">
      <SharedSidebar />

      <main className="m-4 flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <section className="fiesta-panel h-fit rounded-[1.75rem] p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-28 w-28 rounded-full object-cover ring-1 ring-white/10" />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-3xl font-semibold text-white">
                      {initials}
                    </div>
                  )}

                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 rounded-full bg-slate-950 p-2 text-white shadow-lg"
                      title="Upload image"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-white">{formData.fullName}</h2>
                <p className="mt-1 text-sm text-slate-400">{formData.email}</p>
                {formData.title && <p className="mt-3 text-sm text-slate-300">{formData.title}</p>}
              </div>
            </section>

            <section className="min-w-0 space-y-6">

              <div className="fiesta-panel rounded-[1.75rem] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Personal information</h3>
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="fiesta-button-secondary rounded-2xl px-4 py-2 text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="fiesta-button-primary inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="fiesta-button-primary rounded-2xl px-4 py-2 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {[
                    ['fullName', 'Full name'],
                    ['email', 'Email'],
                    ['title', 'Professional title'],
                    ['phone', 'Phone number'],
                    ['country', 'Country'],
                    ['language', 'Language'],
                    ['address', 'Address']
                  ].map(([name, label]) => (
                    <label key={name} className={`${name === 'address' ? 'md:col-span-2' : ''} block`}>
                      <span className="mb-2 block text-sm font-medium text-slate-400">{label}</span>
                      <input
                        name={name}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleInputChange}
                        disabled={!isEditing || name === 'email'}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-70"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="fiesta-panel rounded-[1.75rem] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-cyan-300" />
                  <h3 className="text-xl font-semibold text-white">Security</h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-400">Current password</span>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-400">New password</span>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-400">Confirm password</span>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>
                </div>

                <button
                  onClick={handleUpdatePassword}
                  className="fiesta-button-secondary mt-6 rounded-2xl px-4 py-2 text-sm font-medium"
                >
                  Update password
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {status.type && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
          status.type === 'success'
            ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-100 backdrop-blur-xl'
            : 'border-rose-400/30 bg-rose-500/20 text-rose-100 backdrop-blur-xl'
        }`}>
          {status.type === 'success' ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <span className="font-medium">{status.message}</span>
        </div>
      )}
    </div>
  )
}
