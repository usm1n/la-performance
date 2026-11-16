# LA Performance — website

Marketing site for LA Performance (superbike tuning, Pakistan).
Plain HTML + CSS + vanilla JS (ES modules). No framework, no build step.

**Almost every change is made in one file: [`js/site.config.js`](js/site.config.js).**

## Run it

ES modules need a web server (opening `index.html` by double-click will not work).

```bash
npx serve .            # or: python -m http.server 8080  /  VS Code "Live Server"
```

Deploy: upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, cPanel…).
All paths are relative, so it also works from a sub-folder.

## 1. Folder structure

```
index.html  services.html  builds.html  build.html  dyno.html  about.html  contact.html
                          empty shells — every page is rendered from the config
css/main.css              all styling (colours/fonts arrive as CSS variables from the config)
js/
  site.config.js          ★ THE file you edit
  vendor-map.js           pinned CDN versions (three 0.165.0, gsap 3.12.5, lenis 1.1.13)
  main.js                 boot: theme → header/footer → page module
  core/util.js            helpers: placeholders, media tiles, icons, WhatsApp links
  core/motion.js          GSAP/ScrollTrigger, Lenis, reveals, counters
  core/layout.js          theme vars, SEO/JSON-LD, header, menu, footer, intro, cursor
  pages/*.js              one renderer per page (home, services, builds, build, dyno, about, contact)
  hero/hero.js            hero controller: mode selection, scroll → camera → overlays
  hero/camera-path.js     Catmull-Rom keyframe interpolation
  hero/scene3d.js         three.js renderer (GLB, Draco, lighting, auto-fit, material overrides)
  hero/backdrop.js        3D garage set behind the bike (floor, walls, LED strips, wall sign) — drawn from code
  hero/garage-props.js    3D garage objects (tool chest, workbench, tyres, dyno fan…) placed by hero.backdrop.props
  hero/silhouette.js      SVG bike fallback (used if the GLB is missing)
  hero/frames.js          image-sequence renderer (hero.mode = "frames")
  hero/dev-panel.js       "D" key camera panel (devMode)
tools/sync-seo.mjs        optional: stamps config SEO + speed hints (fonts, script preloads, first hero frame) into the HTML <head>
assets/
  instagram/              24 post/reel covers + profile avatar pulled from @la_performance_pk
  models/                 put hero-bike.glb here
  hero/                   poster.webp, optional frame sequences
```

## 2. How to change things

