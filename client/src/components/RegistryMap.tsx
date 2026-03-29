import { useEffect, useMemo, useRef } from 'react'
import { divIcon } from 'leaflet'
import {
  MapContainer,
  Marker,
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
  delayIndex: number
}

interface RegistryMapProps {
  clusters: CityCluster[]
  hoveredClusterId: string | null
  selectedClusterId: string | null
  selectedStoryId: string | null
  onEngage: () => void
  onHover: (clusterId: string | null) => void
  onResetWorld: () => void
  onSelect: (clusterId: string, storyId?: string | null) => void
  resetViewToken: number
  showAmbientStatus: boolean
}

function radiusForCluster(cluster: CityCluster) {
  const densityBoost = 10 + Math.min(cluster.stories.length, 4) * 2
  return densityBoost + (cluster.hasOpenConversation ? 1 : 0)
}

function buildCityHubIcon(cluster: CityCluster, isActive: boolean) {
  const size = radiusForCluster(cluster) * 2 + (isActive ? 18 : 12)

  return divIcon({
    className: 'map-div-icon map-div-icon--hub',
    html: `
      <span class="map-hub${cluster.hasOpenConversation ? ' is-open' : ''}${isActive ? ' is-active' : ''}">
        <span class="map-hub__halo"></span>
        <span class="map-hub__ring"></span>
        <span class="map-hub__core"></span>
      </span>
    `,
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size],
    tooltipAnchor: [0, -(size / 2)],
  })
}

function buildStoryPointIcon(point: StoryPoint, isActive: boolean) {
  const size = isActive ? 24 : point.openToChat ? 18 : 15

  return divIcon({
    className: 'map-div-icon map-div-icon--story',
    html: `
      <span class="map-story-point${point.openToChat ? ' is-open' : ' is-passive'}${isActive ? ' is-active' : ''} map-story-point--delay-${point.delayIndex}">
        <span class="map-story-point__halo"></span>
        <span class="map-story-point__dot"></span>
      </span>
    `,
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size],
    tooltipAnchor: [0, -(size / 2)],
  })
}

function FitToStories({
  activeClusterId,
  activeLat,
  activeLng,
  clusterBounds,
  resetViewToken,
}: {
  activeClusterId: string | null
  activeLat: number | null
  activeLng: number | null
  clusterBounds: [number, number][]
  resetViewToken: number
}) {
  const map = useMap()
  const hasFitInitialView = useRef(false)
  const lastResetToken = useRef(resetViewToken)

  useEffect(() => {
    if (hasFitInitialView.current || clusterBounds.length === 0) {
      return
    }

    map.fitBounds(clusterBounds, {
      animate: false,
      maxZoom: 2.4,
      padding: [88, 88],
    })
    hasFitInitialView.current = true
  }, [clusterBounds, map])

  useEffect(() => {
    if (!activeClusterId || activeLat === null || activeLng === null) {
      return
    }

    map.flyTo([activeLat, activeLng], Math.max(map.getZoom(), 5), {
      animate: true,
      duration: 0.75,
    })
  }, [activeClusterId, activeLat, activeLng, map])

  useEffect(() => {
    if (lastResetToken.current === resetViewToken) {
      return
    }

    lastResetToken.current = resetViewToken

    if (clusterBounds.length === 0) {
      return
    }

    map.fitBounds(clusterBounds, {
      animate: true,
      maxZoom: 2.4,
      padding: [88, 88],
    })
  }, [clusterBounds, map, resetViewToken])

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
  onResetWorld,
  onSelect,
  resetViewToken,
  showAmbientStatus,
}: RegistryMapProps) {
  const highlighted =
    clusters.find((cluster) => cluster.id === hoveredClusterId) ??
    clusters.find((cluster) => cluster.id === selectedClusterId) ??
    null

  const activeCluster = clusters.find((cluster) => cluster.id === selectedClusterId) ?? null

  const points = useMemo<StoryPoint[]>(
    () =>
      activeCluster?.stories.map((story, index) => ({
        id: story.id,
        clusterId: activeCluster.id,
        city: story.city,
        country: story.country,
        areaLabel: story.areaLabel,
        postalHint: story.postalHint,
        lat: story.lat,
        lng: story.lng,
        openToChat: story.openToChat,
        delayIndex: Math.min(index, 5),
      })) ?? [],
    [activeCluster],
  )

  const clusterBounds = useMemo(
    () => clusters.map((cluster) => [cluster.lat, cluster.lng] as [number, number]),
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

        <div className="map-chrome map-chrome--controls">
          <button className="map-control-button" onClick={onResetWorld} type="button">
            World
          </button>
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
          <MapEngagementSignals onEngage={onEngage} />
          <FitToStories
            activeClusterId={activeCluster?.id ?? null}
            activeLat={activeCluster?.lat ?? null}
            activeLng={activeCluster?.lng ?? null}
            clusterBounds={clusterBounds}
            resetViewToken={resetViewToken}
          />

          <Pane name="city-hubs" style={{ zIndex: 420 }}>
            {clusters.map((cluster, index) => {
              const isActive =
                cluster.id === selectedClusterId || cluster.id === hoveredClusterId
              const showLabel = isActive || (!selectedClusterId && !hoveredClusterId && index < 5)

              return (
                <Marker
                  eventHandlers={{
                    click: () => {
                      onEngage()
                      onSelect(cluster.id, cluster.stories[0]?.id ?? null)
                    },
                    mouseout: () => onHover(null),
                    mouseover: () => onHover(cluster.id),
                  }}
                  icon={buildCityHubIcon(cluster, isActive)}
                  key={cluster.id}
                  pane="city-hubs"
                  position={[cluster.lat, cluster.lng]}
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
                </Marker>
              )
            })}
          </Pane>

          {activeCluster ? (
            <Pane name="story-points" style={{ zIndex: 430 }}>
              {points.map((point) => {
                const isActive = point.id === selectedStoryId

                return (
                  <Marker
                    eventHandlers={{
                      click: () => {
                        onEngage()
                        onSelect(point.clusterId, point.id)
                      },
                      mouseout: () => onHover(null),
                      mouseover: () => onHover(point.clusterId),
                    }}
                    icon={buildStoryPointIcon(point, isActive)}
                    key={point.id}
                    pane="story-points"
                    position={[point.lat, point.lng]}
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
                  </Marker>
                )
              })}
            </Pane>
          ) : null}
        </MapContainer>
      </div>
    </div>
  )
}
