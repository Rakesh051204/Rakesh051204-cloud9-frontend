import React, { useState, useEffect } from 'react';

export default function PerplexityMediaGrid({ query }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchImages = async () => {
      setLoading(true);
      try {
        // Replace this URL with your backend image search endpoint if you have one
        // Using a highly accurate fallback API geared towards wiki/encyclopedic answers
        const formattedQuery = encodeURIComponent(query);
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/media-list/${formattedQuery.replace(/\s+/g, '_')}`
        );
        
        if (response.ok) {
          const data = await response.json();
          // Extract image URLs and map them to standard fields
          const items = (data.items || []).slice(0, 5).map(img => ({
            url: img.srcset?.[0]?.src ? `https:${img.srcset[0].src}` : img.title,
            title: img.caption?.text || query
          }));
          
          if (items.length > 0) {
            setImages(items);
            setLoading(false);
            return;
          }
        }

        // Fallback to Unsplash if Wikipedia media list doesn't have direct page hits
        const fallbackRes = await fetch(
          `https://api.unsplash.com/search/photos?page=1&query=${formattedQuery}&client_id=YOUR_UNSPLASH_ACCESS_KEY`
        );
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          setImages(fbData.results.slice(0, 4).map(img => ({ url: img.urls.regular, title: img.alt_description })));
        }
      } catch (err) {
        console.error("Failed to fetch perplexity images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [query]);

  if (loading) {
    return (
      <div className="flex gap-2 animate-pulse mb-4 h-[180px]">
        <div className="w-1/3 bg-[#202022] rounded-lg"></div>
        <div className="w-1/4 bg-[#202022] rounded-lg"></div>
        <div className="w-1/4 bg-[#202022] rounded-lg"></div>
        <div className="w-1/6 bg-[#202022] rounded-lg"></div>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="w-full mb-5">
      {/* Perplexity Asymmetric Grid System */}
      <div className="grid grid-flow-col auto-cols-fr gap-2 max-h-[220px] overflow-hidden rounded-xl border border-[#2A2A2C] bg-[#19191B] p-1">
        {images.map((img, idx) => {
          // Emulate Perplexity's dynamic asymmetric look by varying spans
          let spanClass = "col-span-1 row-span-2";
          if (idx === 1) spanClass = "col-span-1 row-span-1";
          if (idx === 2) spanClass = "col-span-1 row-span-1";

          return (
            <div 
              key={idx} 
              className={`relative group overflow-hidden rounded-lg bg-[#202022] cursor-pointer transition-transform duration-300 hover:scale-[1.02] ${spanClass}`}
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover object-center transition-opacity duration-300 group-hover:opacity-80"
                loading="lazy"
              />
              {/* Sleek dark overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 flex items-end">
                <p className="text-[11px] text-[#F2F2F0]/90 truncate w-full">{img.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}