| I want to…                         | Edit in `js/site.config.js`                                                                 |
|------------------------------------|----------------------------------------------------------------------------------------------|
| Change the hero bike               | Replace `assets/models/hero-bike.glb`, then `hero.bike.name / year / stockHp / tunedHp`       |
| Bike faces the wrong way / too big | `hero.bike.rotation` (e.g. `[0, Math.PI / 2, 0]`), `hero.bike.scale`, `hero.bike.position`    |
| Recolour the bike                  | `hero.bike.materialOverrides` → `{ match: "Paint", color: "#111111", metalness: .4, roughness: .3 }` |
| Adjust the camera path             | `hero.cameraKeyframes` (use the **D** panel, section 3)                                       |
| Slow down / speed up the reveal    | `hero.scrollLength` (`"350vh"` → bigger = slower)                                             |
| Change hero text, callouts, timing | `hero.overlays` (`from` / `to` = scroll progress, `anchor` = 3D point for callouts)           |
| Change hero buttons                | `hero.cta`                                                                                   |
| Rim light / reflections            | `hero.lighting.rimColor / rimIntensity / envIntensity / preset`                               |
| Shadows / brightness of the render | `hero.lighting.shadows / shadowStrength / exposure / environment`                             |
| Change the scene behind the bike   | `hero.backdrop.type`: `"garage"` \| `"none"`                                                   |
| Wall sign text / position / size   | `hero.backdrop.wallText / wallSubText / signHeight / signSize`                                |
| Hero: video frames or live 3D      | `hero.mode`: `"frames"` (photoreal image sequence in `assets/hero/desktop` + `mobile`) \| `"3d"` (live model + garage set) |
| Hero frames: count / framing       | `hero.frames.count`, `hero.frames.view.desktop / mobile` → `fit`, `zoom`, `focus`, `offsetY`  |
| Hero scroll smoothness             | `hero.scrollSmoothing` (lower = floatier), `hero.frames.blend`, `hero.frames.preload`, `theme.glassBlur` (keep `false` for best frame rate) |
| Add / move / remove garage objects | `hero.backdrop.props` — one line per object: `type`, `position: [x, z]`, `rotation` (types: toolChest, workbench, tyreStack, tyreRack, oilDrum, dynoFan, shutterDoor, locker, pillar). `[]` = empty garage |
| Use a downloaded garage 3D model   | put the `.glb` in `assets/models/`, set `hero.backdrop.garageModel.url` (+ `position / rotation / scale / replaceBuiltIn`) |
| Backdrop colours, LEDs, floor      | `hero.backdrop.accentColor / wallColor / floorColor / floorGloss / floorReflection / glow / showBay / showChecker / lightStrips / fog` |
| Switch hero mode                   | `hero.mode`: `"3d"` \| `"frames"` \| `"image"`                                                 |
| Change colours                     | `theme.colors.bg / surface / accent / text / muted`                                          |
| Change fonts                       | `theme.fonts.display / body` (any Google Fonts family name)                                  |
| Turn off checkered texture         | `theme.showCheckeredAccents: false`                                                          |
| Edit prices                        | `services[n].priceFrom` (empty = "Contact for quote")                                        |
| Add a service                      | add an object to `services` (it also appears in the booking form dropdown)                   |
| Add a build                        | add an object to `builds` → card + `build.html?slug=<slug>` page appear automatically         |
| Choose the featured build          | `home.featured.buildSlug`                                                                    |
| Add a dyno row                     | add an object to `dyno`                                                                      |
| Add reels / testimonials / team    | add objects to `reels`, `testimonials`, `team`                                               |
| Change contact info                | `business.whatsapp / email / address / city / hours / mapEmbedUrl`                           |
| Change menu links                  | `nav`                                                                                        |
| Change any heading or button text  | `home`, `pages`, `ui`, `form`                                                                |
| Add the real logo                  | save `assets/logo.svg`, set `business.logo: "assets/logo.svg"`                               |
| SEO title/description/share image  | `seo`, then run `node tools/sync-seo.mjs`                                                    |
| Keep fast start after bigger edits | after changing `theme.fonts`, `hero.mode`, `hero.frames` or adding a JS file: run `node tools/sync-seo.mjs` (site works without it, just starts slower) |
| Go live (hide placeholders + dev tools) | `devMode: false`                                                                        |

**Placeholders:** any value written `"[PLACEHOLDER: …]"` is highlighted yellow while `devMode: true`
and hidden (or replaced by a safe fallback) when `devMode: false`.

## 3. Swapping the hero bike

The current `assets/models/hero-bike.glb` (9.05 MB) was made from the Sketchfab download
(`source/10211.glb`, 34.7 MB) with:

```bash
npx @gltf-transform/cli dedup 10211.glb a.glb
npx @gltf-transform/cli prune a.glb b.glb
npx @gltf-transform/cli weld b.glb c.glb
npx @gltf-transform/cli meshopt c.glb hero-bike.glb --level high
```

(Full geometry, no simplification → 9.05 MB. To go smaller add
`simplify c.glb d.glb --ratio 0.6 --error 0.0005` before the last step → 8.6 MB.)

