import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Clock, MapPin, Cloud, CloudRain, CloudSnow,
  CloudLightning, Sun, CloudSun, ChevronDown, Cpu, DollarSign, Palette,
  Trophy, Film, Heart, MoreHorizontal, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3001';

// ─── Weather code → icon/label (Open-Meteo WMO codes) ─────────────
function weatherInfo(code) {
  if (code === 0) return { Icon: Sun, label: 'Clear sky' };
  if (code <= 2) return { Icon: CloudSun, label: 'Partly cloudy' };
  if (code <= 3) return { Icon: Cloud, label: 'Overcast' };
  if (code >= 51 && code <= 67) return { Icon: CloudRain, label: 'Rain' };
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, label: 'Snow' };
  if (code >= 80 && code <= 82) return { Icon: CloudRain, label: 'Showers' };
  if (code >= 95) return { Icon: CloudLightning, label: 'Thunderstorm' };
  return { Icon: Cloud, label: 'Cloudy' };
}

// ─── Weather widget (corner card) ──────────────────────────────────
function WeatherWidget() {
  const [status, setStatus] = useState('idle'); // idle | loading | denied | error | ready
  const [data, setData] = useState(null);
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`${API_BASE}/discover/weather?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error('weather fetch failed');
          const json = await res.json();
          setData(json);
          setStatus('ready');
          // Best-effort reverse geocode via Open-Meteo's free geocoding API
          try {
            const geoRes = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1`
            );
            const geoJson = await geoRes.json();
            setCityName(geoJson?.results?.[0]?.name || '');
          } catch {}
        } catch (e) {
          setStatus('error');
        }
      },
      () => setStatus('denied'),
      { timeout: 8000 }
    );
  }, []);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 text-sm text-gray-500">
        Getting your local weather…
      </div>
    );
  }

  if (status === 'denied' || status === 'error' || !data) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 text-sm text-gray-500 flex items-center gap-2">
        <MapPin size={14} />
        Enable location to see local weather
      </div>
    );
  }

  const { Icon, label } = weatherInfo(data.current.weatherCode);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={12} />
          {cityName || 'Your location'}
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <Icon size={30} className="text-[#7C83DB]" />
        <div className="text-2xl font-medium text-[#F0EEE6]">
          {Math.round(data.current.temp)}°
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 mt-4">
        {data.daily.map((d) => {
          const { Icon: DayIcon } = weatherInfo(d.weatherCode);
          const day = new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' });
          return (
            <div key={d.date} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500">{day}</span>
              <DayIcon size={14} className="text-gray-400" />
              <span className="text-[10px] text-gray-400">{Math.round(d.max)}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Markets widget ─────────────────────────────────────────────────
function MarketsWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/discover/markets`);
        const json = await res.json();
        if (!cancelled) setItems(json.items || []);
      } catch (e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000); // refresh every minute
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
      <div className="text-sm font-medium text-gray-300 mb-3">Market Outlook</div>
      {loading && <div className="text-sm text-gray-500">Loading markets…</div>}
      {!loading && items.length === 0 && (
        <div className="text-sm text-gray-500">Markets unavailable right now.</div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {items.map((m) => {
          const up = m.changePct >= 0;
          return (
            <div key={m.symbol} className="bg-[#111111] rounded-xl p-3">
              <div className="text-xs text-gray-400 truncate">{m.name}</div>
              <div className="text-[13.5px] text-[#F0EEE6] font-medium mt-0.5">
                {m.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-1 text-[11px] mt-1 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {up ? '+' : ''}{m.changePct?.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Article card (hero variant: big image, full-width) ────────────
function ArticleCardHero({ title, meta, time, summary, image, url, sourceCount, liked, onToggleLike, onOpenMenu }) {
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-white/20 rounded-2xl overflow-hidden transition-colors">
      <button onClick={handleClick} className="w-full text-left block">
        {image && (
          <img
            src={image}
            alt=""
            className="w-full h-[260px] object-cover bg-[#111111]"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className="p-4">
          <div className="text-[19px] text-[#F0EEE6] font-medium leading-snug mb-2">{title}</div>
          <div className="text-[14px] text-gray-400 leading-relaxed mb-3">{summary}</div>
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            <Clock size={12} /> {time}
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between px-4 pb-4">
        <SourcesPill meta={meta} sourceCount={sourceCount} />
        <div className="flex items-center gap-3 text-gray-500">
          <button onClick={onToggleLike} aria-label="Save">
            <Heart size={15} className={liked ? 'fill-[#E8A33D] text-[#E8A33D]' : ''} />
          </button>
          <button onClick={onOpenMenu} aria-label="More">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Article card (grid variant: compact, image-on-top, used 3-across) ──
function ArticleCardGrid({ title, meta, time, summary, image, url, sourceCount, liked, onToggleLike, onOpenMenu }) {
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-white/20 rounded-2xl overflow-hidden transition-colors flex flex-col">
      <button onClick={handleClick} className="w-full text-left block">
        {image && (
          <img
            src={image}
            alt=""
            className="w-full h-[130px] object-cover bg-[#111111]"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className="p-3.5">
          <div className="text-[14px] text-[#F0EEE6] font-medium leading-snug mb-1.5 line-clamp-2">{title}</div>
        </div>
      </button>
      <div className="flex items-center justify-between px-3.5 pb-3.5 mt-auto">
        <SourcesPill meta={meta} sourceCount={sourceCount} compact />
        <div className="flex items-center gap-2.5 text-gray-500">
          <button onClick={onToggleLike} aria-label="Save">
            <Heart size={13} className={liked ? 'fill-[#E8A33D] text-[#E8A33D]' : ''} />
          </button>
          <button onClick={onOpenMenu} aria-label="More">
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// small helper: "43 sources" style pill. Falls back to plain source name
// if the backend hasn't supplied a clustered sourceCount yet.
function SourcesPill({ meta, sourceCount, compact }) {
  return (
    <div className={`flex items-center gap-1.5 text-gray-500 ${compact ? 'text-[11px]' : 'text-[12.5px]'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D]/70" />
      {sourceCount ? `${sourceCount} sources` : meta}
    </div>
  );
}

// ─── Topic categories (for the Topics dropdown) ─────────────────────
const TOPIC_CATEGORIES = [
  { id: 'tech',          label: 'Tech & Science',  Icon: Cpu },
  { id: 'business',      label: 'Business',        Icon: DollarSign },
  { id: 'arts',          label: 'Arts & Culture',  Icon: Palette },
  { id: 'sports',        label: 'Sports',          Icon: Trophy },
  { id: 'entertainment', label: 'Entertainment',   Icon: Film },
];

// ─── Time range options ──────────────────────────────────────────────
const RANGE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'week',  label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year',  label: 'This Year' },
];

async function fetchNewsPage(tab, page, category, range) {
  try {
    const params = new URLSearchParams({ tab, page });
    if (category) params.set('category', category);
    if (range) params.set('range', range);
    const res = await fetch(`${API_BASE}/discover/news?${params.toString()}`);
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    return { items: data.items || [], hasMore: !!data.hasMore };
  } catch (e) {
    console.error('News fetch error:', e);
    return { items: [], hasMore: false };
  }
}

function useInfiniteScroll(loadMore, hasMore, isLoading) {
  const sentinelRef = useRef(null);
  const handleIntersect = useCallback(
    ([entry]) => {
      if (entry.isIntersecting && hasMore && !isLoading) loadMore();
    },
    [loadMore, hasMore, isLoading]
  );
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '400px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [handleIntersect]);
  return sentinelRef;
}

const SUB_TABS = [
  { id: 'forYou', label: 'For You' },
  { id: 'top', label: 'Top' },
  { id: 'topics', label: 'Topics' },
];

function NewsFeed() {
  const [activeSubTab, setActiveSubTab] = useState('forYou');
  const [activeCategory, setActiveCategory] = useState(null); // e.g. 'business'
  const [activeRange, setActiveRange] = useState('today'); // today | week | month | year
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const dropdownRef = useRef(null);
  const stateRef = useRef({ page, activeSubTab, activeCategory, activeRange });
  stateRef.current = { page, activeSubTab, activeCategory, activeRange };
  const staleStreakRef = useRef(0); // counts consecutive "no new items" pages

  const loadPage = useCallback(async (tab, pageNum, category, range, replace = false) => {
    setIsLoading(true);
    setError(false);
    try {
      const { items: newItems, hasMore: more } = await fetchNewsPage(tab, pageNum, category, range);

      if (replace && newItems.length === 0) setError(true);

      setItems((prev) => {
        const base = replace ? [] : prev;
        const existingIds = new Set(base.map((i) => i.id));
        const deduped = newItems.filter((i) => !existingIds.has(i.id));

        // if the backend keeps saying hasMore but sends nothing genuinely new,
        // stop asking after 2 consecutive empty/duplicate pages instead of
        // looping forever (this is what caused scrolling to feel "stuck")
        if (!replace) {
          if (deduped.length === 0) {
            staleStreakRef.current += 1;
          } else {
            staleStreakRef.current = 0;
          }
          if (staleStreakRef.current >= 2) setHasMore(false);
        } else {
          staleStreakRef.current = 0;
        }

        return [...base, ...deduped];
      });

      if (replace) setHasMore(more);
      else if (staleStreakRef.current < 2) setHasMore(more);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // refetch whenever the tab, topic category, OR time range changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadPage(activeSubTab, 1, activeCategory, activeRange, true);
  }, [activeSubTab, activeCategory, activeRange, loadPage]);

  // close the Topics dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setTopicsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadMore = useCallback(() => {
    const { page: currentPage, activeSubTab: currentTab, activeCategory: currentCategory, activeRange: currentRange } = stateRef.current;
    const nextPage = currentPage + 1;
    setPage(nextPage);
    loadPage(currentTab, nextPage, currentCategory, currentRange, false);
  }, [loadPage]);

  function toggleLike(id) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // group items into a Perplexity-style rhythm: 1 hero, then 3 in a row, repeat
  function renderFeedGroups() {
    const groups = [];
    let i = 0;
    let groupIndex = 0;
    while (i < items.length) {
      if (groupIndex % 2 === 0) {
        // hero: single big card
        const item = items[i];
        groups.push(
          <ArticleCardHero
            key={item.id}
            title={item.title}
            meta={item.source}
            time={item.time}
            summary={item.summary}
            image={item.image}
            url={item.url}
            sourceCount={item.sourceCount}
            liked={likedIds.has(item.id)}
            onToggleLike={() => toggleLike(item.id)}
            onOpenMenu={() => {}}
          />
        );
        i += 1;
      } else {
        // grid row: up to 3 compact cards
        const slice = items.slice(i, i + 3);
        groups.push(
          <div key={`grid-${i}`} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {slice.map((item) => (
              <ArticleCardGrid
                key={item.id}
                title={item.title}
                meta={item.source}
                time={item.time}
                summary={item.summary}
                image={item.image}
                url={item.url}
                sourceCount={item.sourceCount}
                liked={likedIds.has(item.id)}
                onToggleLike={() => toggleLike(item.id)}
                onOpenMenu={() => {}}
              />
            ))}
          </div>
        );
        i += slice.length;
      }
      groupIndex += 1;
    }
    return groups;
  }

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, isLoading);

  function handleTabClick(tabId) {
    if (tabId === 'topics') {
      setTopicsOpen((v) => !v);
      setActiveSubTab('topics');
    } else {
      setActiveSubTab(tabId);
      setActiveCategory(null);
      setTopicsOpen(false);
    }
  }

  function handleCategoryPick(categoryId) {
    setActiveSubTab('topics');
    setActiveCategory(categoryId);
    setTopicsOpen(false);
  }

  const activeCategoryLabel = TOPIC_CATEGORIES.find((c) => c.id === activeCategory)?.label;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b border-[#2a2a2a]">
        <div className="flex gap-4 relative">
          {SUB_TABS.map((t) => (
            <div key={t.id} className="relative" ref={t.id === 'topics' ? dropdownRef : null}>
              <button
                onClick={() => handleTabClick(t.id)}
                className={`flex items-center gap-1 text-[13px] pb-2.5 border-b-2 -mb-px transition-colors ${
                  activeSubTab === t.id
                    ? 'border-[#7C83DB] text-[#F0EEE6]'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {t.id === 'topics' && activeCategoryLabel ? activeCategoryLabel : t.label}
                {t.id === 'topics' && (
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${topicsOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {t.id === 'topics' && topicsOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1.5 shadow-xl z-30">
                  {TOPIC_CATEGORIES.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleCategoryPick(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left transition-colors ${
                        activeCategory === id
                          ? 'bg-[#7C83DB]/15 text-[#F0EEE6]'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon size={15} className={activeCategory === id ? 'text-[#7C83DB]' : 'text-gray-500'} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ███ TIME RANGE FILTER ███ */}
      <div className="flex gap-2 mb-4">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRange(r.id)}
            className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
              activeRange === r.id
                ? 'border-[#7C83DB] text-[#F0EEE6] bg-[#7C83DB]/10'
                : 'border-[#2a2a2a] text-gray-500 hover:text-gray-300'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {error && items.length === 0 && !isLoading && (
          <div className="text-center py-10 text-gray-500 text-sm">
            Couldn't load news right now. Check that your backend is running and GNEWS_API_KEY is set.
          </div>
        )}

        {renderFeedGroups()}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-[#2a2a2a] border-t-[#7C83DB] rounded-full animate-spin" />
            Loading more…
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div className="text-center py-6 text-gray-600 text-sm">You're all caught up.</div>
        )}

        <div ref={sentinelRef} className="h-px" />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────
export default function Discover() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-white/30 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#F0EEE6]">Discover</h1>
          <p className="text-sm text-gray-500 mt-1">Live news, weather, and markets — all in one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <NewsFeed />

        <div className="space-y-4 lg:sticky lg:top-6">
          <WeatherWidget />
          <MarketsWidget />
        </div>
      </div>
    </div>
  );
}