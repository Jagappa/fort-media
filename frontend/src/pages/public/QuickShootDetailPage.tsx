import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { publicAPI } from '../../api';
import { useLang } from '../../context/LanguageContext';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: .6, delay, ease: [.16, 1, .3, 1] }}>{children}</motion.div>;
};

export default function QuickShootDetailPage() {
  const { id } = useParams();
  const { t } = useLang();
  const [qs, setQs] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [brand, setBrand] = useState<any>({});
  const [allQS, setAllQS] = useState<any[]>([]);

  useEffect(() => {
    publicAPI.getBrand().then(r => setBrand(r.data)).catch(() => {});
    publicAPI.getQuickShoots().then(r => {
      setAllQS(r.data);
      const found = r.data.find((q: any) => q._id === id);
      if (found) setQs(found);
    }).catch(() => {});
    if (id) publicAPI.getQuickShootVideos(id).then(r => setVideos(r.data)).catch(() => {});
    window.scrollTo(0, 0);
  }, [id]);

  const logoUrl = brand.logo || '/fort-media-logo.png';

  if (!qs) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-display)', fontSize: 24 }}>LOADING...</div>;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 'var(--nav-h-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--side-pad)', background: 'rgba(10,10,10,.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <Link to="/"><img src={logoUrl} alt="Fort Media" style={{ height: 42 }} /></Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link to="/" className="nav-link">HOME</Link>
          <a href="/#quick-shoots" className="nav-link">QUICK SHOOTS</a>
          <a href="/#contact" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '10px 24px', background: 'var(--red)', color: '#fff' }}>CONTACT US</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid-bg" style={{ paddingTop: 'calc(var(--nav-h-sm) + 80px)', paddingBottom: 60, paddingLeft: 'var(--side-pad)', paddingRight: 'var(--side-pad)', textAlign: 'center' }}>
        <FadeIn><div className="section-label" style={{ justifyContent: 'center' }}>QUICK SHOOTS</div></FadeIn>
        <FadeIn delay={.1}><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 7vw, 80px)', lineHeight: 1, marginBottom: 16 }}>{t(qs.name)}</h1></FadeIn>
        <FadeIn delay={.2}><p style={{ fontSize: 16, color: 'var(--gray)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }}>{t(qs.description)}</p></FadeIn>
      </section>

      {/* Videos */}
      <section style={{ padding: '0 var(--side-pad) 100px' }}>
        {videos.length === 0 ? (
          <FadeIn><p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: 16, padding: 80 }}>No videos available yet.</p></FadeIn>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {videos.map((v: any, i: number) => (
              <FadeIn key={v._id} delay={i * .08}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ width: '100%', aspectRatio: '9/16', background: '#000' }}>
                    <video src={v.videoFile} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v.title || 'Video'}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{ padding: '80px var(--side-pad)', background: 'var(--surface)', textAlign: 'center' }}>
        <FadeIn><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: 32 }}>WANT A {t(qs.name).toUpperCase()}?</h2></FadeIn>
        <FadeIn delay={.1}><a href="/#contact" className="btn-primary"><span>BOOK NOW</span></a></FadeIn>
      </section>

      <footer style={{ padding: '32px var(--side-pad)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logoUrl} alt="Fort Media" style={{ height: 36 }} />
        <span style={{ fontSize: 12, color: 'var(--gray-dark)' }}>© FORT MEDIA</span>
      </footer>
    </div>
  );
}
