import { useEffect, useMemo } from 'react'
import {
  CircleMarker,
  MapContainer,
  Pane,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
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
  onEngage: () => void
  onHover: (clusterId: string | null) => void
  onSelect: (clusterId: string, storyId?: string | null) => void
  showAmbientStatus: boolean
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

function MapEngagementSignals({ onEngage }: { onEngage: () => void }) {
  useMapEvents({
    click: onEngage,
    dragstart: onEngage,
    movestart: onEngage,
    zoomstart: onEngage,
  })

  return null
}

export function RegistryMap({
  clusters,
  hoveredClusterId,
  selectedClusterId,
  selectedStoryId,
  onEngage,
  onHover,
  onSelect,
  showAmbientStatus,
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
        {showAmbientStatus && highlighted ? (
          <div className="map-chrome map-chrome--status">
            <p className="map-chrome__eyebrow">{highlighted.city}, {highlighted.country}</p>
            <p className="map-chrome__title">Tap the ring to open what was left here.</p>
          </div>
        ) : null}

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
          <MapEngagementSignals onEngage={onEngage} />
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
                    click: () => {
                      onEngage()
                      onSelect(point.clusterId, point.id)
                    },
                    mouseout: () => onHover(null),
                    mouseover: () => {
                      onEngage()
                      onHover(point.clusterId)
                    },
                  }}
                  key={point.id}
                  pane="story-points"
                  pathOptions={{
                    className: `map-marker map-marker--story${isClusterActive ? ' is-cluster-active' : ''}${isActive ? ' is-active' : ''}`,
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
                    click: () => {
                      onEngage()
                      onSelect(cluster.id, cluster.stories[0]?.id ?? null)
                    },
                    mouseout: () => onHover(null),
                    mouseover: () => {
                      onEngage()
                      onHover(cluster.id)
                    },
                  }}
                  key={cluster.id}
                  pane="city-hubs"
                  pathOptions={{
                    className: `map-marker map-marker--city${isActive ? ' is-active' : ''}`,
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
