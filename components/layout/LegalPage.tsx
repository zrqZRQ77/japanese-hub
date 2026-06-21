import Navbar from '@/components/layout/Navbar'
import SiteFooter from '@/components/layout/SiteFooter'

interface LegalSection {
  title: string
  body: string[]
}

interface Props {
  title: string
  description: string
  updatedAt: string
  sections: LegalSection[]
}

export default function LegalPage({ title, description, updatedAt, sections }: Props) {
  return (
    <>
      <Navbar />
      <main style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'var(--color-bg-subtle)',
        padding: '48px 0 56px',
      }}>
        <div className="container-page">
          <article style={{
            maxWidth: 880,
            margin: '0 auto',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: 'clamp(28px, 5vw, 48px)',
          }}>
            <div style={{
              color: 'var(--color-primary)',
              fontSize: '0.8rem',
              fontWeight: 900,
              marginBottom: 10,
            }}>
              資格合格ナビ
            </div>
            <h1 style={{
              margin: 0,
              color: 'var(--color-text)',
              fontSize: 'clamp(1.7rem, 4vw, 2.35rem)',
              lineHeight: 1.25,
              fontWeight: 900,
              letterSpacing: 0,
            }}>
              {title}
            </h1>
            <p style={{
              color: 'var(--color-text-secondary)',
              lineHeight: 1.8,
              marginTop: 14,
              marginBottom: 10,
            }}>
              {description}
            </p>
            <p style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: 30,
            }}>
              制定・更新日：{updatedAt}
            </p>

            <div style={{ display: 'grid', gap: 26 }}>
              {sections.map(section => (
                <section key={section.title}>
                  <h2 style={{
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    color: 'var(--color-text)',
                    marginBottom: 10,
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--color-border)',
                  }}>
                    {section.title}
                  </h2>
                  {section.body.map(paragraph => (
                    <p key={paragraph} style={{
                      color: 'var(--color-text)',
                      lineHeight: 1.9,
                      marginBottom: 10,
                    }}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