Notes on this particular model:
- Draco encoding crashes on it, so it is **Meshopt**-compressed instead (the loader supports both).
- It is a game export with scrambled material slots: the colour slot holds dirt masks (lime green
  as-is) and the real photo textures sit in the specular slot. `hero.bike.materialOverrides` repairs
  this: painted panels get flat colours with clear coat, and engine / frame / exhaust / tyres /
  cockpit / seat get their real texture back with `colorFromSpecularMap: true`.
- Realism also comes from `hero.lighting`: `environment: "studio"` (softbox reflections),
  `shadows`, `shadowStrength`, `exposure`.
- Its nose points to −Z, hence `hero.bike.rotation: [0, Math.PI, 0]`.

If the GLB is ever missing, the hero falls back to an SVG silhouette with the same scroll zoom.

### a) Get a GLB

Model: <https://sketchfab.com/3d-models/bmw-s1000rr-e415aa2791824238bc8c2d7e27c88c21> (≈259k triangles).
Log in to Sketchfab → **Download 3D model**.

**Easiest:** pick the *autoconverted* **glTF / GLB** format if offered, then compress:

```bash
npx @gltf-transform/cli optimize downloaded.glb assets/models/hero-bike.glb \
    --compress draco --texture-compress webp --texture-size 2048
```

**From FBX / OBJ / BLEND / DAE (Blender):**

1. Blender → *File → Import* (FBX/OBJ/DAE) or open the `.blend`.
2. Delete cameras, lights, ground planes. Apply transforms (*Ctrl+A → All Transforms*).
3. *File → Export → glTF 2.0 (.glb/.gltf)*:
   Format **glTF Binary (.glb)** · Include *Selected Objects* (if you selected the bike) ·
   Transform *+Y Up* on · Geometry → *Compression* on (Draco, level 6) ·
   Material → Images *WebP* (or JPEG), quality ~80.
4. Save as `assets/models/hero-bike.glb`.

**Target: under ~8 MB.** If it is bigger: reduce textures (`--texture-size 1024`) or simplify
(`npx @gltf-transform/cli simplify in.glb out.glb --ratio 0.5`).

Quick preview of any GLB without touching the config (devMode only):
`index.html?model=path/or/url/to/file.glb`

### b) Update the config

`hero.bike` → `name`, `year`, `stockHp`, `tunedHp`. Add the model's attribution to `credits.model`
if its licence requires it (CC-BY does — check the licence on the Sketchfab page).

### c) Check the fit

The model is auto-normalised on load: centred, wheels on the ground (`y = 0`), length scaled to
`hero.bike.fitLength` metres, **nose expected at +Z**. With `devMode: true` open the browser
console → group **"[hero] model auto-fit"** shows raw size, applied scale, normalised bounds and
a warning if the bike lies along the wrong axis (fix with `hero.bike.rotation`).

### d) Find mesh / material names (for `materialOverrides`)

Same console group prints a table of every **mesh name + material name** in the model.
Use any part of a name as `match` (case-insensitive):

```js
materialOverrides: [
  { match: "paint", color: "#111111", metalness: 0.4, roughness: 0.3 },
  { match: "caliper", color: "#E10600" },
]
```

Options: `color`, `emissive`, `metalness`, `roughness`, `clearcoat`, `opacity`, `keepTexture: true`
(by default a recoloured material drops its colour texture so the new colour shows).
The first matching line wins. If a model renders in one wrong tint, also try
`hero.bike.ignoreVertexColors: true`.
In Blender the same names are in the Outliner (meshes) and Material tab.

### e) Tune the camera with the D panel

1. Open the homepage with `devMode: true`, press **D**.
2. Scroll to the moment you want to change — the panel shows progress, position, lookAt, fov.
3. Tick **Free cam**, drag to orbit / wheel to zoom / right-drag to pan until the shot looks right.
4. **Copy keyframe** → paste the line into `hero.cameraKeyframes` (keep them ordered by `at`).
5. Untick Free cam, reload, scroll to check. Callout `anchor` points use the same coordinates.

