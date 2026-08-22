// src/services/newsService.js
// NewsAPI.org – Free 100 requests/day

const NEWS_API_KEY = '04cb67448bded345411bc34dec5e760c';

const categoryMap = {
  'all': 'general',
  'world': 'general',
  'finance': 'business',
  'health': 'health',
  'academic': 'science',
  'patents': 'technology',
};

// ----- MOCK DATA (fallback if API fails) -----
const MOCK_ARTICLES = [
  {
    id: 'm1',
    category: 'world',
    title: "Global AI Summit concludes with landmark agreement",
    description: "World leaders agree on first international framework for AI safety and development.",
    source: "Reuters",
    time: new Date().toLocaleString(),
    sources: 45,
    image: "https://picsum.photos/seed/ai-summit/400/200",
  },
  {
    id: 'm2',
    category: 'world',
    title: "India's economy grows 8.2% in Q4 2025",
    description: "India remains the fastest-growing major economy, driven by strong manufacturing and services sector performance.",
    source: "Economic Times",
    time: new Date().toLocaleString(),
    sources: 23,
    image: "https://picsum.photos/seed/india-economy/400/200",
  },
  {
    id: 'm3',
    category: 'finance',
    title: "Sensex hits all-time high of 75,000",
    description: "Indian stock markets rally on strong FII inflows and positive global cues.",
    source: "Bloomberg",
    time: new Date().toLocaleString(),
    sources: 34,
    image: "https://picsum.photos/seed/sensex/400/200",
  },
  {
    id: 'm4',
    category: 'health',
    title: "AI breakthrough in early-stage cancer detection",
    description: "A new deep learning model detects early-stage cancer with 95% accuracy.",
    source: "Nature Medicine",
    time: new Date().toLocaleString(),
    sources: 67,
    image: "https://picsum.photos/seed/cancer/400/200",
  },
  {
    id: 'm5',
    category: 'academic',
    title: "MIT researchers achieve quantum computing breakthrough",
    description: "Scientists at MIT have achieved a major milestone in quantum computing.",
    source: "MIT News",
    time: new Date().toLocaleString(),
    sources: 15,
    image: "https://picsum.photos/seed/quantum/400/200",
  },
  {
    id: 'm6',
    category: 'patents',
    title: "Tesla patents solid-state battery with 500-mile range",
    description: "Tesla's new battery patent promises longer range, faster charging, and improved safety.",
    source: "Electrek",
    time: new Date().toLocaleString(),
    sources: 23,
    image: "https://picsum.photos/seed/tesla/400/200",
  },
  {
    id: 'm7',
    category: 'world',
    title: "Google makes AI coding strike team permanent",
    description: "The restructuring broadens the team's mandate beyond coding tools to include training underlying models.",
    source: "TechCrunch",
    time: new Date().toLocaleString(),
    sources: 50,
    image: "https://picsum.photos/seed/google-ai/400/200",
  },
  {
    id: 'm8',
    category: 'finance',
    title: "Bitcoin rebounds to $60,206 after market sell-off",
    description: "Cryptocurrency markets show signs of recovery after a week of significant volatility.",
    source: "CoinDesk",
    time: new Date().toLocaleString(),
    sources: 31,
    image: "https://picsum.photos/seed/bitcoin/400/200",
  },
];

// ----- FETCH REAL NEWS -----
export const getNewsByCategory = async (category = 'all') => {
  try {
    const apiCategory = categoryMap[category] || 'general';
    const url = `https://newsapi.org/v2/top-headlines?country=in&category=${apiCategory}&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    const data = await res.json();
    
    if (data.articles && data.articles.length > 0) {
      return data.articles
        .filter(article => article.title && article.title !== '[Removed]')
        .map(article => ({
          id: article.url || Math.random().toString(36),
          title: article.title || 'No title',
          description: article.description || 'No description',
          source: article.source?.name || 'News',
          time: new Date(article.publishedAt).toLocaleString(),
          image: article.urlToImage || null,
          sources: Math.floor(Math.random() * 50) + 5,
          category: category,
        }));
    }
    return getFallbackArticles(category);
  } catch (error) {
    console.error('Error fetching news from API, using fallback:', error);
    return getFallbackArticles(category);
  }
};

// ----- FALLBACK (mock data) -----
export const getFallbackArticles = (category = 'all') => {
  if (category === 'all') return MOCK_ARTICLES;
  return MOCK_ARTICLES.filter(a => a.category === category);
};

// ----- GET ALL CATEGORIES -----
export const getAllNews = async () => {
  try {
    const categories = ['world', 'finance', 'health', 'academic', 'patents'];
    const allArticles = [];
    for (const cat of categories) {
      const articles = await getNewsByCategory(cat);
      allArticles.push(...articles.slice(0, 4));
    }
    // Remove duplicates by title
    const unique = allArticles.filter((v, i, a) => 
      a.findIndex(t => t.title === v.title) === i
    );
    return unique.length > 0 ? unique : MOCK_ARTICLES;
  } catch (error) {
    console.error('Error in getAllNews:', error);
    return MOCK_ARTICLES;
  }
};

// ----- BACKWARD COMPATIBILITY -----
export const getIndianNews = getNewsByCategory;
export const getGlobalNews = getNewsByCategory;