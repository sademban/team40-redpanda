interface SkeletonProps {
  width?: string
  height?: string
  radius?: string
  className?: string
}

export function Skeleton({ width = '100%', height = '0.85rem', radius = '8px', className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton${className ? ` ${className}` : ''}`}
      style={{ width, height, borderRadius: radius }}
    />
  )
}

interface SkeletonBlockProps {
  lines?: number
  className?: string
}

export function SkeletonLines({ lines = 3, className }: SkeletonBlockProps) {
  return (
    <div className={`skeleton-lines${className ? ` ${className}` : ''}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="0.85rem"
          width={`${85 - index * 12}%`}
        />
      ))}
    </div>
  )
}
