# Alvantix AutoHub 3D — Phase 1

A production-oriented Next.js + React Three Fiber automotive experience using the supplied LaFerrari GLB.

## Requirements
- Node.js 20+ recommended
- npm

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Important
The project pins:
- React 19.2.0
- Three.js 0.180.0
- React Three Fiber 9.7.0
- Drei 10.7.8

`overrides.three` forces a single Three.js version to avoid duplicate Three.js instances.

## Model
The supplied GLB is at:

`public/models/ferrari/ferrari_laferrari.glb`

The model contains many separate meshes, so the scene classifies visible meshes into Body, Wheel, Brake, Headlight, Engine and Interior interaction zones.

## Phase 1 features
- Cinematic dark automotive presentation
- HDR studio environment
- PBR GLB rendering
- Shadows and contact shadow
- Smooth orbit controls
- Slow automatic vehicle rotation
- Click/hover part classification
- Camera focus on selected component
- Technical information panel
- Responsive UI

## Next phases
1. More precise part mapping and hotspot markers
2. Exploded-view animation
3. Paint / wheel / interior configurator
4. X-ray / technical mode
5. Vehicle comparison
6. AI automotive assistant
7. Backend vehicle catalog and CMS
8. Performance LOD / compressed textures for production deployment

## Troubleshooting
If you see a WebGL context-loss warning, first close duplicate tabs/dev servers and check GPU/browser stability. This project intentionally uses one main `<Canvas>` and pins Three.js to a single version.
