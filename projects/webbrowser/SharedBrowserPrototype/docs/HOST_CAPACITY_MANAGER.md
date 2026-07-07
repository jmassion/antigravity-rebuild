# Host Capacity Manager

Signals:
- RSS/heap, system mem, CPU load
- target count, container count
- encode time / dropped frames

Policy:
1) downgrade streams (LOD backpressure)
2) pause inactive surfaces
3) evict LRU (never evict controlled)
4) request scheduler to allocate new host

Note: authenticated session migration is hard; prefer keeping containers warm.

