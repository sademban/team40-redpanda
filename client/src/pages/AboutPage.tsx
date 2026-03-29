import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'

export function AboutPage() {
  return (
    <PageShell note="The explanation lives here, not on the first screen." variant="about">
      <section className="about-hero">
        <p className="eyebrow">Why Echo exists</p>
        <h1 className="display">
          For the quiet weight people carry in bidesh.
        </h1>
        <p className="lead about-lead">
          Echo is for the people who look steady on the outside and still feel
          like they are disappearing somewhere behind the performance.
        </p>
      </section>

      <section className="about-layout">
        <GlassPanel className="about-panel" flat>
          <p>
            Students, immigrants, and young professionals often learn how to
            sound okay before they actually are. They call home sounding steady.
            They go to class. They go to work. They keep moving.
          </p>
          <p>
            Echo exists for the moment after that performance. The moment when
            someone needs one true thing back from the world: proof that another
            person has felt this too.
          </p>
        </GlassPanel>

        <GlassPanel className="about-panel" flat>
          <p>
            The map is there so private feeling does not stay invisible. A light
            in London, Doha, Toronto, Sydney, or New York should feel less like
            data and more like a quiet hand raised across distance.
          </p>
          <p>
            The match is not a recommendation. It is an opening. Sometimes it is
            a person you may want to reach. Sometimes it is a person already
            reaching toward you. The point is not optimization. The point is
            recognition.
          </p>
        </GlassPanel>

        <GlassPanel className="about-panel about-panel--quote">
          <p className="about-quote">
            "You are not weak for feeling this. You are not ungrateful for
            struggling. You are not the only one."
          </p>
        </GlassPanel>
      </section>
    </PageShell>
  )
}
