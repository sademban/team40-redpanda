import { useNavigate } from 'react-router-dom'
import SafePrompt from '../components/SafePrompt'
import { crisisResources } from '../data/crisisResources'
import { uiStrings } from '../data/content'

/**
 * CrisisPage
 * Displays immediate crisis resources and support options for users in distress.
 * This page is accessible from the SafePrompt component and provides direct links to help.
 */
export default function CrisisPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="content">
        {/* Logo */}
        <p className="wordmark fade-in" style={{ fontStyle: 'italic', color: 'var(--accent)', fontSize: '2rem', fontWeight: '600' }}>Echo</p>

        {/* Crisis alert banner */}
        <SafePrompt />

        {/* Main headline */}
        <h2 className="display fade-in fade-in--d1" style={{ marginTop: '48px', marginBottom: '24px' }}>
          You're not <span className="display--italic">alone.</span>
        </h2>

        {/* Supportive subheadline */}
        <p className="text-muted fade-in fade-in--d2" style={{ marginBottom: '32px' }}>
          There are people trained to help, right now.
        </p>

        {/* Crisis resources list */}
        {crisisResources.map((resource, idx) => (
          <div key={idx} className="card fade-in" style={{ animationDelay: `${200 + idx * 100}ms` }}>
            {/* Resource name */}
            <h3 style={{ marginBottom: '8px' }}>{resource.name}</h3>

            {/* Resource description */}
            <p className="text-muted" style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
              {resource.description}
            </p>

            {/* Call-to-action button */}
            <button className="btn btn--primary" style={{ width: '100%' }}>
              {resource.action}
            </button>
          </div>
        ))}

        {/* Return to home button */}
        <button
          className="btn btn--ghost fade-in fade-in--d3"
          onClick={() => navigate('/')}
          style={{ width: '100%', marginTop: '24px' }}
        >
          Go back
        </button>

        {/* Safety affirmation footer */}
        <p className="text-muted fade-in fade-in--d3" style={{ marginTop: '48px', textAlign: 'center', fontSize: '0.8rem' }}>
          {uiStrings.safetyMatters}
        </p>
      </div>
    </div>
  )
}
