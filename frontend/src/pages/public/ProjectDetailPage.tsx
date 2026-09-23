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

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const [project, setProject] = useState<any>(null);
  const [brand, setBrand] = useState<any>({});

  useEffect(() => {
    if (slug) publicAPI.getProject(slug).then(r => setProject(r.data)).catch(() => {});
    publicAPI.getBrand().then(r => setBrand(r.data)).catch(() => {});
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '.1em' }}>LOADING...</div>;

  const logoUrl = brand.logo || '/fort-media-logo.png';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 'var(--nav-h-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--side-pad)', background: 'rgba(10,10,10,.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <Link to="/"><img src={logoUrl} alt="Fort Media" style={{ height: 36 }} /></Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gray)' }}>HOME</Link>
          <a href="/#contact" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '10px 24px', background: 'var(--red)', color: 'var(--white)' }}>CONTACT US</a>
        </div>
      </nav>

      <section style={{ paddingTop: 'calc(var(--nav-h-sm) + 80px)', paddingBottom: 80, paddingLeft: 'var(--side-pad)', paddingRight: 'var(--side-pad)' }}>
        <FadeIn><Link to="/" style={{ fontSize: 12, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: 32, display: 'inline-block' }}>← Back to Home</Link></FadeIn>
        <FadeIn delay={.1}><div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>{project.category}</div></FadeIn>
        <FadeIn delay={.15}><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 7vw, 80px)', lineHeight: 1, letterSpacing: '.02em', marginBottom: 20 }}>{t(project.title)}</h1></FadeIn>
        {project.client && <FadeIn delay={.18}><div style={{ fontSize: 14, color: 'var(--gray)', marginBottom: 32 }}>Client: <span style={{ color: 'var(--white)' }}>{project.client}</span></div></FadeIn>}
        <FadeIn delay={.2}><p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--gray)', lineHeight: 1.8, maxWidth: 700, marginBottom: 60 }}>{t(project.description)}</p></FadeIn>

        {project.coverImage && (
          <FadeIn delay={.25}><div style={{ width: '100%', aspectRatio: '21/9', overflow: 'hidden', marginBottom: 48 }}>
            <img src={project.coverImage} alt={t(project.title)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div></FadeIn>
        )}

        {project.images?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 60 }}>
            {project.images.map((img: string, i: number) => (
              <FadeIn key={i} delay={i * .05}><div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                <img src={img} alt={`${t(project.title)} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div></FadeIn>
            ))}
          </div>
        )}
      </section>

      <section style={{ padding: '80px var(--side-pad)', background: 'var(--surface)', textAlign: 'center' }}>
        <FadeIn><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: 32 }}>WANT SOMETHING LIKE THIS?</h2></FadeIn>
        <FadeIn delay={.1}><a href="/#contact" className="btn-primary"><span>CONTACT FORT MEDIA</span></a></FadeIn>
      </section>

      <footer style={{ padding: '32px var(--side-pad)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logoUrl} alt="Fort Media" style={{ height: 32 }} />
        <span style={{ fontSize: 12, color: 'var(--gray-dark)' }}>© FORT MEDIA</span>
      </footer>
    </div>
  );
}
