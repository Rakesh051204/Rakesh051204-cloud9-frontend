// src/components/discover/DiscoverFeed.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import DiscoverSubNav from "./DiscoverSubNav";
import { fetchDiscoverPage } from "../../data/mockNewsData";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import styles from "./DiscoverFeed.module.css";

export default function DiscoverFeed() {
  const [activeTab, setActiveTab] = useState("forYou");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // avoids stale closures inside the observer callback
  const stateRef = useRef({ page, hasMore, isLoading, activeTab });
  stateRef.current = { page, hasMore, isLoading, activeTab };

  const loadPage = useCallback(async (tab, pageNum, replace = false) => {
    setIsLoading(true);
    try {
      const { items: newItems, hasMore: more } = await fetchDiscoverPage(tab, pageNum);
      setItems((prev) => (replace ? newItems : [...prev, ...newItems]));
      setHasMore(more);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // reset + fetch first page whenever tab changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadPage(activeTab, 1, true);
  }, [activeTab, loadPage]);

  const loadMore = useCallback(() => {
    const { page: currentPage, activeTab: currentTab } = stateRef.current;
    const nextPage = currentPage + 1;
    setPage(nextPage);
    loadPage(currentTab, nextPage, false);
  }, [loadPage]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, isLoading);

  return (
    <div className={styles.container}>
      <DiscoverSubNav activeTab={activeTab} onChange={setActiveTab} />

      <div className={styles.feed}>
        {items.map((item) => (
          <article key={item.id} className={styles.card}>
            <div className={styles.cardImagePlaceholder} />
            <div className={styles.cardBody}>
              <div className={styles.cardMeta}>
                <span className={styles.source}>{item.source}</span>
                <span className={styles.dot}>·</span>
                <span className={styles.timestamp}>{item.timestamp}</span>
              </div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.snippet}>{item.snippet}</p>
            </div>
          </article>
        ))}

        {isLoading && (
          <div className={styles.loadingRow}>
            <div className={styles.spinner} />
            <span>Loading more…</span>
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div className={styles.endMessage}>You're all caught up.</div>
        )}

        {/* Sentinel: IntersectionObserver watches this */}
        <div ref={sentinelRef} className={styles.sentinel} />
      </div>
    </div>
  );
}