# Client Performance + LOD (Textures, VRAM, Bandwidth)

## LOD ladder
- LOD0 Active: live video, interactive, high res
- LOD1 Near: lower res/fps
- LOD2 Far: thumbnail refresh (1–30s)
- LOD3 Dormant: no updates, dispose textures

## LOD triggers
- distance, projected size, occlusion, focus, pinning, device profile

## VRAM budgeting
Approx RGBA8 bytes = w*h*4
- 1280x720 ≈ 3.5MB
- 640x360 ≈ 0.9MB
Maintain a texture budget (mobile smaller) and downgrade LOD when exceeded.

## Bandwidth budgeting
Throttle fps/res per surface; pause occluded surfaces.