Coordinates: metres, `+Z` towards the nose, `+Y` up, `+X` the bike's left side; origin on the
ground under the centre of the bike.

## 4. Still to provide

### Placeholders in `js/site.config.js`

| Field | What is needed |
|---|---|
| `business.city`, `business.address` | workshop location |
| `business.whatsapp` | number with country code, digits only (until set, WhatsApp buttons open Instagram DM and the form opens WhatsApp without a recipient) |
| `business.email`, `business.hours`, `business.mapEmbedUrl` | contact details, Google Maps embed `src` |
| `hero.bike.tunedHp` | number — the HP counter then counts stock → tuned |
| `stats[2].value` | number of bikes tuned |
| `services[*].turnaround`, `services[*].priceFrom` | turnaround text, optional prices |
| `builds[turbo-r6]` | `year`, full parts list, tuned torque, dyno credit. `stock` 117 hp / 62 Nm is the Yamaha factory claim — confirm |
| `builds[yamaha-r1]`, `[kawasaki-zx10r]`, `[gsxr-nemesis]` | stock/tuned HP & torque, parts lists, ZX-10R year + story, credits |
| `dyno[1..3]` | crank HP, wheel HP, gain % |
| `testimonials[*]` | quote, name, bike |
| `team[0].photo`, `team[1]` | photo, second team member (or delete the entry) |
| `about.story[2]`, `about.dynoPartner.description` | rest of the story, dyno partner blurb |
| `seo.siteUrl` | live URL (then run `node tools/sync-seo.mjs`) |
| `credits.model` | 3D model attribution |

### Asset files

| Path | Format / size | Purpose |
|---|---|---|
| `assets/models/hero-bike.glb` | compressed GLB, ~8 MB | hero 3D bike — **done** (9.05 MB) |
| `assets/hero/poster.webp` | WebP 1920×1080, < 200 kB, side-profile render | shown while the model loads, and for reduced-motion / no-WebGL visitors (silhouette is used until it exists) |
| `assets/logo.svg` | SVG (or PNG 512×512 transparent) | header/footer logo; then set `business.logo` |
| `assets/og-image.jpg` | JPG 1200×630, < 300 kB | link preview image (WhatsApp/Instagram/Facebook) |
| `assets/team/*.jpg` | JPG 800×1000 | team photos |
| `assets/hero/desktop/frame_0001.webp …` | WebP 1920×1080 ×150 | only if you use `hero.mode: "frames"` |
| `assets/hero/mobile/frame_0001.webp …` | WebP 720×1280 ×150 | only if you use `hero.mode: "frames"` |

### Instagram media (already downloaded)

`assets/instagram/ig-NN-<p|reel>-<code>.jpg` — covers of all 24 grid posts (max 1080 px) and
`profile-avatar.jpg` (150 px — too small for a logo; export the original badge for `assets/logo.svg`).
Reels are saved as cover images only; tiles link to the reel on Instagram.

Five of the grid posts are **collab posts owned by other accounts** — get their OK before launch or swap them:
`ig-09`, `ig-10` (@dr.hasanrajpoot — `ig-10` is the Turbo R6 "HP-185" cover used as the featured image),
`ig-15` (@mahirlodhi9), `ig-21`, `ig-22` (@shahab_lodhi).

## Notes

- **SEO / link previews:** meta tags and LocalBusiness JSON-LD are generated from `seo` at runtime.
  WhatsApp/Facebook crawlers do not run JavaScript, so `node tools/sync-seo.mjs` copies the same
  values into each HTML `<head>`. Run it after editing `seo`.
- **Hero fallbacks:** no GLB → SVG silhouette with the same scroll zoom · no WebGL or
  `prefers-reduced-motion` → static poster + headline + buttons · frames missing → silhouette.
- **Booking form:** nothing is sent to a server; submit opens `wa.me/<whatsapp>` with the details pre-filled.
- **Library versions** are pinned in `js/vendor-map.js`.
