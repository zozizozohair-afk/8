'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowUpRight, Loader2, Building2, Sparkles, LocateFixed, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'ongoing', label: 'قيد الإنشاء' },
  { id: 'completed', label: 'مكتمل' },
];

const RIYADH_NEIGHBORHOOD_COORDS = [
  { name: 'النزهة الجديدة', alt: ['النزهة', 'النزهه', 'حي النزهة', 'نزهة'], lat: 24.8019, lng: 46.7778 },
  { name: 'النرجس', alt: ['حي النرجس', 'النرجس', 'نرجس'], lat: 24.7711, lng: 46.6649 },
  { name: 'الملقا', alt: ['حي الملقا', 'الملقا', 'ملقا'], lat: 24.7115, lng: 46.6713 },
  { name: 'الربوة', alt: ['حي الربوة', 'الربوة', 'ربوه'], lat: 24.7833, lng: 46.6488 },
  { name: 'الأندلس', alt: ['حي الأندلس', 'الاندلس', 'اندلس'], lat: 24.7515, lng: 46.6293 },
  { name: 'الورود', alt: ['حي الورود', 'الورود', 'ورود'], lat: 24.7301, lng: 46.6663 },
  { name: 'المروج', alt: ['حي المروج', 'المروج', 'مروج'], lat: 24.7195, lng: 46.6953 },
  { name: 'النخيل', alt: ['حي النخيل', 'النخيل', 'نخيل'], lat: 24.7407, lng: 46.6593 },
  { name: 'العليا', alt: ['حي العليا', 'العليا', 'عليا'], lat: 24.6873, lng: 46.6908 },
  { name: 'الفيصلية', alt: ['حي الفيصلية', 'الفيصليه', 'الفيصلية'], lat: 24.6644, lng: 46.6950 },
  { name: 'الصحافة', alt: ['حي الصحافة', 'الصحافه', 'الصحافة'], lat: 24.7162, lng: 46.6388 },
  { name: 'الملك فيصل', alt: ['حي الملك فيصل', 'ملك فيصل'], lat: 24.6911, lng: 46.6096 },
  { name: 'السليمانية', alt: ['حي السليمانية', 'السليمانيه', 'سليمانية'], lat: 24.6914, lng: 46.7204 },
  { name: 'المنصورة', alt: ['حي المنصورة', 'المنصوره', 'منصوره'], lat: 24.6289, lng: 46.7203 },
  { name: 'الخالدية', alt: ['حي الخالدية', 'الخالديه', 'خالدية'], lat: 24.6086, lng: 46.7594 },
  { name: 'الشرفية', alt: ['حي الشرفية', 'الشرفيه', 'شرفية'], lat: 24.5911, lng: 46.6891 },
  { name: 'السويدي', alt: ['حي السويدي', 'السويدي', 'سويدي'], lat: 24.5493, lng: 46.6506 },
  { name: 'الرائد', alt: ['حي الرائد', 'الرائد'], lat: 24.7100, lng: 46.7794 },
  { name: 'القراءات', alt: ['حي القراءات', 'القراءات'], lat: 24.7523, lng: 46.8101 },
  { name: 'اليمامة', alt: ['حي اليمامة', 'اليمامah', 'اليمامة'], lat: 24.6526, lng: 46.8199 },
  { name: 'المغرزات الغربية', alt: ['المغرزات الغربيه', 'مغرزات غربيه', 'المغرزات'], lat: 24.7395, lng: 46.5792 },
  { name: 'المغرزات الشرقية', alt: ['المغرزات الشرقيه', 'مغرزات شرقيه'], lat: 24.7209, lng: 46.7908 },
  { name: 'وسط الرياض', alt: ['وسط الرياض', 'الوسط', 'وسط البلد'], lat: 24.6358, lng: 46.7161 },
  { name: 'العزيزية', alt: ['حي العزيزية', 'العزيزيه', 'عزيزية'], lat: 24.5710, lng: 46.7240 },
  { name: 'الشمال', alt: ['شمال الرياض', 'الشمال', 'شمال'], lat: 24.8100, lng: 46.7000 },
  { name: 'الجنوب', alt: ['جنوب الرياض', 'الجنوب', 'جنوب'], lat: 24.4700, lng: 46.7000 },
  { name: 'الشرق', alt: ['شرق الرياض', 'الشرق', 'شرق'], lat: 24.6500, lng: 46.8800 },
  { name: 'الغرب', alt: ['غرب الرياض', 'الغرب', 'غرب'], lat: 24.7000, lng: 46.5100 },
];

