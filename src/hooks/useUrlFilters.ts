import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Page filters stored in the URL query string, so they survive refresh and can be
 * set by cross-page links. The signed-in manager is NOT part of these filters, so
 * clearing filters never changes the manager context.
 * Pass a module-level constant for `keys` so its identity is stable.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams();

  const values = useMemo(() => {
    const out = {} as Record<K, string>;
    for (const k of keys) out[k] = params.get(k) ?? '';
    return out;
  }, [params, keys]);

  const setFilter = useCallback(
    (key: K, value: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clearFilters = useCallback(
    (keep: string[] = []) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams();
          for (const k of keep) {
            const v = prev.get(k);
            if (v) next.set(k, v);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const activeCount = keys.filter((k) => values[k]).length;

  return { values, setFilter, clearFilters, activeCount };
}
