'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Issue, IssueCategory, User, UserRole } from '../../../generated/prisma'

// Dynamic import of map to avoid SSR issues
const MapComponent = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
})

interface IssueWithRelations extends Issue {
  category: IssueCategory
  reportedBy: User
  assignedTo?: User | null
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const [issues, setIssues] = useState<IssueWithRelations[]>([])
  const [categories, setCategories] = useState<IssueCategory[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null)

  useEffect(() => {
    // Check for demo user from URL params
    const demoEmail = searchParams.get('demo')
    if (demoEmail) {
      fetchDemoUser(demoEmail)
    }
    
    fetchIssues()
    fetchCategories()
    fetchUsers()
  }, [searchParams])

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

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues')
      const data = await response.json()
      setIssues(data)
    } catch (error) {
      console.error('Error fetching issues:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const assignIssue = async (issueId: string, assignedToId: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId })
      })
      
      if (response.ok) {
        fetchIssues() // Refresh issues
        setShowAssignModal(null)
      }
    } catch (error) {
      console.error('Error assigning issue:', error)
    }
  }

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        fetchIssues() // Refresh issues
      }
    } catch (error) {
      console.error('Error updating issue status:', error)
    }
  }

  const filteredIssues = issues.filter(issue => {
    const categoryMatch = selectedCategory === 'all' || issue.categoryId === selectedCategory
    const statusMatch = selectedStatus === 'all' || issue.status === selectedStatus
    const assigneeMatch = selectedAssignee === 'all' || 
                         (selectedAssignee === 'unassigned' && !issue.assignedToId) ||
                         (selectedAssignee === 'me' && currentUser && issue.assignedToId === currentUser.id) ||
                         issue.assignedToId === selectedAssignee
    
    return categoryMatch && statusMatch && assigneeMatch
  })

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

  const canAssignIssues = currentUser?.role === 'MUNICIPAL_MANAGER' || currentUser?.role === 'ADMIN'
  const canManageUsers = currentUser?.role === 'ADMIN'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the municipal dashboard.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              {/* Logo/Icon */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-400/20">
                  <span className="text-white text-xl font-bold">🏛️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Municipal Dashboard
                  </h1>
                  <p className="text-sm text-slate-300 mt-0.5 font-medium">Issue Management System</p>
                </div>
              </div>
              
              {/* Quick Stats - Enhanced */}
              <div className="hidden lg:flex items-center space-x-6 ml-8 pl-8 border-l border-slate-600/50">
                <div className="text-center group">
                  <div className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-200">
                    {filteredIssues.length}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Issues</div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl font-bold text-red-400 group-hover:text-red-300 transition-colors duration-200">
                    {issues.filter(issue => issue.priority === 'URGENT').length}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Urgent</div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors duration-200">
                    {issues.filter(issue => issue.status === 'IN_PROGRESS').length}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">In Progress</div>
                </div>
              </div>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-4">
              {/* Add Issue Button */}
              <a 
                href={`/dashboard/add-issue?demo=${encodeURIComponent(currentUser.email)}`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <svg width="18" height="18" className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Issue
              </a>

              {/* User Profile */}
              <div className="flex items-center space-x-3 px-5 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-200">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/10 ${
                  currentUser.role === 'MUNICIPAL_MANAGER' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  currentUser.role === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                  'bg-gradient-to-br from-emerald-500 to-emerald-600'
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                
                {/* User Info */}
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{currentUser.name}</div>
                  <div className="text-xs text-slate-300 font-medium">{currentUser.department}</div>
                </div>

                {/* Role Badge */}
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                  currentUser.role === 'MUNICIPAL_MANAGER' ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-400/30' :
                  currentUser.role === 'ADMIN' ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/30' :
                  'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30'
                }`}>
                  {currentUser.role === 'MUNICIPAL_MANAGER' ? 'Manager' :
                   currentUser.role === 'ADMIN' ? 'Admin' : 'Worker'}
                </span>

                {/* Dropdown Arrow */}
                <div className="relative">
                  <button className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-600/50 transition-all duration-200">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Hidden dropdown for now - can implement later */}
                  <div className="hidden absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700/50 z-50 backdrop-blur-sm">
                    <div className="py-2">
                      <a href="/auth/signin" className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors duration-150 first:rounded-t-xl">
                        Switch User
                      </a>
                      <a href="/settings" className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors duration-150">
                        Settings
                      </a>
                      <a href="/help" className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors duration-150 last:rounded-b-xl">
                        Help
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col space-y-4">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <p className="text-sm text-gray-500 mt-1">Narrow down issues by category, status, and assignment</p>
              </div>
              
              {/* Clear Filters */}
              {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedAssignee !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedStatus('all')
                    setSelectedAssignee('all')
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
                >
                  <option value="all">All Statuses</option>
                  <option value="REPORTED">Reported</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              {/* Assignment Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Assignment</label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
                >
                  <option value="all">All Issues</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="me">My Issues</option>
                  {users.filter(user => user.role === 'DEPARTMENT_WORKER').map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.department})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Status: {selectedStatus.replace('_', ' ')}
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedAssignee !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {selectedAssignee === 'unassigned' ? 'Unassigned' :
                   selectedAssignee === 'me' ? 'My Issues' :
                   users.find(u => u.id === selectedAssignee)?.name}
                  <button
                    onClick={() => setSelectedAssignee('all')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Map and Issues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Map Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Issue Locations</h2>
                    <p className="text-sm text-gray-500 mt-1">{filteredIssues.length} issues visible on map</p>
                  </div>
                  
                  {/* Map Controls */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Map Container */}
              <div className="h-96">
                <MapComponent issues={filteredIssues} />
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* List Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedAssignee === 'me' ? 'My Issues' : 'Recent Issues'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'} found
                    </p>
                  </div>
                  
                  {/* Sort Dropdown */}
                  <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Latest</option>
                    <option>Priority</option>
                    <option>Status</option>
                  </select>
                </div>
              </div>

              {/* Issues List */}
              <div className="max-h-96 overflow-y-auto">
                <div className="divide-y divide-gray-100">
                  {filteredIssues.slice(0, 10).map(issue => (
                    <div key={issue.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <a 
                          href={`/dashboard/issue/${issue.id}?demo=${encodeURIComponent(currentUser.email)}`}
                          className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {issue.title}
                        </a>
                        <span className={`ml-2 flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>
                      
                      {/* Status and Category */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500" style={{ color: issue.category.color }}>
                          {issue.category.name}
                        </span>
                      </div>

                      {/* Assignment Info */}
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        {issue.assignedTo ? (
                          <span className="flex items-center">
                            <svg width="12" height="12" className="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {issue.assignedTo.name}
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600">
                            <svg width="12" height="12" className="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Unassigned
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {canAssignIssues && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setShowAssignModal(issue.id)
                            }}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors font-medium"
                          >
                            {issue.assignedTo ? 'Reassign' : 'Assign'}
                          </button>
                        )}
                        
                        {(currentUser.id === issue.assignedToId || canAssignIssues) && issue.status !== 'RESOLVED' && (
                          <select
                            value={issue.status}
                            onChange={(e) => {
                              e.preventDefault()
                              updateIssueStatus(issue.id, e.target.value)
                            }}
                            className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="REPORTED">Reported</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                          </select>
                        )}
                      </div>

                      {issue.address && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <svg width="12" height="12" className="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {issue.address}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {filteredIssues.length === 0 && (
                    <div className="p-8 text-center">
                      <svg width="32" height="32" className="mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No issues found</p>
                      <p className="text-gray-400 text-xs mt-1">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Assign Issue</h3>
                  <button
                    onClick={() => setShowAssignModal(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Select a worker to assign this issue to</p>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="space-y-3">
                  {/* Unassign Option */}
                  <button
                    onClick={() => assignIssue(showAssignModal, '')}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <svg width="20" height="20" className="text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Unassign</div>
                        <div className="text-sm text-gray-500">Remove current assignment</div>
                      </div>
                    </div>
                  </button>

                  {/* Worker Options */}
                  {users.filter(user => user.role === 'DEPARTMENT_WORKER').map(user => (
                    <button
                      key={user.id}
                      onClick={() => assignIssue(showAssignModal, user.id)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm group-hover:bg-green-600 transition-colors">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.department}</div>
                        </div>
                        <div className="ml-auto">
                          <svg width="20" height="20" className="text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setShowAssignModal(null)}
                  className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-red-50">
                  <svg width="20" height="20" className="text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent Issues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {issues.filter(issue => issue.priority === 'URGENT').length}
                  </p>
                  <p className="text-xs text-red-600 font-medium">Needs immediate attention</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-yellow-50">
                  <svg width="20" height="20" className="text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {issues.filter(issue => issue.status === 'IN_PROGRESS').length}
                  </p>
                  <p className="text-xs text-yellow-600 font-medium">Currently being worked on</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-orange-50">
                  <svg width="20" height="20" className="text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unassigned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {issues.filter(issue => !issue.assignedToId).length}
                  </p>
                  <p className="text-xs text-orange-600 font-medium">Awaiting assignment</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-50">
                  <svg width="20" height="20" className="text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Issues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentUser ? issues.filter(issue => issue.assignedToId === currentUser.id).length : 0}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">Assigned to you</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-50">
                  <svg width="20" height="20" className="text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {issues.filter(issue => issue.status === 'RESOLVED').length}
                  </p>
                  <p className="text-xs text-green-600 font-medium">Successfully completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}