const getMapEmbedUrl = (link, location) => {
  if (link) {
    const safeLink = link.startsWith('http') ? link : `https://${link}`;

    if (safeLink.includes('/maps/embed')) {
      if (safeLink.startsWith('https://www.google.com/maps') || 
          safeLink.startsWith('https://maps.google.com') ||
          safeLink.startsWith('https://google.com/maps')) {
        return safeLink;
      }
    }

    const coordsMatch = safeLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      const [_, lat, lng] = coordsMatch;
      return `https://maps.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;
    }

    const placeMatch = safeLink.match(/\/maps\/place\/([^/]+)/);
    if (placeMatch) {
       const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
       return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&hl=ar&z=15&output=embed`;
    }

    const qMatch = safeLink.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      return `https://maps.google.com/maps?q=${qMatch[1]}&hl=ar&z=15&output=embed`;
    }
    
    const llMatch = safeLink.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
      return `https://maps.google.com/maps?q=${llMatch[1]},${llMatch[2]}&hl=ar&z=15&output=embed`;
    }
    
    const rawCoordsMatch = safeLink.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
    if (rawCoordsMatch) {
        return `https://maps.google.com/maps?q=${rawCoordsMatch[1]},${rawCoordsMatch[2]}&hl=ar&z=15&output=embed`;
    }
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(location || 'الرياض')}&hl=ar&z=15&output=embed`;
};

const resolveProjectCoordinates = (link, location) => {
  if (link) {
    const safeLink = link.startsWith('http') ? link : `https://${link}`;

    const coordsMatch = safeLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) return { lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) };

    const qCoordsMatch = safeLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qCoordsMatch) return { lat: parseFloat(qCoordsMatch[1]), lng: parseFloat(qCoordsMatch[2]) };

    const llMatch = safeLink.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };

    const rawCoordsMatch = safeLink.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (rawCoordsMatch) return { lat: parseFloat(rawCoordsMatch[1]), lng: parseFloat(rawCoordsMatch[2]) };

    const placeMatch = safeLink.match(/\/maps\/place\/([^/]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      const byLoc = findCoordsByLocationName(placeName);
      if (byLoc.lat !== null) return byLoc;
    }

    const qMatch = safeLink.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      const decoded = decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
      const byLoc = findCoordsByLocationName(decoded);
      if (byLoc.lat !== null) return byLoc;
      const inlineCoords = decoded.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (inlineCoords) return { lat: parseFloat(inlineCoords[1]), lng: parseFloat(inlineCoords[2]) };
    }
  }

  if (location) {
    const byLoc = findCoordsByLocationName(location);
    if (byLoc.lat !== null) return byLoc;
    const inlineCoords = location.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (inlineCoords) return { lat: parseFloat(inlineCoords[1]), lng: parseFloat(inlineCoords[2]) };
  }

  return { lat: null, lng: null };
};

const findCoordsByLocationName = (locationStr) => {
  if (!locationStr || typeof locationStr !== 'string') return { lat: null, lng: null };
  const norm = (s) => s.toLowerCase()
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '')
    .replace(/حي|الرياض|المملكة|السعودية|العربية/gi, '');
  
  const query = norm(locationStr);
  if (!query) return { lat: null, lng: null };

  for (const item of RIYADH_NEIGHBORHOOD_COORDS) {
    const names = [item.name, ...(item.alt || [])];
    for (const name of names) {
      if (query.includes(norm(name)) || norm(name).includes(query)) {
        return { lat: item.lat, lng: item.lng };
      }
    }
  }

  const rawInText = locationStr.match(/(-?\d{2}\.\d+)\s*[,،\s]+(-?\d{2}\.\d+)/);
  if (rawInText) {
    return { lat: parseFloat(rawInText[1]), lng: parseFloat(rawInText[2]) };
  }

  return { lat: null, lng: null };
};

const extractCoordinates = (linkStr) => {
  if (!linkStr || typeof linkStr !== 'string') return { lat: null, lng: null };
  try {
    const coordsMatch = linkStr.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      return { lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) };
    }
    const qMatch = linkStr.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }
    const qPlaceMatch = linkStr.match(/[?&]q=([^&]+)/);
    if (qPlaceMatch) {
      const decoded = decodeURIComponent(qPlaceMatch[1].replace(/\+/g, ' '));
      const coords = findCoordsByLocationName(decoded);
      if (coords.lat) return coords;
    }
    const rawMatch = linkStr.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
    if (rawMatch) {
      return { lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) };
    }
  } catch (e) { /* empty */ }
  return { lat: null, lng: null };
};

const RIYADH_BOUNDS = {
  minLat: 24.40,
  maxLat: 24.95,
  minLng: 46.38,
  maxLng: 47.20,
};

