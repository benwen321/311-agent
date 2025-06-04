'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Issue, IssueCategory, User, IssueUpdate, IssuePhoto } from '../../../../../generated/prisma'

interface IssueWithDetails extends Issue {
  category: IssueCategory
  reportedBy: User
  assignedTo?: User | null
  photos: IssuePhoto[]
  updates: (IssueUpdate & { updatedBy: User })[]
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
  department: string
}

export default function IssueDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [issue, setIssue] = useState<IssueWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check for demo user from URL params
    const demoEmail = searchParams.get('demo')
    if (demoEmail) {
      fetchDemoUser(demoEmail)
    }
    fetchIssue()
  }, [params.id, searchParams])

  const fetchDemoUser = async (email: string) => {
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
      const userData = await response.json()
      if (userData) {
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Error fetching demo user:', error)
    }
  }

  const fetchIssue = async () => {
    try {
      const response = await fetch(`/api/issues/${params.id}`)
      const data = await response.json()
      setIssue(data)
    } catch (error) {
      console.error('Error fetching issue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/issues/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newComment,
          updatedById: currentUser.id 
        })
      })

      if (response.ok) {
        setNewComment('')
        fetchIssue() // Refresh issue data
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REPORTED': return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-white'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading issue details...</div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h2>
          <p className="text-gray-600 mb-4">The requested issue could not be found.</p>
          <button
            onClick={() => router.push(currentUser ? `/dashboard?demo=${encodeURIComponent(currentUser.email)}` : '/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view issue details.</p>
          <a 
            href="/auth/signin" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(`/dashboard?demo=${encodeURIComponent(currentUser.email)}`)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Issue Details</h1>
                  <p className="text-gray-600">{issue.title}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                {issue.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                {issue.priority}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Issue Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="mt-1 text-gray-900" style={{ color: issue.category.color }}>
                    {issue.category.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <p className="mt-1 text-gray-900">{issue.priority}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reported By</label>
                  <p className="mt-1 text-gray-900">{issue.reportedBy.name}</p>
                  <p className="text-sm text-gray-500">{issue.reportedBy.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Assigned To</label>
                  <p className="mt-1 text-gray-900">
                    {issue.assignedTo ? issue.assignedTo.name : 'Unassigned'}
                  </p>
                  {issue.assignedTo && (
                    <p className="text-sm text-gray-500">{issue.assignedTo.department}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reported Date</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(issue.reportedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(issue.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {issue.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="mt-1 text-gray-900">📍 {issue.address}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="mt-1 text-gray-900">{issue.description || 'No description provided'}</p>
                </div>
              </div>
            </div>

            {/* Photos */}
            {issue.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issue.photos.map((photo, index) => (
                    <div key={photo.id} className="relative">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                        onClick={() => window.open(photo.url, '_blank')}
                      />
                      {photo.caption && (
                        <p className="text-xs text-gray-500 mt-1">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Comment */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Update</h2>
              <form onSubmit={addComment} className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a comment or status update..."
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Update'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {/* Initial Report */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Issue Reported</p>
                    <p className="text-sm text-gray-500">
                      by {issue.reportedBy.name} • {new Date(issue.reportedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Assignment */}
                {issue.assignedTo && issue.assignedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Assigned</p>
                      <p className="text-sm text-gray-500">
                        to {issue.assignedTo.name} • {new Date(issue.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Updates */}
                {issue.updates.map((update) => (
                  <div key={update.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{update.message}</p>
                      <p className="text-sm text-gray-500">
                        by {update.updatedBy.name} • {new Date(update.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Resolution */}
                {issue.status === 'RESOLVED' && issue.resolvedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Issue Resolved</p>
                      <p className="text-sm text-gray-500">
                        {new Date(issue.resolvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Coordinates:</strong> {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                </p>
                {issue.address && (
                  <p className="text-sm text-gray-600">
                    <strong>Address:</strong> {issue.address}
                  </p>
                )}
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${issue.latitude},${issue.longitude}`, '_blank')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  📍 View on Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 