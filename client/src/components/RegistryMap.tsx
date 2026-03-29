import { useEffect, useMemo } from 'react'
import {
  CircleMarker,
  MapContainer,
  Pane,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import type { CityCluster } from '../types/story'

interface StoryPoint {
  id: string
  clusterId: string
  city: string
  country: string
  areaLabel: string
  postalHint: string
  lat: number
  lng: number
  openToChat: boolean
}

interface RegistryMapProps {
  clusters: CityCluster[]
  hoveredClusterId: string | null
  selectedClusterId: string | null
  selectedStoryId: string | null
  onHover: (clusterId: string | null) => void
  onSelect: (clusterId: string, storyId?: string | null) => void
}

function radiusForCluster(count: number) {
  return 10 + Math.min(count, 4) * 2
}

function FitToStories({
  activeClusterId,
  activeLat,
  activeLng,
  clusterBounds,
  clusterKey,
}: {
  activeClusterId: string | null
  activeLat: number | null
  activeLng: number | null
  clusterBounds: [number, number][]
  clusterKey: string
}) {
  const map = useMap()

  useEffect(() => {
    if (activeClusterId && activeLat !== null && activeLng !== null) {
      map.flyTo([activeLat, activeLng], Math.max(map.getZoom(), 5), {
        animate: true,
        duration: 0.75,
      })
      return
    }

    if (clusterBounds.length === 0) {
      return
    }

    map.fitBounds(clusterBounds, {
      animate: false,
      maxZoom: 2.4,
      padding: [88, 88],
    })
  }, [activeClusterId, activeLat, activeLng, clusterBounds, clusterKey, map])

  return null
}

export function RegistryMap({
  clusters,
  hoveredClusterId,
  selectedClusterId,
  selectedStoryId,
  onHover,
  onSelect,
}: RegistryMapProps) {
  const highlighted =
    clusters.find((cluster) => cluster.id === hoveredClusterId) ??
    clusters.find((cluster) => cluster.id === selectedClusterId) ??
    null

  const points = useMemo<StoryPoint[]>(
    () =>
      clusters.flatMap((cluster) =>
        cluster.stories.map((story) => ({
          id: story.id,
          clusterId: cluster.id,
          city: story.city,
          country: story.country,
          areaLabel: story.areaLabel,
          postalHint: story.postalHint,
          lat: story.lat,
          lng: story.lng,
          openToChat: story.openToChat,
        })),
      ),
    [clusters],
  )

  const activeCluster = clusters.find((cluster) => cluster.id === selectedClusterId) ?? null
  const clusterBounds = useMemo(
    () => clusters.map((cluster) => [cluster.lat, cluster.lng] as [number, number]),
    [clusters],
  )
  const clusterKey = useMemo(
    () => clusters.map((cluster) => cluster.id).join('|'),
    [clusters],
  )

  return (
    <div className="map-shell">
      <div className="map-frame">
        <div className="map-chrome map-chrome--status">
          <p className="map-chrome__eyebrow">
            {highlighted ? `${highlighted.city}, ${highlighted.country}` : 'Stories across distance'}
          </p>
          <p className="map-chrome__title">
            {highlighted
              ? 'Open the little points to see each local story.'
              : 'Drag the map. Tap a city. Then open the smaller points.'}
          </p>
        </div>

        <MapContainer
          attributionControl
          className="world-map world-map--leaflet"
          center={[20, 8]}
          maxZoom={8}
          minZoom={2}
          scrollWheelZoom
          zoom={2}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          <FitToStories
            activeClusterId={activeCluster?.id ?? null}
            activeLat={activeCluster?.lat ?? null}
            activeLng={activeCluster?.lng ?? null}
            clusterBounds={clusterBounds}
            clusterKey={clusterKey}
          />

          <Pane name="story-points" style={{ zIndex: 430 }}>
            {points.map((point) => {
              const isActive = point.id === selectedStoryId
              const isClusterActive = point.clusterId === selectedClusterId

              return (
                <CircleMarker
                  center={[point.lat, point.lng]}
                  eventHandlers={{
                    click: () => onSelect(point.clusterId, point.id),
                    mouseout: () => onHover(null),
                    mouseover: () => onHover(point.clusterId),
                  }}
                  key={point.id}
                  pane="story-points"
                  pathOptions={{
                    color: isActive ? '#ffffff' : '#f06ea8',
                    fillColor: isActive ? '#ea4c93' : '#ffffff',
                    fillOpacity: isClusterActive || isActive ? 0.98 : 0.84,
                    opacity: point.openToChat ? 1 : 0.75,
                    weight: point.openToChat ? 2.4 : 1.6,
                  }}
                  radius={isActive ? 8 : isClusterActive ? 6 : 5}
                >
                  {isActive ? (
                    <Tooltip
                      className="leaflet-tooltip--story"
                      direction="top"
                      offset={[0, -8]}
                      opacity={1}
                      permanent
                    >
                      <div className="story-tooltip">
                        <strong>{point.areaLabel}</strong>
                        <span>{point.postalHint}</span>
                      </div>
                    </Tooltip>
                  ) : null}
                </CircleMarker>
              )
            })}
          </Pane>

          <Pane name="city-hubs" style={{ zIndex: 420 }}>
            {clusters.map((cluster, index) => {
              const isActive =
                cluster.id === selectedClusterId || cluster.id === hoveredClusterId
              const showLabel = isActive || (!highlighted && index < 5)

              return (
                <CircleMarker
                  center={[cluster.lat, cluster.lng]}
                  eventHandlers={{
                    click: () => onSelect(cluster.id, cluster.stories[0]?.id ?? null),
                    mouseout: () => onHover(null),
                    mouseover: () => onHover(cluster.id),
                  }}
                  key={cluster.id}
                  pane="city-hubs"
                  pathOptions={{
                    color: isActive ? '#ea4c93' : 'rgba(240, 110, 168, 0.88)',
                    fillColor: isActive
                      ? 'rgba(240, 110, 168, 0.26)'
                      : 'rgba(240, 110, 168, 0.12)',
                    fillOpacity: 0.95,
                    opacity: 1,
                    weight: isActive ? 3 : 2,
                  }}
                  radius={radiusForCluster(cluster.stories.length)}
                >
                  {showLabel ? (
                    <Tooltip
                      className="leaflet-tooltip--city"
                      direction="top"
                      offset={[0, -12]}
                      opacity={1}
                      permanent
                    >
                      <div className="city-tooltip">{cluster.city}</div>
                    </Tooltip>
                  ) : null}
                </CircleMarker>
              )
            })}
          </Pane>
        </MapContainer>
      </div>
    </div>
  )
}
