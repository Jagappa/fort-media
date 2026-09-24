import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { publicAPI, mediaUrl } from '../../api';
import { useLang } from '../../context/LanguageContext';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: .6, delay, ease: [.16, 1, .3, 1] }}>{children}</motion.div>;
};

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const [service, setService] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [brand, setBrand] = useState<any>({});

  useEffect(() => {
    if (slug) publicAPI.getService(slug).then(r => { setService(r.data.service); setVideos(r.data.videos || []); }).catch(() => {});
    publicAPI.getBrand().then(r => setBrand(r.data)).catch(() => {});
    window.scrollTo(0, 0);
  }, [slug]);

  const logoUrl = brand.logo ? mediaUrl(brand.logo) : '/fort-media-logo.png';
  if (!service) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-display)', fontSize: 24 }}>LOADING...</div>;

  // Check if this is Website Development (shows projects instead of videos)
  const isWebDev = service.slug === 'website-development';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 'var(--nav-h-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--side-pad)', background: 'rgba(10,10,10,.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <Link to="/"><img src={logoUrl} alt="Fort Media" style={{ height: 42 }} /></Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link to="/" className="nav-link">HOME</Link>
          <a href="/#portfolio" className="nav-link">OUR WORK</a>
          <a href="/#contact" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '10px 24px', background: 'var(--red)', color: '#fff' }}>CONTACT US</a>
        </div>
      </nav>

      {/* Cover Hero */}
      <section className="grid-bg" style={{
        paddingTop: 'calc(var(--nav-h-sm) + 60px)', paddingBottom: 60, paddingLeft: 'var(--side-pad)', paddingRight: 'var(--side-pad)',
        textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {service.mainImage && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${mediaUrl(service.mainImage)})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: .15 }} />
        )}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <FadeIn><div className="section-label" style={{ justifyContent: 'center' }}>SERVICE</div></FadeIn>
          <FadeIn delay={.1}><h1 className="smoke-title in-view" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 8vw, 90px)', lineHeight: 1, marginBottom: 20 }}>{t(service.name)}</h1></FadeIn>
          {/* Image-only services carry no copy — skip the block entirely
              rather than leaving a gap under the heading. */}
          {(t(service.description) || t(service.shortDescription)) && (
            <FadeIn delay={.2}><p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'var(--gray)', lineHeight: 1.8, maxWidth: 650, margin: '0 auto' }}>{t(service.description) || t(service.shortDescription)}</p></FadeIn>
          )}
        </div>
      </section>

      {/* Videos Section */}
      <section style={{ padding: 'var(--section-pad) var(--side-pad)' }}>
        {isWebDev ? (
          <>
            <FadeIn><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '.04em', marginBottom: 40 }}>OUR PROJECTS</h2></FadeIn>
            {videos.length === 0 ? (
              <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 60 }}>No projects added yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
                {videos.map((v: any, i: number) => (
                  <FadeIn key={v._id} delay={i * .08}>
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      {v.videoFile && <div style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}>
                        <video src={mediaUrl(v.videoFile)} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>}
                      <div style={{ padding: 20 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>{typeof v.title === 'object' ? v.title.en : v.title}</h3>
                        {v.description && <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6 }}>{typeof v.description === 'object' ? v.description.en : v.description}</p>}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <FadeIn><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '.04em', marginBottom: 40 }}>
              {lang === 'kn' ? 'ವೀಡಿಯೊಗಳು' : 'OUR VIDEOS'}
            </h2></FadeIn>
            {videos.length === 0 ? (
              <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 60 }}>No videos available for this service.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {videos.map((v: any, i: number) => (
                  <FadeIn key={v._id} delay={i * .08}>
                    <motion.div whileHover={{ y: -4 }} style={{ background: 'var(--card)', border: '1px solid var(--border)', overflow: 'hidden', transition: 'border-color .3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
                      <div style={{ width: '100%', aspectRatio: '9/16', background: '#000', maxHeight: 500 }}>
                        <video src={mediaUrl(v.videoFile)} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '16px 18px' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '.02em' }}>{typeof v.title === 'object' ? (v.title.en || 'Video') : (v.title || 'Video')}</div>
                        {v.description && <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 6, lineHeight: 1.6 }}>{typeof v.description === 'object' ? v.description.en : v.description}</p>}
                      </div>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section className="grid-bg" style={{ padding: '80px var(--side-pad)', background: 'var(--surface)', textAlign: 'center' }}>
        <FadeIn><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: 32 }}>INTERESTED IN {t(service.name).toUpperCase()}?</h2></FadeIn>
        <FadeIn delay={.1}><a href="/#contact" className="btn-primary"><span>CONTACT FORT MEDIA</span></a></FadeIn>
      </section>

      <footer style={{ padding: '32px var(--side-pad)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logoUrl} alt="Fort Media" style={{ height: 36 }} />
        <span style={{ fontSize: 12, color: 'var(--gray-dark)' }}>© FORT MEDIA</span>
      </footer>
    </div>
  );
}
