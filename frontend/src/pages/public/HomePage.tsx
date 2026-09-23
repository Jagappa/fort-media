import { useEffect, useState, useRef, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { publicAPI } from '../../api';
import LayerPanel, { useLayerScrollEnabled } from '../../components/LayerScroll';
import {
  usePremiumEnabled, SmoothScroll, CustomCursor, ScrollProgress,
  SplitText, Reveal, Magnetic, Tilt, CountUp,
} from '../../components/Premium';
import HeroCanvas from '../../components/HeroCanvas';
import { useLang } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

/* ── Helpers ── */
const Section = ({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section ref={ref} id={id || undefined} className={`section ${className}`}
      initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: .7, ease: [.16, 1, .3, 1] }}>{children}</motion.section>
  );
};
const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: .6, delay, ease: [.16, 1, .3, 1] }}>{children}</motion.div>;
};
/* Keeps the red smoke bloom, and now rises word-by-word when the title is
   plain text. Non-string children (mixed markup) render exactly as before. */
const SmokeTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <span ref={ref} className={`smoke-title ${inView ? 'in-view' : ''} ${className}`}>
      {typeof children === 'string' ? <SplitText>{children}</SplitText> : children}
    </span>
  );
};
// Staggered pair reveal
const PairReveal = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const pairDelay = Math.floor(index / 2) * .15;
  return <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: .6, delay: pairDelay, ease: [.16, 1, .3, 1] }}>{children}</motion.div>;
};

/* OUR WORK is never animated — as the base of the stack it simply holds still so
   ABOUT FORT MEDIA can rise over it, exactly as specified. Set to false to have
   OUR WORK scroll away normally and start the stack at ABOUT FORT MEDIA. */
const OUR_WORK_IS_BASE_LAYER = true;

/* Inertial wheel scrolling. This is the single biggest contributor to the
   cinematic feel — and the most personal. Flip to false to go back to the
   browser's native scroll without touching anything else. */
const SMOOTH_SCROLL = true;