const RIYADH_CENTER = {
  lat: (RIYADH_BOUNDS.minLat + RIYADH_BOUNDS.maxLat) / 2,
  lng: (RIYADH_BOUNDS.minLng + RIYADH_BOUNDS.maxLng) / 2,
};

const GLOBAL_MAP_ZOOM = 10;

const latLngToXY = (lat, lng, fallbackIdx, totalCount) => {
  const { minLat, maxLat, minLng, maxLng } = RIYADH_BOUNDS;
  let x, y;

  if (lat !== null && lng !== null) {
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const cLat = clamp(lat, minLat, maxLat);
    const cLng = clamp(lng, minLng, maxLng);
    x = ((cLng - minLng) / (maxLng - minLng)) * 100;
    y = 100 - ((cLat - minLat) / (maxLat - minLat)) * 100;
  } else {
    const jitter = (fallbackIdx % 2 === 0 ? -1 : 1) * (fallbackIdx % 5) * 1.8;
    const baseX = 20 + ((fallbackIdx * 13) % 62);
    const baseY = 22 + ((fallbackIdx * 19) % 58);
    x = Math.max(5, Math.min(95, baseX + jitter * 0.5));
    y = Math.max(10, Math.min(90, baseY + jitter * 0.3));
  }

  return { x, y };
};

