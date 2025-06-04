'use client'

import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Issue, IssueCategory, User } from '../../generated/prisma'

interface IssueWithRelations extends Issue {
  category: IssueCategory
  reportedBy: User
  assignedTo?: User | null
}

interface MapComponentProps {
  issues: IssueWithRelations[]
}

// For demo purposes - you'll need to get a real Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.demo'

export default function MapComponent({ issues }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lng] = useState(-73.9851) // NYC longitude for demo
  const [lat] = useState(40.7589)  // NYC latitude for demo
  const [zoom] = useState(13)

  useEffect(() => {
    if (map.current) return // Initialize map only once

    if (!mapContainer.current) return

    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'pk.demo') {
      // Show fallback message when no token is available
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div class="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-8">
            <div class="text-4xl mb-4">🗺️</div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Map View</h3>
            <p class="text-sm text-gray-600 mb-4">To enable the interactive map, please add your Mapbox access token to the environment variables.</p>
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
              <p class="font-medium text-yellow-800">Quick Setup:</p>
              <ol class="mt-2 text-yellow-700 text-left">
                <li>1. Get a free token at <a href="https://mapbox.com" target="_blank" class="underline">mapbox.com</a></li>
                <li>2. Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local</li>
                <li>3. Restart the development server</li>
              </ol>
            </div>
            <div class="mt-4 text-xs text-gray-500">
              Issues loaded: ${issues.length} • Demo coordinates: NYC area
            </div>
          </div>
        `
      }
      return
    }

    mapboxgl.accessToken = MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    })

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Wait for map to load before adding markers
    map.current.on('load', () => {
      if (!map.current) return

      // Convert issues to GeoJSON format
      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: issues.map(issue => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [issue.longitude, issue.latitude]
          },
          properties: {
            id: issue.id,
            title: issue.title,
            description: issue.description || '',
            priority: issue.priority,
            status: issue.status,
            categoryName: issue.category.name,
            categoryColor: issue.category.color,
            reportedBy: issue.reportedBy.name || 'Unknown',
            assignedTo: issue.assignedTo?.name || null,
            address: issue.address || '',
            reportedAt: issue.reportedAt
          }
        }))
      }

      // Add source for issue markers
      map.current!.addSource('issues', {
        type: 'geojson',
        data: geojsonData
      })

      // Add circle layer for regular markers
      map.current!.addLayer({
        id: 'issue-markers',
        type: 'circle',
        source: 'issues',
        filter: ['!=', ['get', 'priority'], 'URGENT'],
        paint: {
          'circle-radius': 8,
          'circle-color': ['get', 'categoryColor'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      })

      // Add pulsing layer for urgent issues
      map.current!.addLayer({
        id: 'urgent-markers',
        type: 'circle',
        source: 'issues',
        filter: ['==', ['get', 'priority'], 'URGENT'],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 6,
            16, 12
          ],
          'circle-color': ['get', 'categoryColor'],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      })

      // Add pulsing animation layer for urgent issues
      map.current!.addLayer({
        id: 'urgent-pulse',
        type: 'circle',
        source: 'issues',
        filter: ['==', ['get', 'priority'], 'URGENT'],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 12,
            16, 24
          ],
          'circle-color': ['get', 'categoryColor'],
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.1,
            16, 0.3
          ]
        }
      })

      // Add click handler for markers
      map.current!.on('click', 'issue-markers', (e) => {
        if (!e.features || e.features.length === 0) return
        
        const feature = e.features[0]
        const properties = feature.properties!
        
        showPopup(e.lngLat, properties)
      })

      map.current!.on('click', 'urgent-markers', (e) => {
        if (!e.features || e.features.length === 0) return
        
        const feature = e.features[0]
        const properties = feature.properties!
        
        showPopup(e.lngLat, properties)
      })

      // Change cursor on hover
      map.current!.on('mouseenter', 'issue-markers', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })

      map.current!.on('mouseleave', 'issue-markers', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })

      map.current!.on('mouseenter', 'urgent-markers', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })

      map.current!.on('mouseleave', 'urgent-markers', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })

      // Fit map to show all markers if there are issues
      if (issues.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        issues.forEach(issue => {
          bounds.extend([issue.longitude, issue.latitude])
        })
        map.current!.fitBounds(bounds, { padding: 50 })
      }
    })

    // Function to show popup
    const showPopup = (lngLat: mapboxgl.LngLat, properties: any) => {
      if (!map.current) return

      const popupContent = `
        <div class="p-3 min-w-64">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-gray-900">${properties.title}</h3>
            <span class="px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(properties.priority)}">
              ${properties.priority}
            </span>
          </div>
          <p class="text-gray-600 text-sm mb-2">${properties.description || 'No description provided'}</p>
          <div class="space-y-1 text-xs text-gray-500">
            <div class="flex justify-between">
              <span>Category:</span>
              <span class="font-medium" style="color: ${properties.categoryColor}">${properties.categoryName}</span>
            </div>
            <div class="flex justify-between">
              <span>Status:</span>
              <span class="font-medium ${getStatusTextClass(properties.status)}">${properties.status.replace('_', ' ')}</span>
            </div>
            <div class="flex justify-between">
              <span>Reported by:</span>
              <span class="font-medium">${properties.reportedBy}</span>
            </div>
            ${properties.assignedTo ? `
              <div class="flex justify-between">
                <span>Assigned to:</span>
                <span class="font-medium">${properties.assignedTo}</span>
              </div>
            ` : ''}
            ${properties.address ? `
              <div class="flex justify-between">
                <span>Address:</span>
                <span class="font-medium">${properties.address}</span>
              </div>
            ` : ''}
            <div class="flex justify-between">
              <span>Reported:</span>
              <span class="font-medium">${new Date(properties.reportedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `

      new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true
      })
        .setLngLat(lngLat)
        .setHTML(popupContent)
        .addTo(map.current!)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [issues, lng, lat, zoom])

  // Update markers when issues change
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return

    const source = map.current.getSource('issues') as mapboxgl.GeoJSONSource
    if (!source) return

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: issues.map(issue => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [issue.longitude, issue.latitude]
        },
        properties: {
          id: issue.id,
          title: issue.title,
          description: issue.description || '',
          priority: issue.priority,
          status: issue.status,
          categoryName: issue.category.name,
          categoryColor: issue.category.color,
          reportedBy: issue.reportedBy.name || 'Unknown',
          assignedTo: issue.assignedTo?.name || null,
          address: issue.address || '',
          reportedAt: issue.reportedAt
        }
      }))
    }

    source.setData(geojsonData)
  }, [issues])

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  )
}

// Helper functions for styling
function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'URGENT': return 'bg-red-500 text-white'
    case 'HIGH': return 'bg-orange-500 text-white'
    case 'MEDIUM': return 'bg-yellow-500 text-white'
    case 'LOW': return 'bg-green-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

function getStatusTextClass(status: string): string {
  switch (status) {
    case 'REPORTED': return 'text-red-600'
    case 'IN_PROGRESS': return 'text-yellow-600'
    case 'RESOLVED': return 'text-green-600'
    default: return 'text-gray-600'
  }
} 