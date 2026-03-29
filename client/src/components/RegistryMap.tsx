import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'
import type { CityCluster } from '../types/story'

const geographyUrl = '/data/world-110m.json'

interface GeographyItem {
  rsmKey: string
}

interface RegistryMapProps {
  clusters: CityCluster[]
  hoveredClusterId: string | null
  selectedClusterId: string | null
  onHover: (clusterId: string | null) => void
  onSelect: (clusterId: string) => void
}

function radiusForCluster(count: number) {
  return 7 + Math.min(count, 4) * 1.8
}

function labelWidth(label: string) {
  return Math.max(88, Math.round(label.length * 7.5))
}

export function RegistryMap({
  clusters,
  hoveredClusterId,
  selectedClusterId,
  onHover,
  onSelect,
}: RegistryMapProps) {
  const highlighted =
    clusters.find((cluster) => cluster.id === hoveredClusterId) ??
    clusters.find((cluster) => cluster.id === selectedClusterId) ??
    null

  return (
    <div className="map-shell">
      <div className="map-frame">
        <ComposableMap
          className="world-map"
          projection="geoEqualEarth"
          projectionConfig={{ scale: 175, center: [6, 10] }}
        >
          <Geographies geography={geographyUrl}>
            {({ geographies }: { geographies: GeographyItem[] }) =>
              geographies.map((geography) => (
                <Geography
                  className="map-land"
                  geography={geography}
                  key={geography.rsmKey}
                />
              ))
            }
          </Geographies>

          {clusters.map((cluster, index) => {
            const isActive =
              cluster.id === selectedClusterId || cluster.id === hoveredClusterId
            const showLabel = isActive || (!highlighted && index < 4)
            const width = labelWidth(cluster.city)

            return (
              <Marker key={cluster.id} coordinates={[cluster.lng, cluster.lat]}>
                <g
                  aria-label={`${cluster.city}, ${cluster.country}`}
                  className={`cluster-marker ${isActive ? 'is-active' : ''}`}
                  onBlur={() => onHover(null)}
                  onClick={() => onSelect(cluster.id)}
                  onFocus={() => onHover(cluster.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(cluster.id)
                    }
                  }}
                  onMouseEnter={() => onHover(cluster.id)}
                  onMouseLeave={() => onHover(null)}
                  role="button"
                  tabIndex={0}
                >
                  {showLabel ? (
                    <g className="cluster-marker__label" transform={`translate(${-width / 2}, -54)`}>
                      <rect height="30" rx="15" width={width} x="0" y="0" />
                      <text textAnchor="middle" x={width / 2} y="19">
                        {cluster.city}
                      </text>
                    </g>
                  ) : null}
                  <circle className="cluster-marker__shadow" r={radiusForCluster(cluster.stories.length) + 9} />
                  <circle className="cluster-marker__halo" r={radiusForCluster(cluster.stories.length) + 2} />
                  <circle className="cluster-marker__core" r={radiusForCluster(cluster.stories.length)} />
                </g>
              </Marker>
            )
          })}
        </ComposableMap>
      </div>
    </div>
  )
}
