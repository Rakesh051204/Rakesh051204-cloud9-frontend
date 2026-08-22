// src/hooks/useInfiniteScroll.js
import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Generic infinite scroll hook.
 * @param {Function} loadMore - async () => void, called when sentinel becomes visible
 * @param {boolean} hasMore - whether more pages exist
 * @param {boolean} isLoading - whether a load is currently in flight
 */
export function useInfiniteScroll(loadMore, hasMore, isLoading) {
  const sentinelRef = useRef(null);

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [loadMore, hasMore, isLoading]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "400px", // start loading before the user hits the literal bottom
      threshold: 0,
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return sentinelRef;
}