export default function Projects() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [hoveredMapId, setHoveredMapId] = useState(null);
  const [tooltipMapId, setTooltipMapId] = useState(null);
  const [activeMapProjectId, setActiveMapProjectId] = useState(null);
  const scrollerRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (filteredItems.length > 0 && activeMapProjectId) {
      const exists = filteredItems.some(p => p.id === activeMapProjectId);
      if (!exists) setActiveMapProjectId(null);
    }
  }, [filteredItems, activeMapProjectId]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, location, status, main_image, link')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const total = data.length;
        const mapped = data.map((p, idx) => {
          const { lat, lng } = resolveProjectCoordinates(p.link, p.location);
          const { x, y } = latLngToXY(lat, lng, idx, total);
          return {
            id: p.id,
            title: p.name || 'مشروع',
            location: p.location || 'غير محدد',
            status: p.status === 'ongoing' ? 'قيد الإنشاء' : p.status === 'completed' ? 'مكتمل' : 'قريباً',
            rawStatus: p.status,
            image: p.main_image || '/images/4.png',
            link: p.link || null,
            resolvedLat: lat,
            resolvedLng: lng,
            mapEmbedUrl: getMapEmbedUrl(p.link, p.location),
            mapExternalLink: p.link 
              ? (p.link.startsWith('http') ? p.link : `https://${p.link}`)
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.location || 'الرياض')}`,
            mapX: x,
            mapY: y,
          };
        });
        setItems(mapped);
        setFilteredItems(mapped);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.rawStatus === activeFilter));
    }
  }, [activeFilter, items]);

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (loading) return;
    if (filteredItems.length === 0) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) return;

    const isMdUp = window.matchMedia?.('(min-width: 768px)')?.matches;
    if (isMdUp) return;

    let rafId = 0;
    let lastTs;
    const speedPxPerMs = 0.04;

    const tick = (ts) => {
      if (lastTs === undefined) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (!pausedRef.current) {
        el.scrollLeft += dt * speedPxPerMs;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
      window.cancelAnimationFrame(rafId);
    };
  }, [activeFilter, filteredItems.length, loading]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    pausedRef.current = false;
  }, [activeFilter, filteredItems.length, loading]);

  const pauseAutoScroll = () => {
    pausedRef.current = true;
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
    }
  };

  const scheduleResumeAutoScroll = () => {
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 1400);
  };

  return (
    <section id="projects" className="py-24 bg-gray-50 relative overflow-hidden dir-rtl [font-family:var(--font-cairo)]">
      {/* Decorative Background - Antique Bronze */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] bg-[#8B6A14]/[0.04] rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
              مشاريعنا <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#B8953E] via-[#8B6A14] to-[#6B5210]">المتميزة</span>
            </h2>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 font-light">
              نستعرض لكم نخبة من مشاريعنا العقارية التي تجمع بين التصميم العصري والموقع الاستراتيجي لتلبية تطلعاتكم.
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 tracking-wide ${
                  activeFilter === filter.id
                    ? 'bg-gradient-to-br from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] shadow-lg shadow-[#8B6A14]/25 ring-1 ring-[#8B6A14]/20'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 hover:border-[#8B6A14]/25 hover:text-[#8B6A14]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-[#8B6A14] animate-spin" strokeWidth={2.25} />
          </div>
        ) : (
          <>
            <div className="md:hidden -mx-6 sm:-mx-16">
              {filteredItems.length > 0 ? (
                <div
                  ref={scrollerRef}
                  dir="ltr"
                  onPointerDown={pauseAutoScroll}
                  onPointerUp={scheduleResumeAutoScroll}
                  onPointerCancel={scheduleResumeAutoScroll}
                  onMouseEnter={pauseAutoScroll}
                  onMouseLeave={scheduleResumeAutoScroll}
                  onTouchStart={pauseAutoScroll}
                  onTouchEnd={scheduleResumeAutoScroll}
                  className="overflow-x-auto scrollbar-hide px-6 sm:px-16"
                >
                  <div className="flex w-max gap-4 pb-2">
                    {filteredItems.concat(filteredItems).map((project, index) => (
                      <Link
                        key={`${project.id}-${index}`}
                        href={`/projects/${project.id}`}
                        dir="rtl"
                        className="block group w-[88vw] max-w-sm flex-shrink-0"
                      >
                        <div className="relative h-[390px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 bg-white border border-gray-200 ring-1 ring-black/5">
                          <div className="absolute inset-0 bg-gray-200">
                            {!imageErrors[project.id] ? (
                              <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={() => handleImageError(project.id)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 flex-col gap-3">
                                <Building2 className="w-10 h-10 text-gray-300" strokeWidth={2.25} />
                                <span className="text-gray-400 text-sm">صورة غير متوفرة</span>
                              </div>
                            )}
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />

                          <div className="absolute inset-0 p-7 flex flex-col justify-end text-white">
                            <div className="absolute top-5 right-5">
                              <span className={`px-4 py-2 rounded-2xl text-xs font-bold tracking-wide backdrop-blur-md border shadow-sm ${
                                project.rawStatus === 'ongoing' 
                                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-100' 
                                  : project.rawStatus === 'completed'
                                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100'
                                  : 'bg-sky-500/20 border-sky-500/30 text-sky-100'
                              }`}>
                                {project.status}
                              </span>
                            </div>

                            <h3 className="text-2xl font-extrabold mb-3 group-hover:text-[#C9A84B] transition-colors duration-300 drop-shadow-[0_10px_25px_rgba(0,0,0,0.55)] tracking-tight">
                              {project.title}
                            </h3>

                            <div className="flex items-center text-gray-200 text-base mb-4">
                              <MapPin className="w-4 h-4 ml-1 text-[#C9A84B]" strokeWidth={2.25} />
                              <span>{project.location}</span>
                            </div>

                            <div className="flex items-center gap-2 text-base font-semibold text-white group-hover:text-[#C9A84B] transition-colors duration-300">
                              <span>استعراض التفاصيل</span>
                              <ArrowUpRight className="w-4 h-4" strokeWidth={2.25} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  لا توجد مشاريع في هذا القسم حالياً.
                </div>
              )}
            </div>

            <motion.div 
              layout
              className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode='popLayout'>
                {filteredItems.length > 0 ? (
                  filteredItems.map((project) => (
                    <motion.div
                      layout
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link href={`/projects/${project.id}`} className="block group h-full">
                        <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white ring-1 ring-black/5">
                          <div className="absolute inset-0 bg-gray-200">
                            {!imageErrors[project.id] ? (
                              <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={() => handleImageError(project.id)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 flex-col gap-3">
                                <Building2 className="w-10 h-10 text-gray-300" strokeWidth={2.25} />
                                <span className="text-gray-400 text-sm">صورة غير متوفرة</span>
                              </div>
                            )}
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                          <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                            <div className="absolute top-6 right-6">
                              <span className={`px-4 py-2 rounded-2xl text-xs font-bold tracking-wide backdrop-blur-md border ${
                                project.rawStatus === 'ongoing' 
                                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-100' 
                                  : project.rawStatus === 'completed'
                                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100'
                                  : 'bg-sky-500/20 border-sky-500/30 text-sky-100'
                              }`}>
                                {project.status}
                              </span>
                            </div>

                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                              <h3 className="text-2xl font-extrabold mb-3 group-hover:text-[#C9A84B] transition-colors duration-300 tracking-tight">
                                {project.title}
                              </h3>

                              <div className="flex items-center text-gray-300 text-sm mb-6">
                                <MapPin className="w-4 h-4 ml-1 text-[#C9A84B]" strokeWidth={2.25} />
                                <span>{project.location}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm font-semibold text-white group-hover:text-[#C9A84B] transition-colors duration-300 opacity-0 group-hover:opacity-100 delay-75">
                                <span>استعراض التفاصيل</span>
                                <ArrowUpRight className="w-4 h-4" strokeWidth={2.25} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 text-gray-500">
                    لا توجد مشاريع في هذا القسم حالياً.
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            {filteredItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-24"
              >
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[#8B6A14]" strokeWidth={2.25} />
                    <span className="text-[#8B6A14] tracking-wider text-xs font-extrabold">توزيع جغرافي ذكي</span>
                    <Sparkles className="w-4 h-4 text-[#8B6A14]" strokeWidth={2.25} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    مواقع مشاريعنا على <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#B8953E] via-[#8B6A14] to-[#6B5210]">الخريطة</span>
                  </h3>
                  <p className="text-gray-600 font-light max-w-2xl mx-auto">
                    اكتشف مواقعنا المتميزة داخل الرياض؛ مرر المؤشر على أي نقطة أو انقر عليها للانتقال مباشرة إلى تفاصيل المشروع.
                  </p>
                </div>

                <div className="bg-white rounded-[22px] p-3 md:p-4 lg:p-8 shadow-xl shadow-[#8B6A14]/5 border border-gray-100 ring-1 ring-black/5">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 lg:gap-8 items-stretch">
                    
                    <div className="relative w-full min-h-[380px] md:min-h-[420px] lg:min-h-[460px] rounded-2xl overflow-hidden group/map select-none border border-gray-100 ring-1 ring-black/5 bg-[#eaeaf0]">
                      
                      <iframe
                        title="خريطة مشاريع صفوة عنان"
                        src={`https://maps.google.com/maps?ll=${RIYADH_CENTER.lat},${RIYADH_CENTER.lng}&z=${GLOBAL_MAP_ZOOM}&hl=ar&t=m&output=embed`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0 [filter:grayscale(0.45)_contrast(1.1)_brightness(1.04)_sepia(0.22)_hue-rotate(-10deg)_saturate(1.03)] scale-[1.02] group-hover/map:scale-[1.04] transition-transform duration-[1.5s]"
                      />

                      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(11,11,11,0)_55%,rgba(11,11,11,0.28)_100%)]" />
                      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b from-white/28 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none bg-gradient-to-t from-white/30 to-transparent" />
                      <div className="absolute inset-y-0 left-0 w-20 pointer-events-none bg-gradient-to-l from-transparent to-white/8" />
                      <div className="absolute inset-y-0 right-0 w-20 pointer-events-none bg-gradient-to-r from-transparent to-white/8" />

                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/92 backdrop-blur-md border border-[#B8953E]/20 shadow-md z-20">
                          <LocateFixed className="w-4 h-4 text-[#8B6A14]" strokeWidth={2.25} />
                          <span className="text-[10px] md:text-xs font-extrabold text-[#6B5210] tracking-wide">الرياض — جميع المشاريع ({filteredItems.length})</span>
                        </div>

                        <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-2xl bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                            <span className="text-[10px] md:text-xs font-semibold text-gray-700">مكتمل</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-2xl bg-[#B8953E] shadow-sm shadow-[#B8953E]/40" />
                            <span className="text-[10px] md:text-xs font-semibold text-gray-700">قيد الإنشاء</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-2xl bg-sky-500 shadow-sm shadow-sky-500/30" />
                            <span className="text-[10px] md:text-xs font-semibold text-gray-700">قريباً</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 z-10">
                        {filteredItems.map((project) => {
                          const isHovered = hoveredMapId === project.id;
                          const showTooltip = isHovered || tooltipMapId === project.id;
                          const isZoomed = activeMapProjectId === project.id;
                          const pinColor = project.rawStatus === 'completed' 
                            ? '#10b981' 
                            : project.rawStatus === 'ongoing' 
                            ? '#8B6A14' 
                            : '#0ea5e9';
                          const pinRing = project.rawStatus === 'completed' 
                            ? '#34d399' 
                            : project.rawStatus === 'ongoing' 
                            ? '#B8953E' 
                            : '#38bdf8';

                          return (
                            <button
                              key={project.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                                if (isMobile) {
                                  router.push(`/projects/${project.id}`);
                                } else {
                                  if (tooltipMapId === project.id) {
                                    setTooltipMapId(null);
                                    setActiveMapProjectId(project.id);
                                  } else {
                                    setTooltipMapId(project.id);
                                  }
                                }
                              }}
                              onMouseEnter={() => setHoveredMapId(project.id)}
                              onMouseLeave={() => setHoveredMapId(null)}
                              style={{ left: `${project.mapX}%`, top: `${project.mapY}%` }}
                              className={`absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer transition-all duration-300 ${isZoomed ? 'z-40 scale-105' : 'z-10 hover:z-20'}`}
                              aria-label={`تحديد موقع ${project.title}`}
                            >
                              <div className="relative flex flex-col items-center">
                                {showTooltip && !isZoomed && (typeof window === 'undefined' || window.innerWidth >= 768) && (
                                  <>
                                    <motion.div
                                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      className="hidden md:block absolute bottom-full mb-3 z-30 min-w-[200px] md:min-w-[230px] bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-2xl shadow-black/15 ring-1 ring-black/5"
                                    >
                                      <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/4 w-3 h-3 bg-white border-b border-l border-gray-200 rotate-45" />
                                      <div className="flex items-start justify-between gap-3 mb-1.5">
                                        <h5 className="font-extrabold text-[#6B5210] text-sm md:text-base tracking-tight truncate max-w-[150px]">{project.title}</h5>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide shrink-0 ${
                                          project.rawStatus === 'completed'
                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                            : project.rawStatus === 'ongoing'
                                            ? 'bg-[#B8953E]/10 text-[#8B6A14] ring-1 ring-[#B8953E]/30'
                                            : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                                        }`}>
                                          {project.status}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-gray-500 mb-3 font-medium">
                                        <MapPin size={12} strokeWidth={2.25} style={{ color: pinColor }} />
                                        <span className="truncate">{project.location}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setTooltipMapId(null);
                                            router.push(`/projects/${project.id}`);
                                          }}
                                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-2xl bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] text-[11px] font-extrabold hover:shadow-md transition-all tracking-wide"
                                        >
                                          <span>عرض التفاصيل</span>
                                          <ArrowUpRight size={12} strokeWidth={2.25} />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setTooltipMapId(null);
                                            setActiveMapProjectId(project.id);
                                          }}
                                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-2xl bg-gray-50 text-[#6B5210] text-[11px] font-extrabold hover:bg-gray-100 transition-all ring-1 ring-black/5 tracking-wide"
                                        >
                                          <LocateFixed size={12} strokeWidth={2.25} />
                                          <span>تكبير</span>
                                        </button>
                                      </div>
                                    </motion.div>

                                    <motion.div
                                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10 }}
                                      className="md:hidden fixed inset-x-0 bottom-0 sm:inset-x-2 sm:bottom-2 z-[9999] bg-white rounded-t-[28px] sm:rounded-3xl border-t sm:border border-gray-100 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/10 overflow-y-auto custom-scrollbar"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="relative flex flex-col min-h-[58dvh]">
                                        <div className="relative px-4 pt-3.5 pb-2.5 border-b border-gray-50 flex items-start justify-between gap-3 shrink-0">
                                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <span className={`relative w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-sm`} style={{ backgroundColor: pinColor }} />
                                            <div className="min-w-0 flex-1">
                                              <h5 className="font-extrabold text-[#4A380A] text-sm md:text-base tracking-tight truncate leading-tight">{project.title}</h5>
                                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5 font-medium">
                                                <MapPin size={11} strokeWidth={2.25} style={{ color: pinColor }} />
                                                <span className="truncate">{project.location}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                                              project.rawStatus === 'completed'
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                : project.rawStatus === 'ongoing'
                                                ? 'bg-[#B8953E]/10 text-[#8B6A14] ring-1 ring-[#B8953E]/30'
                                                : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                                            }`}>
                                              {project.status}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setTooltipMapId(null);
                                              }}
                                              className="w-8 h-8 rounded-2xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all flex items-center justify-center ring-1 ring-black/5"
                                              aria-label="إغلاق"
                                            >
                                              <X size={15} strokeWidth={2.5} />
                                            </button>
                                          </div>
                                        </div>

                                        <div className="relative w-full min-h-[260px] sm:min-h-[320px] md:min-h-[340px] flex-1 bg-[#eaeaf0] border-y border-gray-50 overflow-hidden">
                                          <iframe
                                            title={`خريطة ${project.title}`}
                                            src={project.mapEmbedUrl}
                                            loading="eager"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            allowFullScreen
                                            className="absolute inset-0 w-full h-full border-0"
                                          />
                                          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(11,11,11,0)_55%,rgba(11,11,11,0.18)_100%)]" />
                                          <div className="absolute inset-x-0 top-0 h-10 pointer-events-none bg-gradient-to-b from-white/25 to-transparent" />
                                          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none bg-gradient-to-t from-white/28 to-transparent" />
                                        </div>

                                        <div className="relative p-2.5 sm:p-3.5 flex flex-col sm:flex-row gap-2 sm:gap-2.5 shrink-0">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setTooltipMapId(null);
                                              router.push(`/projects/${project.id}`);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] font-extrabold text-[13px] sm:text-sm hover:shadow-[0_0_22px_rgba(184,149,62,0.32)] hover:-translate-y-0.5 transition-all tracking-wide ring-1 ring-[#B8953E]/30"
                                          >
                                            <ArrowUpRight size={15} strokeWidth={2.25} />
                                            <span>فتح تفاصيل المشروع</span>
                                          </button>
                                          <a
                                            href={project.mapExternalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-white text-[#6B5210] font-extrabold text-[13px] sm:text-sm hover:scale-[1.01] hover:bg-gray-50 transition-all tracking-wide ring-1 ring-black/8 shadow-sm"
                                          >
                                            <MapPin size={15} strokeWidth={2.25} style={{ color: pinColor }} />
                                            <span>فتح موقع المشروع</span>
                                          </a>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </>
                                )}

                                <span 
                                  className={`absolute top-0 w-10 h-10 rounded-full -z-0 ${showTooltip ? 'animate-ping' : ''}`}
                                  style={{ 
                                    background: `radial-gradient(circle, ${pinRing}dd 0%, transparent 70%)`,
                                    opacity: showTooltip ? 1 : 0.55,
                                    transform: showTooltip ? 'scale(1.9)' : 'scale(1.25)',
                                    transition: 'all 0.3s ease',
                                  }}
                                />
                                <span 
                                  className={`relative z-10 flex items-center justify-center transition-all duration-200 ${showTooltip ? 'scale-130 -translate-y-1' : 'scale-100'}`}
                                >
                                  <svg width={showTooltip ? 46 : 36} height={showTooltip ? 58 : 46} viewBox="0 0 34 44" fill="none">
                                    <path
                                      d="M17 0C7.61 0 0 7.61 0 17c0 12 13.5 24.7 15.2 26.3a2.5 2.5 0 0 0 3.6 0C20.5 41.7 34 29 34 17 34 7.61 26.39 0 17 0Z"
                                      fill={pinColor}
                                      className="drop-shadow-[0_14px_20px_rgba(0,0,0,0.28)]"
                                      stroke="#ffffff"
                                      strokeWidth="1.5"
                                    />
                                    <circle cx="17" cy="16" r="8" fill="white" />
                                    <circle cx="17" cy="16" r="6" fill={pinRing} />
                                    <circle cx="17" cy="16" r="2.4" fill="white" />
                                  </svg>
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {activeMapProjectId && (() => {
                        const project = filteredItems.find(p => p.id === activeMapProjectId);
                        if (!project) return null;
                        const pinColor = project.rawStatus === 'completed' 
                          ? '#10b981' 
                          : project.rawStatus === 'ongoing' 
                          ? '#8B6A14' 
                          : '#0ea5e9';
                        return (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-black/30 backdrop-blur-[2px] p-3 md:p-5 flex items-center justify-center"
                            onClick={() => setActiveMapProjectId(null)}
                          >
                            <div
                              className="relative w-full max-w-4xl h-full rounded-3xl overflow-hidden bg-white shadow-2xl shadow-black/40 ring-1 ring-black/10 border border-white/40"
                              onClick={(e) => e.stopPropagation()}
                              style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.45)' }}
                            >
                              <button
                                onClick={() => setActiveMapProjectId(null)}
                                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 hover:bg-[#6B5210] hover:text-[#FAF3E0] transition-all duration-300 flex items-center justify-center"
                              >
                                <X size={18} strokeWidth={2.5} />
                              </button>

                              <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-md ring-1 ring-black/10">
                                <span className={`w-2.5 h-2.5 rounded-2xl shadow-sm`} style={{ backgroundColor: pinColor }} />
                                <div className="flex flex-col items-start">
                                  <h5 className="font-extrabold text-[#6B5210] text-sm md:text-base tracking-tight leading-none">{project.title}</h5>
                                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 font-medium flex items-center gap-1">
                                    <MapPin size={11} strokeWidth={2.25} style={{ color: pinColor }} />
                                    {project.location}
                                  </p>
                                </div>
                              </div>

                              <iframe
                                title={`خريطة ${project.title}`}
                                src={project.mapEmbedUrl}
                                loading="eager"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full border-0"
                              />

                              <div className="absolute bottom-4 inset-x-4 md:inset-x-auto md:left-4 md:right-auto z-30 flex flex-col md:flex-row gap-2 md:gap-3">
                                <button
                                  onClick={() => router.push(`/projects/${project.id}`)}
                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] shadow-lg hover:shadow-[0_0_25px_rgba(184,149,62,0.4)] hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-[#B8953E]/30"
                                >
                                  <span className="text-sm font-extrabold tracking-wide">زيارة صفحة المشروع</span>
                                  <ArrowUpRight size={15} strokeWidth={2.25} />
                                </button>
                                <a
                                  href={project.mapExternalLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md text-[#6B5210] shadow-lg hover:scale-[1.02] hover:bg-white transition-transform duration-300 ring-1 ring-black/10"
                                >
                                  <ExternalLink size={15} strokeWidth={2.25} />
                                  <span className="text-sm font-extrabold tracking-wide">فتح في Google Maps</span>
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </div>

                    <div className="flex flex-col min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[460px] max-h-[70vh] rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 ring-1 ring-black/5 overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100 bg-white/60 backdrop-blur-sm">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="font-extrabold text-[#6B5210] tracking-tight text-lg">قائمة المشاريع</h4>
                          <span className="text-xs font-extrabold text-[#8B6A14] bg-[#B8953E]/10 px-3 py-1 rounded-2xl ring-1 ring-[#B8953E]/20 tracking-wide">
                            {filteredItems.length} مشروع
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-2.5">
                        {filteredItems.map((project) => {
                          const isHovered = hoveredMapId === project.id;
                          const isZoomActive = activeMapProjectId === project.id;
                          const isActive = isZoomActive;
                          const pinColor = project.rawStatus === 'completed' 
                            ? '#10b981' 
                            : project.rawStatus === 'ongoing' 
                            ? '#8B6A14' 
                            : '#0ea5e9';
                          
                          return (
                            <button
                              key={project.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/projects/${project.id}`);
                              }}
                              onMouseEnter={() => {
                                setHoveredMapId(project.id);
                                if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                                  setActiveMapProjectId(project.id);
                                }
                              }}
                              onMouseLeave={() => setHoveredMapId(null)}
                              onFocus={() => {
                                if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                                  setActiveMapProjectId(project.id);
                                }
                              }}
                              className={`w-full text-right p-2.5 md:p-3.5 rounded-2xl transition-all duration-200 flex items-center gap-2.5 md:gap-3.5 ${
                                isActive
                                  ? 'bg-gradient-to-l from-[#B8953E]/18 to-[#C9A84B]/10 border border-[#B8953E]/40 shadow-md shadow-[#8B6A14]/15 -translate-y-0.5'
                                  : isHovered 
                                  ? 'bg-gradient-to-l from-[#B8953E]/10 to-[#C9A84B]/10 border border-[#B8953E]/30 shadow-md shadow-[#8B6A14]/10 -translate-y-0.5' 
                                  : 'bg-white border border-gray-100 hover:border-[#B8953E]/20 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`relative w-10 h-10 md:w-11 md:h-11 rounded-2xl shrink-0 overflow-hidden ring-1 ${isActive ? 'ring-[#B8953E]/70' : isHovered ? 'ring-[#B8953E]/40' : 'ring-black/5'} hidden sm:block`}>
                                <img 
                                  src={project.image} 
                                  alt={project.title} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.display = 'none'; }}
                                />
                                <span 
                                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm"
                                  style={{ backgroundColor: pinColor }}
                                />
                                {isActive && (
                                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-l from-[#6B5210] via-[#8B6A14] to-[#B8953E]" />
                                )}
                              </div>

                              <div className={`relative w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-sm sm:hidden`} style={{ backgroundColor: pinColor }} />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h5 className={`font-extrabold truncate tracking-tight transition-colors text-sm md:text-base ${isActive ? 'text-[#4A380A]' : isHovered ? 'text-[#6B5210]' : 'text-gray-900'}`}>
                                    {project.title}
                                  </h5>
                                  {isActive && (
                                    <span className="shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8B6A14] shadow-[0_0_0_3px_rgba(184,149,62,0.18)] animate-pulse hidden sm:block" />
                                  )}
                                </div>
                                <div className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-500 my-1.5 font-medium">
                                  <MapPin size={11} strokeWidth={2.25} style={{ color: pinColor }} />
                                  <span className="truncate">{project.location}</span>
                                </div>
                                <span className={`hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                                  project.rawStatus === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                    : project.rawStatus === 'ongoing'
                                    ? 'bg-[#B8953E]/10 text-[#8B6A14] ring-1 ring-[#B8953E]/30'
                                    : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                              <ArrowUpRight 
                                size={isActive ? 18 : 16} 
                                strokeWidth={2.25} 
                                className={`shrink-0 transition-all duration-200 rtl:rotate-180 hidden sm:block ${isActive ? 'text-[#6B5210] -translate-x-1' : isHovered ? 'text-[#8B6A14] -translate-x-1' : 'text-gray-300'}`} 
                              />
                            </button>
                          );
                        })}
                      </div>

                      <div className="px-5 py-4 border-t border-gray-100 bg-white/70 backdrop-blur-sm">
                        <Link 
                          href="#projects" 
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className="w-full text-center block bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] py-3 rounded-2xl font-extrabold hover:shadow-[0_0_25px_rgba(184,149,62,0.3)] transition-all ring-1 ring-[#B8953E]/30 text-sm tracking-wide"
                        >
                          تصفح البطاقات
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
