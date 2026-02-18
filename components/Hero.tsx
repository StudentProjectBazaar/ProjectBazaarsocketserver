import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigation } from '../App';

const TYPEWRITER_PHRASES = [
  'Sell your capstone project and earn real revenue',
  'Buy production-ready apps and save months of dev time',
  'Find freelancers who ship—not just promise',
  'Turn academic projects into assets that pay you back',
  'Discover. Build. Earn.—all in one marketplace.',
];

function useTypewriter(phrases: string[], speed = 45, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2.5);
    } else {
      setDeleting(false);
      setPhraseIdx((p) => (p + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  useEffect(() => {
    setDisplayed(phrases[phraseIdx].slice(0, charIdx));
  }, [charIdx, phraseIdx, phrases]);

  return displayed;
}

function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(targetMs);
  useEffect(() => {
    const iv = setInterval(() => setRemaining((r) => Math.max(0, r - 1000)), 1000);
    return () => clearInterval(iv);
  }, []);
  const d = Math.floor(remaining / 86400000);
  const h = Math.floor((remaining % 86400000) / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return { d, h, m, s };
}

const Pad = (n: number) => String(n).padStart(2, '0');

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' as const, delay: i * 0.12 },
  }),
};

const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
];

const Hero: React.FC = () => {
  const { navigateTo } = useNavigation();
  const text = useTypewriter(TYPEWRITER_PHRASES);
  const { d, h, m, s } = useCountdown(6 * 86400000);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-[#0a0a0a] pt-32 pb-20 md:pt-40 md:pb-32"
    >
      {/* Background grid + glows */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#ff7a001a] blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/[0.05] blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[50%] bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
      </motion.div>

      <div className="landing-container relative z-10 flex flex-col items-center">
        {/* Countdown badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="mb-8 flex items-center justify-center"
        >
          <div className="flex items-center gap-0 border border-white/10 rounded-lg overflow-hidden">
            <div className="bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white/80 whitespace-nowrap">
              New projects added weekly — join now
            </div>
            <div className="bg-white px-4 py-2 text-sm font-bold text-black font-mono tabular-nums">
              {Pad(d)} : {Pad(h)} : {Pad(m)} : {Pad(s)}
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="max-w-[1000px] text-center mb-10"
        >
          <h1 className="text-[44px] md:text-[72px] font-extrabold leading-[1.08] tracking-tight text-white">
            Discover. Build.{' '}
            <span className="orange-gradient-text italic">Earn.</span>
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-white/80 text-lg md:text-xl max-w-[640px] text-center mb-10"
        >
          The ultimate marketplace for projects, ideas, and collaborations. Turn your academic and personal projects into real revenue.
        </motion.p>

        {/* Typewriter card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="w-full max-w-[680px] mb-12"
        >
          <div className="glass-panel border border-white/10 rounded-2xl p-6 bg-[#1a1a1a]/40 shadow-2xl">
            <div className="text-white/90 text-lg md:text-xl font-medium mb-6 min-h-[56px] flex items-start">
              <span>{text}</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                className="inline-block w-[3px] h-6 bg-[#ff7a00] ml-1 mt-1 flex-shrink-0"
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-white/40 text-sm font-medium">Projects · Freelancers · Hackathons</span>
            </div>
          </div>
        </motion.div>

        {/* CTA + Avatars */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="flex flex-col md:flex-row items-center gap-8 mb-16"
        >
          <motion.button
            onClick={() => navigateTo('auth')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary-orange group h-[60px] px-8 text-lg flex items-center justify-center min-w-[260px]"
          >
            <span>Explore Projects</span>
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center ml-4 group-hover:scale-110 transition-transform">
              <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </motion.button>
          <button
            onClick={() => {
              const el = document.getElementById('how-it-works');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="h-[60px] px-8 text-lg font-semibold text-white/90 hover:text-white border border-white/20 rounded-full transition-colors"
          >
            Become a Seller
          </button>
          <div className="flex items-center gap-8">
            <div className="flex -space-x-3">
              {AVATARS.map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] overflow-hidden bg-gray-700"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
            <p className="text-white/60 uppercase text-xs font-bold tracking-widest max-w-[180px]">
              Join thousands building and earning.
            </p>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          style={{ y: videoY }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="w-full max-w-[1000px] relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 60px rgba(255,122,0,0.1)',
                '0 0 100px rgba(255,122,0,0.2)',
                '0 0 60px rgba(255,122,0,0.1)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#1a1a1a]"
          >
            <div className="absolute inset-0 flex items-center justify-center gap-4 flex-wrap p-8">
              {['Projects', 'Freelancers', 'Hackathons', 'Portfolio', 'Resume'].map((label, i) => (
                <div
                  key={i}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 font-medium"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
