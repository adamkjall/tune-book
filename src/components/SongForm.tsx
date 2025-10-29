import { useState, type FormEvent, type ChangeEvent, type MouseEvent } from 'react'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { GUITAR_TUNINGS } from '@/utils/tunings'
import { CATEGORIES, getDefaultCategory } from '@/utils/categories'
import type { Song } from '@/types'

interface SongFormProps {
  song: Song | null;
  onSubmit: (song: Song) => void;
  onCancel: () => void;
}

function SongForm({ song, onSubmit, onCancel }: SongFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<Song>(song || {
    id: Date.now(),
    title: '',
    artist: '',
    lessonLink: '',
    lessonLinks: [],
    songLinkYoutube: '',
    songLinkSpotify: '',
    tabsLink: '',
    tabsLinks: [],
    notes: '',
    progress: 0,
    category: getDefaultCategory().id,
    tuning: 'Standard (E A D G B E)'
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Upload PDF if selected
    if (pdfFile && user) {
      setUploading(true)
      try {
        const fileName = `${user.uid}/${Date.now()}_${pdfFile.name}`
        const storageRef = ref(storage, `tabs/${fileName}`)
        await uploadBytes(storageRef, pdfFile)
        const downloadUrl = await getDownloadURL(storageRef)
        
        // Add PDF URL to form data
        onSubmit({ ...formData, tabsPdfUrl: downloadUrl })
      } catch (error) {
        console.error('Error uploading PDF:', error)
        alert('Failed to upload PDF. Please try again.')
      } finally {
        setUploading(false)
      }
    } else {
      onSubmit(formData)
    }
  }

  const handlePdfDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0] && files[0].type === 'application/pdf') {
      setPdfFile(files[0])
    } else {
      alert('Please drop a PDF file')
    }
  }

  const handlePdfSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0] && files[0].type === 'application/pdf') {
      setPdfFile(files[0])
    } else {
      alert('Please select a PDF file')
    }
  }

  const removePdf = async () => {
    if (formData.tabsPdfUrl && user) {
      try {
        // Delete from Firebase Storage
        const storageRef = ref(storage, formData.tabsPdfUrl)
        await deleteObject(storageRef)
      } catch (error) {
        console.error('Error deleting PDF:', error)
      }
    }
    setPdfFile(null)
    setFormData(prev => ({ ...prev, tabsPdfUrl: undefined }))
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addLessonLink = () => {
    setFormData(prev => ({
      ...prev,
      lessonLinks: [...(prev.lessonLinks || []), { url: '', label: '' }]
    }))
  }

  const updateLessonLink = (index: number, field: 'url' | 'label', value: string) => {
    setFormData(prev => ({
      ...prev,
      lessonLinks: prev.lessonLinks?.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  const removeLessonLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lessonLinks: prev.lessonLinks?.filter((_, i) => i !== index)
    }))
  }

  const addTabsLink = () => {
    setFormData(prev => ({
      ...prev,
      tabsLinks: [...(prev.tabsLinks || []), { url: '', label: '' }]
    }))
  }

  const updateTabsLink = (index: number, field: 'url' | 'label', value: string) => {
    setFormData(prev => ({
      ...prev,
      tabsLinks: prev.tabsLinks?.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  const removeTabsLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tabsLinks: prev.tabsLinks?.filter((_, i) => i !== index)
    }))
  }

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-800 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-lg shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold">{song ? 'Edit Song' : 'Add New Song'}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <form id="song-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Song Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Artist *</label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Main Lesson Link (YouTube)</label>
              <input
                type="url"
                name="lessonLink"
                value={formData.lessonLink}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Additional Lesson Links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Additional Lesson Links</label>
                <button
                  type="button"
                  onClick={addLessonLink}
                  className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded transition"
                >
                  + Add Link
                </button>
              </div>
              {formData.lessonLinks && formData.lessonLinks.length > 0 && (
                <div className="space-y-2">
                  {formData.lessonLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLessonLink(index, 'label', e.target.value)}
                        placeholder="Label (e.g., Solo, Part 2)"
                        className="w-1/3 px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLessonLink(index, 'url', e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeLessonLink(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Song Link (YouTube)</label>
                <input
                  type="url"
                  name="songLinkYoutube"
                  value={formData.songLinkYoutube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Song Link (Spotify)</label>
                <input
                  type="url"
                  name="songLinkSpotify"
                  value={formData.songLinkSpotify}
                  onChange={handleChange}
                  placeholder="https://open.spotify.com/..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Main Tabs/Chords Link</label>
              <input
                type="url"
                name="tabsLink"
                value={formData.tabsLink}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Additional Tabs Links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Additional Tabs/Chords Links</label>
                <button
                  type="button"
                  onClick={addTabsLink}
                  className="text-xs px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded transition"
                >
                  + Add Link
                </button>
              </div>
              {formData.tabsLinks && formData.tabsLinks.length > 0 && (
                <div className="space-y-2">
                  {formData.tabsLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateTabsLink(index, 'label', e.target.value)}
                        placeholder="Label (e.g., Solo, Simplified)"
                        className="w-1/3 px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateTabsLink(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeTabsLink(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload Tabs PDF</label>
              <div
                onDrop={handlePdfDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                  dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600'
                }`}
              >
                {!pdfFile && !formData.tabsPdfUrl && (
                  <>
                    <p className="text-slate-400 mb-2">Drag & drop a PDF file here or</p>
                    <label className="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded cursor-pointer transition">
                      Browse Files
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfSelect}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
                {(pdfFile || formData.tabsPdfUrl) && (
                  <div className="flex items-center justify-between bg-slate-700 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📄</span>
                      <span className="text-sm">{pdfFile?.name || 'Uploaded PDF'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removePdf}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Guitar Tuning</label>
              <select
                name="tuning"
                value={formData.tuning}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GUITAR_TUNINGS.map((tuning) => (
                  <option key={tuning.value} value={tuning.value}>
                    {tuning.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Additional tips, capo position, etc..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </form>
        
        <div className="p-4 md:p-6 border-t border-slate-700 bg-slate-800">
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="song-form"
              disabled={uploading}
              className={`px-6 py-2 rounded-lg transition ${
                uploading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Uploading...' : (song ? 'Update' : 'Add') + ' Song'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SongForm