export default function HomePage() {
  const { lang, setLang, t } = useLang();
  const layerScroll = useLayerScrollEnabled();
  // Desktop + fine pointer + motion allowed. Gates every pointer-driven effect.
  const premium = usePremiumEnabled();
  const [services, setServices] = useState<any[]>([]);
  const [quickShoots, setQuickShoots] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [content, setContent] = useState<any>({});
  const [brand, setBrand] = useState<any>({});
  const [homeVideo, setHomeVideo] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', businessName: '', service: '', shootType: '', budget: '', message: '' });

  useEffect(() => {
    publicAPI.getServices().then(r => setServices(r.data)).catch(() => {});
    publicAPI.getQuickShoots().then(r => setQuickShoots(r.data)).catch(() => {});
    publicAPI.getClients().then(r => setClients(r.data)).catch(() => {});
    publicAPI.getTestimonials().then(r => setTestimonials(r.data)).catch(() => {});
    publicAPI.getContent().then(r => setContent(r.data)).catch(() => {});
    publicAPI.getBrand().then(r => setBrand(r.data)).catch(() => {});
    publicAPI.getHomeVideo().then(r => setHomeVideo(r.data)).catch(() => {});
    publicAPI.getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroContent = content.hero?.[lang] || content.hero?.en || {};
  const aboutContent = content.about?.[lang] || content.about?.en || {};
  const contactContent = content.contact?.[lang] || content.contact?.en || {};
  const whatWeDoContent = content.whatwedo?.[lang] || content.whatwedo?.en || {};
  const qsContent = content.quickshoots?.[lang] || content.quickshoots?.en || {};
  const logoUrl = brand.logo || '/fort-media-logo.png';
  const showHeroText = heroContent.showHeroText !== 'false' && heroContent.showHeroText !== false;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await publicAPI.submitEnquiry(form);
      toast.success(lang === 'kn' ? 'ವಿಚಾರಣೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!' : 'Enquiry submitted successfully!');
      setForm({ fullName: '', phone: '', email: '', businessName: '', service: '', shootType: '', budget: '', message: '' });
    } catch { toast.error('Failed to submit.'); }
  };

  const marqueeItems = ['DIGITAL MARKETING', 'SOCIAL MEDIA MANAGEMENT', 'CONTENT PRODUCTION', 'AD SHOOTS', 'PERFORMANCE MARKETING', 'PERSONAL BRANDING', 'WEBSITE DEVELOPMENT', 'QUICK SHOOTS'];
  const whyItems = [
    { num: '01', title: 'CREATIVE THINKING', desc: 'We turn ideas into content people remember.' },
    { num: '02', title: 'FAST EXECUTION', desc: 'We move quickly without compromising quality.' },
    { num: '03', title: 'PROFESSIONAL PRODUCTION', desc: 'Every shoot is planned to create strong visual impact.' },
    { num: '04', title: 'RESULT-FOCUSED MARKETING', desc: 'Creative work should create business results.' },
    { num: '05', title: 'BRAND-FOCUSED STRATEGY', desc: 'Everything we do builds toward a stronger brand.' },
    { num: '06', title: 'ONE CREATIVE PARTNER', desc: 'Marketing, social media, production, branding, and websites under one roof.' },
  ];
  const processSteps = [
    { num: '01', title: 'DISCOVER', desc: 'Understand the business, brand, audience, and goals.' },
    { num: '02', title: 'STRATEGIZE', desc: 'Build the creative and marketing direction.' },
    { num: '03', title: 'CREATE', desc: 'Produce the content, campaigns, websites, and brand assets.' },
    { num: '04', title: 'GROW', desc: 'Launch, analyze, optimize, and improve.' },
  ];

  const inputStyle = { width: '100%', padding: '13px 14px', background: 'var(--card)', border: '1px solid var(--border)', fontSize: 14, color: '#fff' };
  const labelStyle = { display: 'block' as const, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'var(--gray)', marginBottom: 6 };

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* ═══ PREMIUM LAYER — global scroll / pointer behaviour ═══ */}
      <a href="#portfolio" className="pm-skip-link">Skip to content</a>
      <SmoothScroll enabled={premium && SMOOTH_SCROLL} />
      <CustomCursor enabled={premium} />
      <ScrollProgress />

      {/* ═══ NAV (Issue 15: bigger logo, Issue 16: red hover) ═══ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: navScrolled ? 'var(--nav-h-sm)' : 'var(--nav-h)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--side-pad)', background: navScrolled ? 'rgba(10,10,10,.94)' : 'transparent', backdropFilter: navScrolled ? 'blur(20px)' : 'none', borderBottom: navScrolled ? '1px solid var(--border)' : '1px solid transparent', transition: 'all .4s cubic-bezier(.16,1,.3,1)' }}>
        <a href="#hero"><img src={logoUrl} alt="Fort Media" style={{ height: navScrolled ? 44 : 56, transition: 'height .4s' }} /></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-desktop">
          {['Home', 'Portfolio', 'Services', 'About', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">{item}</a>
          ))}
          <div style={{ display: 'flex', gap: 4, border: '1px solid var(--border)', padding: '6px 4px' }}>
            <button onClick={() => setLang('en')} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: lang === 'en' ? 'var(--red)' : 'transparent', color: lang === 'en' ? '#fff' : 'var(--gray)' }}>EN</button>
            <button onClick={() => setLang('kn')} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: lang === 'kn' ? 'var(--red)' : 'transparent', color: lang === 'kn' ? '#fff' : 'var(--gray)', fontFamily: 'var(--font-kannada)' }}>ಕನ್ನಡ</button>
          </div>
          <a href="#contact" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '12px 28px', background: 'var(--red)', color: '#fff' }}>Let's Talk</a>
        </div>
        <button onClick={() => setMobileMenu(!mobileMenu)} style={{ display: 'none', flexDirection: 'column', gap: 6, cursor: 'pointer', padding: 4, zIndex: 1001 }} className="nav-mobile-toggle">
          <span style={{ width: 24, height: 2, background: '#fff', transition: 'all .3s', transform: mobileMenu ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <span style={{ width: 24, height: 2, background: '#fff', transition: 'all .3s', opacity: mobileMenu ? 0 : 1 }} />
          <span style={{ width: 24, height: 2, background: '#fff', transition: 'all .3s', transform: mobileMenu ? 'rotate(-45deg) translate(6px,-6px)' : 'none' }} />
        </button>
      </nav>

      {mobileMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          {['Home', 'Portfolio', 'Services', 'About', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenu(false)} style={{ fontFamily: 'var(--font-display)', fontSize: 36 }}>{item}</a>
          ))}
        </div>
      )}

      {/* ═══ HERO (Issue 9: hide text option, cleaner video, Issue 8: video bg) ═══ */}
      <section id="hero" className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '100px var(--side-pad) 60px', textAlign: 'center', overflow: 'hidden' }}>
        {homeVideo && homeVideo.videoFile && (
          <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: showHeroText ? .3 : .7 }}>
            <source src={homeVideo.videoFile} />
          </video>
        )}
        {/* Ambient WebGL haze behind the content. Renders nothing on touch,
            reduced motion, or where WebGL is unavailable. */}
        <HeroCanvas enabled={premium} />
        {showHeroText && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to top, var(--bg), transparent)', zIndex: 1 }} />}

        {showHeroText && (
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
            <motion.img src={logoUrl} alt="Fort Media" style={{ width: 120, margin: '0 auto 40px' }} initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .2 }} />
            <div style={{ overflow: 'hidden' }}>
              <motion.h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 9vw, 110px)', lineHeight: .95 }} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: .8, ease: [.16, 1, .3, 1] }}>
                {heroContent.heading || "WE DON'T FOLLOW TRENDS."}
              </motion.h1>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <motion.h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 9vw, 110px)', lineHeight: .95 }} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: .8, delay: .12, ease: [.16, 1, .3, 1] }}>
                <span style={{ color: 'var(--red)' }}>{heroContent.headingAccent || 'WE BUILD THEM.'}</span>
              </motion.h1>
            </div>
            <motion.p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: 'var(--gray)', lineHeight: 1.7, maxWidth: 560, margin: '28px auto 44px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .5 }}>
              {heroContent.subtext || 'Fort Media helps businesses build attention and create content that demands to be seen.'}
            </motion.p>
            <motion.div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .7 }}>
              <Magnetic enabled={premium}>
                <a href="#contact" className="btn-primary"><span>{heroContent.ctaPrimary || "LET'S BUILD YOUR BRAND"}</span></a>
              </Magnetic>
              <Magnetic enabled={premium}>
                <a href="#portfolio" className="btn-secondary"><span>{heroContent.ctaSecondary || 'VIEW OUR WORK'}</span></a>
              </Magnetic>
            </motion.div>
          </div>
        )}

        <motion.div className="pm-scroll-cue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8, delay: 1.2 }} aria-hidden>
          <span>Scroll</span>
          <span className="pm-scroll-cue-rail" />
        </motion.div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div className="marquee-section"><div className="marquee-track">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (<span key={i}><span className="marquee-item">{item}</span><span className="marquee-dot">•</span></span>))}
      </div></div>

      {/* ════════════════════════════════════════════════════════════
          LAYER SCROLL STACK
          OUR WORK → ABOUT FORT MEDIA → WHAT WE DO → QUICK SHOOTS
          Each panel pins at the top of the viewport while the next one rises from
          the bottom on raw scroll and covers it. Normal scrolling resumes after
          QUICK SHOOTS. Nothing inside the panels is redesigned.
         ════════════════════════════════════════════════════════════ */}
      <div className="layer-stack">

      {/* ═══ OUR WORK — inert base layer (Issue 10: links to dedicated pages, Issue 11: cover images, Issue 19: staggered pairs) ═══ */}
      <LayerPanel id="portfolio" zIndex={10} background="var(--bg)" enabled={layerScroll && OUR_WORK_IS_BASE_LAYER}>
      <Section className="grid-bg">
        <FadeIn><div className="section-label">FORT MEDIA</div></FadeIn>
        <FadeIn delay={.1}><h2 className="section-title"><SmokeTitle>{lang === 'kn' ? 'ನಮ್ಮ ಕೆಲಸ' : 'OUR WORK'}</SmokeTitle></h2></FadeIn>
        <FadeIn delay={.2}><p className="section-subtitle">Click on a service to explore our work.</p></FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginTop: 60 }}>
          {services.map((svc: any, i: number) => (
            <PairReveal key={svc._id || i} index={i}>
              <Tilt enabled={premium} max={5}>
                {/* The uploaded image IS the card. No title, no description, no
                    overlay — everything the visitor reads is part of the artwork.
                    The name survives only as alt text, so screen readers and
                    search engines still know what the card is. */}
                <Link to={`/services/${svc.slug}`}>
                  <div className="pm-card pm-work-card">
                    {svc.mainImage
                      ? <img className="pm-work-img" src={svc.mainImage} alt={t(svc.name)} loading="lazy" />
                      : <span className="pm-work-empty">▶ EXPLORE</span>}
                  </div>
                </Link>
              </Tilt>
            </PairReveal>
          ))}
        </div>
      </Section>
      </LayerPanel>

      {/* ═══ ABOUT FORT MEDIA — layer 1 (Issue 19: static — no scroll animation) ═══ */}
      <LayerPanel id="about" zIndex={20} background="var(--surface)" enabled={layerScroll} raised recede>
      <section style={{ padding: 'var(--section-pad) var(--side-pad)', background: 'var(--surface)' }}>
        <div className="section-label">ABOUT FORT MEDIA</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 60px)', lineHeight: 1.05, marginBottom: 32, maxWidth: 800 }}>
          <SmokeTitle>{aboutContent.heading || "WE DON'T JUST CREATE CONTENT."}</SmokeTitle><br />
          <span style={{ color: 'var(--red)' }}>{aboutContent.headingAccent || 'WE CREATE ATTENTION.'}</span>
        </h2>
        <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--gray)', lineHeight: 1.8, maxWidth: 650, marginBottom: 60 }}>
          {aboutContent.text || 'Fort Media is a creative powerhouse that combines marketing, storytelling, production, social media, advertising, branding, and technology into one studio.'}
        </p>
        <div className="about-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, paddingTop: 48, borderTop: '1px solid var(--border)' }}>
          {[{ key: 'projects', label: 'Projects' }, { key: 'brands', label: 'Brands' }, { key: 'campaigns', label: 'Campaigns' }, { key: 'contentPieces', label: 'Content Pieces' }].map(s => (
            <div key={s.key}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1, marginBottom: 4 }}>
                <span style={{ color: 'var(--red)' }}><CountUp value={stats[s.key] || '0'} /></span>+
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray)', letterSpacing: '.05em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      </LayerPanel>

      {/* ═══ WHAT WE DO — layer 2 (Issue 13: editable, Issue 19: staggered pair cards) ═══ */}
      <LayerPanel id="services" zIndex={30} background="var(--bg)" enabled={layerScroll} raised recede>
      <Section className="grid-bg">
        <FadeIn><div className="section-label">{whatWeDoContent.label || 'OUR EXPERTISE'}</div></FadeIn>
        <FadeIn delay={.1}><h2 className="section-title"><SmokeTitle>{whatWeDoContent.heading || (lang === 'kn' ? 'ನಾವು ಏನು ಮಾಡುತ್ತೇವೆ' : 'WHAT WE DO')}</SmokeTitle></h2></FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2, marginTop: 60 }}>
          {services.map((svc: any, i: number) => (
            <PairReveal key={svc._id || i} index={i}>
              <div className="pm-expertise" style={{ padding: '38px 30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="pm-expertise-num" style={{ fontFamily: 'var(--font-display)', fontSize: 46, lineHeight: 1, marginBottom: 14 }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '.06em', marginBottom: 10 }}>{t(svc.name)}</h3>
                {/* Services added through the new image-only form carry no copy,
                    so render nothing rather than an empty paragraph. */}
                {t(svc.shortDescription || svc.description)
                  ? <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, flex: 1 }}>{t(svc.shortDescription || svc.description)}</p>
                  : <div style={{ flex: 1 }} />}
              </div>
            </PairReveal>
          ))}
        </div>
      </Section>
      </LayerPanel>

      {/* ═══ QUICK SHOOTS — final layer (Issue 4: clickable → dedicated page, Issue 14: editable) ═══ */}
      <LayerPanel id="quick-shoots" zIndex={40} background="var(--surface)" enabled={layerScroll} raised>
      <Section>
        <div style={{ background: 'var(--surface)', margin: 'calc(-1 * var(--section-pad)) calc(-1 * var(--side-pad))', padding: 'var(--section-pad) var(--side-pad)' }}>
          <FadeIn><div className="section-label">{qsContent.label || 'QUICK SHOOTS'}</div></FadeIn>
          <FadeIn delay={.1}><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1, marginBottom: 16 }}>
            <SmokeTitle>{qsContent.heading || (lang === 'kn' ? 'ವಿಷಯ ಬೇಕೇ?' : 'NEED CONTENT?')}</SmokeTitle><br />
            <span style={{ color: 'var(--red)' }}>{qsContent.headingAccent || (lang === 'kn' ? 'ನಾವು ಶೂಟ್ ಮಾಡುತ್ತೇವೆ.' : "WE'LL SHOOT IT.")}</span>
          </h2></FadeIn>
          <FadeIn delay={.2}><p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--gray)', lineHeight: 1.7, maxWidth: 550, marginBottom: 48 }}>
            {qsContent.subtext || 'Click a shoot type to watch our work.'}
          </p></FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 48 }}>
            {quickShoots.map((qs: any, i: number) => (
              <FadeIn key={qs._id || i} delay={i * .06}>
                <Link to={`/quick-shoots/${qs._id}`} aria-label={`${t(qs.name)} — watch our work`}>
                  <div className="pm-card pm-shoot" style={{ padding: 30, cursor: 'pointer', height: '100%' }}>
                    <div className="pm-shoot-icon" style={{ width: 38, height: 38, border: '1px solid var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: 'var(--red)', fontFamily: 'var(--font-display)', fontSize: 16 }}>▶</div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '.06em', marginBottom: 8 }}>{t(qs.name)}</h4>
                    <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.7, marginBottom: 14 }}>{t(qs.description)}</p>
                    <span className="pm-arrow"><span>Watch</span><span>→</span></span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
          <FadeIn><a href="#contact" className="btn-primary"><span>{qsContent.cta || (lang === 'kn' ? 'ಕ್ವಿಕ್ ಶೂಟ್ ಬುಕ್ ಮಾಡಿ' : 'BOOK A QUICK SHOOT')}</span></a></FadeIn>
        </div>
      </Section>
      </LayerPanel>

      </div>
      {/* ═════════ LAYER SCROLL STACK ENDS — normal document scrolling from here ═════════ */}

      {/* ═══ WHY FORT MEDIA ═══ */}
      <Section id="why" className="grid-bg">
        <FadeIn><div className="section-label">THE DIFFERENCE</div></FadeIn>
        <FadeIn delay={.1}><h2 className="section-title"><SmokeTitle>{lang === 'kn' ? 'ಫೋರ್ಟ್ ಮೀಡಿಯಾ ಏಕೆ?' : 'WHY FORT MEDIA?'}</SmokeTitle></h2></FadeIn>
        <div style={{ marginTop: 60, maxWidth: 800 }}>
          {whyItems.map((item, i) => (
            <FadeIn key={i} delay={i * .08}><div style={{ padding: '36px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 28 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, color: 'var(--red)', lineHeight: 1, minWidth: 70 }}>{item.num}</div>
              <div><h4 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '.06em', marginBottom: 8 }}>{item.title}</h4>
              <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7 }}>{item.desc}</p></div>
            </div></FadeIn>
          ))}
        </div>
      </Section>

      {/* ═══ PROCESS ═══ */}
      <Section id="process"><div style={{ background: 'var(--surface)', margin: 'calc(-1 * var(--section-pad)) calc(-1 * var(--side-pad))', padding: 'var(--section-pad) var(--side-pad)' }}>
        <FadeIn><div className="section-label">HOW WE WORK</div></FadeIn>
        <FadeIn delay={.1}><h2 className="section-title"><SmokeTitle>OUR PROCESS</SmokeTitle></h2></FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 0, marginTop: 60 }}>
          {processSteps.map((step, i) => (<FadeIn key={i} delay={i * .1}><div style={{ padding: '36px 28px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: 'var(--border)', lineHeight: 1, marginBottom: 18 }}>{step.num}</div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '.06em', marginBottom: 10 }}>{step.title}</h4>
            <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7 }}>{step.desc}</p>
          </div></FadeIn>))}
        </div>
      </div></Section>

      {/* ═══ CLIENTS ═══ */}
      <Section id="clients" className="grid-bg"><div style={{ textAlign: 'center' }}>
        <FadeIn><div className="section-label" style={{ justifyContent: 'center' }}>PARTNERSHIPS</div></FadeIn>
        <FadeIn delay={.1}><h2 className="section-title"><SmokeTitle>TRUSTED BY BRANDS</SmokeTitle></h2></FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20, marginTop: 60 }}>
          {(clients.length > 0 ? clients : Array(6).fill(null)).map((cl, i) => (
            <Reveal key={i} delay={i * .05}><div className="pm-client" style={{ height: 90, border: cl?.logo ? '1px solid var(--border)' : '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--gray-dark)', backgroundImage: cl?.logo ? `url(${cl.logo})` : 'none', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
              {!cl?.logo && (cl?.name || 'Client Logo')}
            </div></Reveal>
          ))}
        </div>
      </div></Section>

      {/* ═══ TESTIMONIALS ═══ */}
      <Section id="testimonials"><div style={{ background: 'var(--surface)', margin: 'calc(-1 * var(--section-pad)) calc(-1 * var(--side-pad))', padding: 'var(--section-pad) var(--side-pad)' }}>
        <FadeIn><div className="section-label">WHAT CLIENTS SAY</div></FadeIn>
        <FadeIn delay={.1}><h2 className="section-title"><SmokeTitle>TESTIMONIALS</SmokeTitle></h2></FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, marginTop: 60 }}>
          {(testimonials.length > 0 ? testimonials : [{ _id: '0', clientName: 'Your Client', company: 'Company', testimonial: { en: 'Add testimonials from admin.' }, rating: 5 }]).map((test: any, i: number) => (
            <Reveal key={test._id} delay={i * .1}><div className="pm-quote" style={{ padding: 36, background: 'var(--card)', border: '1px solid var(--border)', position: 'relative', height: '100%' }}>
              <div style={{ position: 'absolute', top: 12, right: 28, fontFamily: 'var(--font-display)', fontSize: 72, color: 'var(--red)', opacity: .15, lineHeight: 1 }}>"</div>
              <p style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>"{t(test.testimonial)}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--border)', backgroundImage: test.profileImage ? `url(${test.profileImage})` : 'none', backgroundSize: 'cover' }} />
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{test.clientName}</div><div style={{ fontSize: 12, color: 'var(--gray-dark)' }}>{test.company}</div></div>
              </div>
              <div style={{ marginTop: 12, color: '#eab308', fontSize: 14 }}>{'★'.repeat(test.rating || 5)}</div>
            </div></Reveal>
          ))}
        </div>
      </div></Section>

      {/* ═══ CONTACT (clickable: call/whatsapp/email/instagram) ═══ */}
      <Section id="contact" className="grid-bg">
        <FadeIn><div className="section-label">GET IN TOUCH</div></FadeIn>
        <FadeIn delay={.1}><h2 className="section-title"><SmokeTitle>{contactContent.heading || "LET'S CREATE SOMETHING"}</SmokeTitle><br /><span style={{ color: 'var(--red)' }}>{contactContent.headingAccent || 'PEOPLE REMEMBER.'}</span></h2></FadeIn>
        <FadeIn delay={.2}><p className="section-subtitle" style={{ marginBottom: 60 }}>{contactContent.subtext || "Whether you need digital marketing, social media management, an ad shoot — let's talk."}</p></FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginTop: 20 }}>
          <FadeIn delay={.3}><div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Phone with Call + WhatsApp buttons */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>📞</div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: 4 }}>Phone</div>
                <div style={{ fontSize: 15, marginBottom: 10 }}>{brand.phone || '+91 XXXXX XXXXX'}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href={`tel:${(brand.phone || '').replace(/\s/g, '')}`} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', padding: '7px 18px', background: 'var(--red)', color: '#fff' }}>📞 Direct Call</a>
                  <a href={`https://wa.me/${(brand.whatsapp || brand.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', padding: '7px 18px', background: '#25D366', color: '#fff' }}>💬 WhatsApp</a>
                </div>
              </div>
            </div>
            {/* Email — opens mail app */}
            <a href={`mailto:${brand.email || 'hello@fortmedia.in'}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>✉</div>
              <div><div style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: 2 }}>Email</div><div style={{ fontSize: 15 }}>{brand.email || 'hello@fortmedia.in'}</div></div>
            </a>
            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>📍</div>
              <div><div style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: 2 }}>Location</div><div style={{ fontSize: 15 }}>{brand.location || 'Your City, India'}</div></div>
            </div>
            {/* Instagram — opens profile */}
            <a href={`https://instagram.com/${(brand.instagram || 'fortmedia').replace('@', '')}`} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>📸</div>
              <div><div style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: 2 }}>Instagram</div><div style={{ fontSize: 15 }}>{brand.instagram || '@fortmedia'}</div></div>
            </a>
          </div></FadeIn>
          <FadeIn delay={.35}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div><label style={labelStyle}>Full Name</label><input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required style={inputStyle} /></div>
                <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div><label style={labelStyle}>Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Business</label><input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Service</label>
                <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value, shootType: '' })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select</option>{services.map(s => <option key={s._id} value={t(s.name)}>{t(s.name)}</option>)}
                </select>
              </div>
              {form.service === 'Quick Shoots' && (
                <div><label style={labelStyle}>Shoot Type</label>
                  <select value={form.shootType} onChange={e => setForm({ ...form, shootType: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select</option>{quickShoots.map(q => <option key={q._id} value={t(q.name)}>{t(q.name)}</option>)}
                  </select>
                </div>
              )}
              <div><label style={labelStyle}>Budget</label><input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Message</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
              <Magnetic enabled={premium} className="pm-submit-wrap">
                <button type="submit" className="btn-primary"><span>{contactContent.cta || "LET'S WORK TOGETHER"}</span></button>
              </Magnetic>
            </form>
          </FadeIn>
        </div>
      </Section>

      {/* ═══ FOOTER with social icons ═══ */}
      <footer style={{ padding: '60px var(--side-pad) 32px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 40, paddingBottom: 28, borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          <img src={logoUrl} alt="Fort Media" style={{ height: 56 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 36px' }}>
            {['Home', 'Portfolio', 'Services', 'About', 'Contact'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {brand.instagram && <a href={`https://instagram.com/${brand.instagram.replace('@','')}`} target="_blank" rel="noopener" title="Instagram" style={{ width: 40, height: 40, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--gray)', transition: 'all .3s' }} onMouseEnter={e=>{(e.currentTarget).style.borderColor='var(--red)';(e.currentTarget).style.color='#fff'}} onMouseLeave={e=>{(e.currentTarget).style.borderColor='var(--border)';(e.currentTarget).style.color='var(--gray)'}}>📸</a>}
            {(brand.whatsapp||brand.phone) && <a href={`https://wa.me/${(brand.whatsapp||brand.phone||'').replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener" title="WhatsApp" style={{ width: 40, height: 40, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--gray)', transition: 'all .3s' }} onMouseEnter={e=>{(e.currentTarget).style.borderColor='#25D366';(e.currentTarget).style.color='#fff'}} onMouseLeave={e=>{(e.currentTarget).style.borderColor='var(--border)';(e.currentTarget).style.color='var(--gray)'}}>💬</a>}
            {brand.phone && <a href={`tel:${brand.phone.replace(/\s/g,'')}`} title="Call" style={{ width: 40, height: 40, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--gray)', transition: 'all .3s' }} onMouseEnter={e=>{(e.currentTarget).style.borderColor='var(--red)';(e.currentTarget).style.color='#fff'}} onMouseLeave={e=>{(e.currentTarget).style.borderColor='var(--border)';(e.currentTarget).style.color='var(--gray)'}}>📞</a>}
            {brand.email && <a href={`mailto:${brand.email}`} title="Email" style={{ width: 40, height: 40, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--gray)', transition: 'all .3s' }} onMouseEnter={e=>{(e.currentTarget).style.borderColor='var(--red)';(e.currentTarget).style.color='#fff'}} onMouseLeave={e=>{(e.currentTarget).style.borderColor='var(--border)';(e.currentTarget).style.color='var(--gray)'}}>✉</a>}
            {brand.facebook && <a href={brand.facebook.startsWith('http')?brand.facebook:`https://facebook.com/${brand.facebook}`} target="_blank" rel="noopener" title="Facebook" style={{ width: 40, height: 40, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--gray)', transition: 'all .3s' }} onMouseEnter={e=>{(e.currentTarget).style.borderColor='#1877F2';(e.currentTarget).style.color='#fff'}} onMouseLeave={e=>{(e.currentTarget).style.borderColor='var(--border)';(e.currentTarget).style.color='var(--gray)'}}>f</a>}
            {brand.youtube && <a href={brand.youtube.startsWith('http')?brand.youtube:`https://youtube.com/${brand.youtube}`} target="_blank" rel="noopener" title="YouTube" style={{ width: 40, height: 40, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--gray)', transition: 'all .3s' }} onMouseEnter={e=>{(e.currentTarget).style.borderColor='#FF0000';(e.currentTarget).style.color='#fff'}} onMouseLeave={e=>{(e.currentTarget).style.borderColor='var(--border)';(e.currentTarget).style.color='var(--gray)'}}>▶</a>}
            {brand.linkedin && <a href={brand.linkedin.startsWith('http')?brand.linkedin:`https://linkedin.com/in/${brand.linkedin}`} target="_blank" rel="noopener" title="LinkedIn" style={{ width: 40, height: 40, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--gray)', transition: 'all .3s' }} onMouseEnter={e=>{(e.currentTarget).style.borderColor='#0A66C2';(e.currentTarget).style.color='#fff'}} onMouseLeave={e=>{(e.currentTarget).style.borderColor='var(--border)';(e.currentTarget).style.color='var(--gray)'}}>in</a>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 28, flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--gray-dark)' }}>© FORT MEDIA — ALL RIGHTS RESERVED.</span>
        </div>
      </footer>

      <style>{`
        @media(max-width:1024px) { .nav-desktop { display: none !important; } .nav-mobile-toggle { display: flex !important; } footer > div:first-child { grid-template-columns: 1fr !important; } }
        @media(max-width:768px) { #contact > div > div:last-child { grid-template-columns: 1fr !important; gap: 48px !important; } .about-stats { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}
