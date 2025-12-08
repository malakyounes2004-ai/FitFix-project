import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * AnimatedWelcomeIllustration - A GSAP-animated welcome illustration
 * featuring three flat characters with the center one waving, plus floating icons
 * @param {Object} props
 * @param {boolean} props.isDarkMode - Whether dark mode is enabled
 */
const AnimatedWelcomeIllustration = ({ isDarkMode = false }) => {
  // Refs for GSAP animations
  const containerRef = useRef(null);
  const character1Ref = useRef(null);
  const character2Ref = useRef(null);
  const character3Ref = useRef(null);
  const wavingArmRef = useRef(null);
  const floatingCard1Ref = useRef(null);
  const floatingCard2Ref = useRef(null);
  const floatingCard3Ref = useRef(null);

  // Colors based on theme
  const colors = {
    // Character colors
    skin1: isDarkMode ? '#E8B896' : '#F5D0B5',
    skin2: isDarkMode ? '#D4A574' : '#E8C4A8',
    skin3: isDarkMode ? '#C49A6C' : '#D9B896',
    hair1: isDarkMode ? '#2C1810' : '#3D2317',
    hair2: isDarkMode ? '#8B4513' : '#A0522D',
    hair3: isDarkMode ? '#1A1A1A' : '#2D2D2D',
    shirt1: isDarkMode ? '#4F46E5' : '#6366F1', // Indigo
    shirt2: isDarkMode ? '#059669' : '#10B981', // Emerald (center)
    shirt3: isDarkMode ? '#DC2626' : '#EF4444', // Red
    pants1: isDarkMode ? '#1E293B' : '#334155',
    pants2: isDarkMode ? '#1E3A5F' : '#1E40AF',
    pants3: isDarkMode ? '#374151' : '#4B5563',
    // Card colors
    cardBg1: isDarkMode ? '#3B82F6' : '#60A5FA',
    cardBg2: isDarkMode ? '#8B5CF6' : '#A78BFA',
    cardBg3: isDarkMode ? '#F59E0B' : '#FBBF24',
    // Background elements
    ground: isDarkMode ? '#1a1d2e' : '#E2E8F0',
    shadow: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial hidden state
      gsap.set([character1Ref.current, character2Ref.current, character3Ref.current], {
        opacity: 0,
        y: 40,
      });
      gsap.set([floatingCard1Ref.current, floatingCard2Ref.current, floatingCard3Ref.current], {
        opacity: 0,
        y: 20,
        scale: 0.8,
      });

      // Entrance timeline
      const entranceTl = gsap.timeline({ delay: 0.2 });

      // Characters fade in + slide up (staggered)
      entranceTl
        .to(character2Ref.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
        })
        .to([character1Ref.current, character3Ref.current], {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.15,
        }, '-=0.4')
        .to([floatingCard1Ref.current, floatingCard2Ref.current, floatingCard3Ref.current], {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          stagger: 0.1,
        }, '-=0.3');

      // Waving arm animation (infinite loop)
      gsap.to(wavingArmRef.current, {
        rotation: 15,
        transformOrigin: 'bottom center',
        duration: 0.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1,
      });

      // Floating cards animation (yoyo movement)
      gsap.to(floatingCard1Ref.current, {
        y: -8,
        rotation: 3,
        duration: 2.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });

      gsap.to(floatingCard2Ref.current, {
        y: -10,
        rotation: -2,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.5,
      });

      gsap.to(floatingCard3Ref.current, {
        y: -6,
        rotation: 4,
        duration: 2.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.8,
      });

      // Subtle breathing animation for characters
      gsap.to([character1Ref.current, character2Ref.current, character3Ref.current], {
        scaleY: 1.01,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.3,
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Hover handlers
  const handleMouseEnter = () => {
    gsap.to(containerRef.current, {
      scale: 1.03,
      rotateY: 2,
      rotateX: -1,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(containerRef.current, {
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[400px] mx-auto select-none"
      style={{ perspective: '1000px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        viewBox="0 0 400 280"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? '#1a1d2e' : '#f8fafc'} />
            <stop offset="100%" stopColor={isDarkMode ? '#111324' : '#e2e8f0'} />
          </linearGradient>
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? '#252a3d' : '#e2e8f0'} />
            <stop offset="100%" stopColor={isDarkMode ? '#1a1d2e' : '#cbd5e1'} />
          </linearGradient>
          {/* Glow filter for cards */}
          <filter id="cardGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Shadow filter */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={colors.shadow} />
          </filter>
        </defs>

        {/* Background */}
        <rect width="400" height="280" fill="url(#bgGradient)" rx="24" />

        {/* Ground/floor */}
        <ellipse cx="200" cy="255" rx="160" ry="15" fill="url(#groundGradient)" />

        {/* Floating Card 1 - Phone icon (top left) */}
        <g ref={floatingCard1Ref}>
          <rect x="45" y="45" width="44" height="56" rx="8" fill={colors.cardBg1} filter="url(#cardGlow)" />
          <rect x="52" y="53" width="30" height="40" rx="3" fill="white" fillOpacity="0.9" />
          {/* Phone screen detail */}
          <rect x="55" y="57" width="24" height="20" rx="2" fill={isDarkMode ? '#60A5FA' : '#93C5FD'} fillOpacity="0.5" />
          <circle cx="67" cy="87" r="3" fill="white" fillOpacity="0.6" />
        </g>

        {/* Floating Card 2 - Mail icon (top right) */}
        <g ref={floatingCard2Ref}>
          <rect x="310" y="35" width="50" height="38" rx="8" fill={colors.cardBg2} filter="url(#cardGlow)" />
          {/* Envelope shape */}
          <rect x="318" y="45" width="34" height="22" rx="2" fill="white" fillOpacity="0.9" />
          <path d="M318 47 L335 58 L352 47" stroke={colors.cardBg2} strokeWidth="2" fill="none" />
        </g>

        {/* Floating Card 3 - Heart/health icon (middle right) */}
        <g ref={floatingCard3Ref}>
          <circle cx="355" cy="140" r="22" fill={colors.cardBg3} filter="url(#cardGlow)" />
          {/* Heart shape */}
          <path
            d="M355 150 C345 140 342 132 348 128 C354 124 355 130 355 130 C355 130 356 124 362 128 C368 132 365 140 355 150"
            fill="white"
            fillOpacity="0.9"
          />
        </g>

        {/* Character shadows */}
        <ellipse cx="105" cy="252" rx="30" ry="6" fill={colors.shadow} />
        <ellipse cx="200" cy="252" rx="35" ry="7" fill={colors.shadow} />
        <ellipse cx="295" cy="252" rx="30" ry="6" fill={colors.shadow} />

        {/* Character 1 (Left) - Female with ponytail */}
        <g ref={character1Ref}>
          {/* Body */}
          <rect x="80" y="165" width="50" height="65" rx="10" fill={colors.shirt1} />
          {/* Legs */}
          <rect x="85" y="225" width="18" height="30" rx="5" fill={colors.pants1} />
          <rect x="107" y="225" width="18" height="30" rx="5" fill={colors.pants1} />
          {/* Arms */}
          <rect x="70" y="170" width="14" height="40" rx="7" fill={colors.shirt1} />
          <rect x="126" y="170" width="14" height="40" rx="7" fill={colors.shirt1} />
          {/* Hands */}
          <circle cx="77" cy="215" r="8" fill={colors.skin1} />
          <circle cx="133" cy="215" r="8" fill={colors.skin1} />
          {/* Head */}
          <circle cx="105" cy="135" r="30" fill={colors.skin1} />
          {/* Hair - ponytail style */}
          <ellipse cx="105" cy="115" rx="28" ry="18" fill={colors.hair1} />
          <ellipse cx="130" cy="105" rx="12" ry="20" fill={colors.hair1} />
          {/* Face */}
          <circle cx="95" cy="135" r="3" fill="#1a1a2e" /> {/* Left eye */}
          <circle cx="115" cy="135" r="3" fill="#1a1a2e" /> {/* Right eye */}
          <path d="M100 147 Q105 152 110 147" stroke={isDarkMode ? '#c27b5c' : '#d49779'} strokeWidth="2" fill="none" /> {/* Smile */}
          {/* Neck */}
          <rect x="98" y="160" width="14" height="12" fill={colors.skin1} />
        </g>

        {/* Character 2 (Center) - Male waving */}
        <g ref={character2Ref}>
          {/* Body */}
          <rect x="172" y="155" width="56" height="75" rx="12" fill={colors.shirt2} />
          {/* Legs */}
          <rect x="180" y="225" width="20" height="32" rx="6" fill={colors.pants2} />
          <rect x="204" y="225" width="20" height="32" rx="6" fill={colors.pants2} />
          {/* Left arm (static) */}
          <rect x="158" y="162" width="16" height="45" rx="8" fill={colors.shirt2} />
          <circle cx="166" cy="212" r="10" fill={colors.skin2} />
          
          {/* Right arm (waving) - separate group for animation */}
          <g ref={wavingArmRef}>
            <rect x="226" y="155" width="16" height="45" rx="8" fill={colors.shirt2} transform="rotate(-30 234 200)" />
            <circle cx="252" cy="140" r="10" fill={colors.skin2} />
            {/* Open palm for waving */}
            <rect x="247" y="124" width="4" height="10" rx="2" fill={colors.skin2} />
            <rect x="252" y="122" width="4" height="12" rx="2" fill={colors.skin2} />
            <rect x="257" y="124" width="4" height="10" rx="2" fill={colors.skin2} />
            <rect x="262" y="127" width="4" height="8" rx="2" fill={colors.skin2} />
          </g>
          
          {/* Head */}
          <circle cx="200" cy="120" r="35" fill={colors.skin2} />
          {/* Hair - short style */}
          <ellipse cx="200" cy="95" rx="30" ry="20" fill={colors.hair2} />
          <ellipse cx="175" cy="105" rx="8" ry="12" fill={colors.hair2} />
          <ellipse cx="225" cy="105" rx="8" ry="12" fill={colors.hair2} />
          {/* Face */}
          <ellipse cx="188" cy="118" rx="4" ry="5" fill="#1a1a2e" /> {/* Left eye */}
          <ellipse cx="212" cy="118" rx="4" ry="5" fill="#1a1a2e" /> {/* Right eye */}
          {/* Big friendly smile */}
          <path d="M185 135 Q200 150 215 135" stroke={isDarkMode ? '#b5855b' : '#c9977a'} strokeWidth="3" fill="none" />
          {/* Eyebrows (friendly) */}
          <path d="M182 108 Q188 105 194 108" stroke={colors.hair2} strokeWidth="2" fill="none" />
          <path d="M206 108 Q212 105 218 108" stroke={colors.hair2} strokeWidth="2" fill="none" />
          {/* Neck */}
          <rect x="192" y="150" width="16" height="12" fill={colors.skin2} />
        </g>

        {/* Character 3 (Right) - Female with short hair */}
        <g ref={character3Ref}>
          {/* Body */}
          <rect x="270" y="168" width="50" height="62" rx="10" fill={colors.shirt3} />
          {/* Legs */}
          <rect x="275" y="225" width="18" height="30" rx="5" fill={colors.pants3} />
          <rect x="297" y="225" width="18" height="30" rx="5" fill={colors.pants3} />
          {/* Arms */}
          <rect x="260" y="173" width="14" height="38" rx="7" fill={colors.shirt3} />
          <rect x="316" y="173" width="14" height="38" rx="7" fill={colors.shirt3} />
          {/* Hands on hips pose */}
          <circle cx="262" cy="210" r="8" fill={colors.skin3} />
          <circle cx="328" cy="210" r="8" fill={colors.skin3} />
          {/* Head */}
          <circle cx="295" cy="138" r="28" fill={colors.skin3} />
          {/* Hair - short bob style */}
          <ellipse cx="295" cy="120" rx="30" ry="22" fill={colors.hair3} />
          <rect x="265" y="115" width="60" height="20" rx="10" fill={colors.hair3} />
          {/* Face */}
          <circle cx="286" cy="138" r="3" fill="#1a1a2e" /> {/* Left eye */}
          <circle cx="304" cy="138" r="3" fill="#1a1a2e" /> {/* Right eye */}
          <path d="M290 150 Q295 154 300 150" stroke={isDarkMode ? '#a8845d' : '#bd9470'} strokeWidth="2" fill="none" /> {/* Smile */}
          {/* Neck */}
          <rect x="288" y="162" width="14" height="12" fill={colors.skin3} />
        </g>

        {/* Decorative dots/particles */}
        <circle cx="60" cy="180" r="3" fill={isDarkMode ? '#4F46E5' : '#A5B4FC'} opacity="0.6" />
        <circle cx="340" cy="200" r="4" fill={isDarkMode ? '#10B981' : '#6EE7B7'} opacity="0.5" />
        <circle cx="150" cy="60" r="3" fill={isDarkMode ? '#F59E0B' : '#FCD34D'} opacity="0.6" />
        <circle cx="250" cy="70" r="2" fill={isDarkMode ? '#EC4899' : '#F9A8D4'} opacity="0.5" />
        <circle cx="30" cy="120" r="2" fill={isDarkMode ? '#8B5CF6' : '#C4B5FD'} opacity="0.4" />
        <circle cx="370" cy="90" r="3" fill={isDarkMode ? '#14B8A6' : '#5EEAD4'} opacity="0.5" />
      </svg>
    </div>
  );
};

export default AnimatedWelcomeIllustration;

