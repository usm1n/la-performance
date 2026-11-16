/* ==========================================================================
   LA PERFORMANCE — SITE CONFIG
   --------------------------------------------------------------------------
   This is the ONE file you edit to change the site. Every page reads its
   text, lists, images, colours and links from here.

   RULES
   - Paths are relative to the site root, e.g. "assets/instagram/photo.jpg".
     (A leading "/" is also accepted and is stripped automatically.)
   - Anything written as "[PLACEHOLDER: ...]" still needs a real value.
     With devMode = true it is highlighted in yellow on the page.
     With devMode = false it is hidden (or a safe fallback is used).
   - Lists (services, builds, dyno, reels, testimonials, team, nav ...) are
     arrays: add an object to the array and it appears on the site.
   - An image path that is empty or fails to load shows a dark labelled
     placeholder tile instead of a broken image.
   ========================================================================== */

const config = {
  /* devMode: true  → placeholders highlighted, hero "D" camera panel enabled,
                      model fit values + mesh/material names logged to console.
              false → production: placeholders hidden, no dev tools. */
  devMode: false,

  /* ------------------------------------------------------------------ */
  /* BUSINESS — name, taglines and contact details                       */
  /* ------------------------------------------------------------------ */
  business: {
    name: "LA Performance",              // shown in header, footer, SEO
    logoAccent: "LA",                    // the part of the name drawn in the accent colour (text logo)
    logo: "",                            // path to a logo image, e.g. "assets/logo.svg". Empty = text logo
    tagline: "Proven on the road.",      // main tagline (footer, SEO fallback)
    taglines: ["Tuned. Tested. Proven.", "Numbers don't lie."], // secondary taglines (marquee strip, footer)
    bio: "Superbike Performance & Tuning | ECU Tuning | Mods | Performance Testing | Proven on the road! | DM for enquiries.", // Instagram bio, used on About + footer
    founder: "Shahab Lodhi",             // used in About + JSON-LD
    city: "[PLACEHOLDER: city, e.g. Islamabad]",
    country: "Pakistan",
    countryCode: "92",                   // phone country code without "+", used to normalise WhatsApp numbers
    address: "[PLACEHOLDER: workshop street address]",
    whatsapp: "[PLACEHOLDER: WhatsApp number with country code, e.g. 923001234567]", // digits only. While empty, WhatsApp buttons fall back to Instagram DM
    email: "[PLACEHOLDER: contact email]",
    hours: "[PLACEHOLDER: opening hours, e.g. Mon–Sat 11:00–20:00]",
    mapEmbedUrl: "[PLACEHOLDER: Google Maps embed URL (Share → Embed a map → copy the src=\"...\" value)]",
  },

  /* SOCIALS — full URLs. Empty string = icon is not shown. */
  socials: {
    instagram: "https://www.instagram.com/la_performance_pk/",
    facebook: "",
    youtube: "",
    tiktok: "",
  },

  /* ------------------------------------------------------------------ */
  /* THEME — applied as CSS custom properties at load                    */
  /* ------------------------------------------------------------------ */
  theme: {
    colors: {
      bg: "#0B0B0D",        // page background            → --color-bg
      surface: "#141418",   // cards / panels             → --color-surface
      accent: "#E10600",    // brand red: lines, buttons  → --color-accent
      text: "#FFFFFF",      // main text                  → --color-text
      muted: "#8A8A93",     // secondary text             → --color-muted
    },
    fonts: {
      display: "Anton",     // headings. Any Google Fonts family name
      body: "Inter",        // body text. Any Google Fonts family name
      loadFromGoogle: true, // false = you self-host the fonts in css/main.css
    },
    showCheckeredAccents: true, // true | false — subtle checkered-flag texture on dividers/footer
    glassBlur: false,           // true = frosted-glass blur behind the header and labels (prettier, but halves the hero frame rate on laptops/phones with weak graphics) | false = plain dark bar, smooth scrolling
    displaySkew: -7,            // degrees of italic skew on display headings (0 = upright)
  },

  /* NAV — header + mobile menu + footer links. Add/remove/reorder freely. */
  nav: [
    { label: "Services", href: "services.html" },
    { label: "Builds", href: "builds.html" },
    { label: "Dyno", href: "dyno.html" },
    { label: "About", href: "about.html" },
    { label: "Contact", href: "contact.html" },
  ],

  /* UI — small labels and button texts used across the site */
  ui: {
    bookCta: "Book a tune",                 // header button + CTA buttons
    bookHref: "contact.html",               // where "Book" buttons go
    whatsappLabel: "Chat on WhatsApp",      // floating button label (accessible name + tooltip)
    whatsappPrefill: "Hi LA Performance, I'd like to ask about tuning my bike.", // pre-filled text for the floating button
    menuOpen: "Open menu",
    menuClose: "Close menu",
    skipToContent: "Skip to content",
    scrollHint: "Scroll",
    loading: "Loading",
    stock: "Stock",
    tuned: "Tuned",
    hp: "HP",
    torqueUnit: "Nm",
    crank: "Crank",
    wheel: "Wheel",
    gain: "Gain",
    contactForQuote: "Contact for quote",   // shown when a service has no priceFrom
    priceFromPrefix: "From",
    viewBuild: "View build",
    viewAll: "View all",
    learnMore: "Details",
    watchOnInstagram: "Watch on Instagram",
    all: "All",                             // "all brands" filter button on builds page
    prev: "Previous",
    next: "Next",
    close: "Close",
    notFound: "That build could not be found.",
    backToBuilds: "Back to all builds",
    footerNote: "Performance work is intended for track and closed-road use. Ride responsibly.",
    rights: "All rights reserved.",
  },

  /* ------------------------------------------------------------------ */
  /* HERO — scroll-driven 3D bike reveal                                 */
  /* ------------------------------------------------------------------ */
  hero: {
    /* mode: "3d"     → live three.js model (falls back automatically:
                         model file missing → SVG silhouette with the same scroll zoom,
                         no WebGL / reduced motion → "image")
             "frames" → pre-rendered image sequence (see hero.frames)
             "image"  → static poster, no scroll animation */
    mode: "frames",
    scrollSmoothing: 0.08,          // how quickly the hero catches up with the scroll: 0.05 = very floaty … 0.14 = snappy … 1 = no easing

    bike: {
      name: "Yamaha YZF-R1",       // bike shown in the hero video frames ("BMW S1000RR" is the 3D model for mode "3d")
      year: "[PLACEHOLDER: hero bike model year]",
      modelUrl: "assets/models/hero-bike.glb",   // swap this file to change the bike
      modelSourceUrl: "https://sketchfab.com/3d-models/bmw-s1000rr-e415aa2791824238bc8c2d7e27c88c21",
      /* Auto-fit: the model is centred, dropped onto the ground (y = 0) and scaled
         so its length = fitLength metres, with the NOSE pointing towards +Z.
         If the nose points the wrong way, turn it with `rotation`. */
      fitLength: 2.05,              // metres, nose-to-tail after auto-fit
      scale: 1,                     // extra multiplier applied after auto-fit
      rotation: [0, Math.PI, 0],    // radians [x, y, z]. e.g. [0, Math.PI / 2, 0] to turn the bike 90°. This model's nose points to -Z, so it is turned 180°
      ignoreVertexColors: true,     // true = ignore colour data baked into the mesh (fixes models that render in one wrong tint, e.g. all green)
      position: [0, 0, 0],          // metres offset after auto-fit
      /* Recolour parts without editing the model.
         match: part of a material OR mesh name (case-insensitive). FIRST matching line wins, so put specific names above general ones.
         color / emissive: hex. metalness / roughness / clearcoat: 0–1. opacity: 0–1 (below 1 = see-through glass).
         keepTexture: true keeps the model's own colour texture under the new colour.
         colorFromSpecularMap: true restores a photo texture this model stores in the wrong slot (color then acts as a tint; "#FFFFFF" = untinted).
         clearcoatRoughness: 0–1 gloss of the lacquer. normalScale: strength of surface relief (tread, weave).
         NOTE: this model's own colour textures are dirt masks (it renders lime green without these lines),
         so every painted part is given a flat colour here. Change the colours freely. */
      materialOverrides: [
        // --- paintwork: base colour under a glossy clear coat (like real bike paint) ---
        { match: "smallspecmap [PRIMARY]",   color: "#C20A0A", metalness: 0.25, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.04 }, // main fairing colour
        { match: "smallspecmap [SECONDARY]", color: "#E9E9E6", metalness: 0.05, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.04 },  // second fairing colour
        { match: "livery",                   color: "#0B0B0D", metalness: 0.3, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.05 },   // livery panels
        { match: "vehicle_paint",            color: "#0B0B0D", metalness: 0.3, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.05 },   // remaining painted panels
        // --- parts that have a real photo texture in the model (restored from the specular slot) ---
        { match: "tyres",                    color: "#FFFFFF", colorFromSpecularMap: true, metalness: 0, roughness: 0.9, normalScale: 1.4 }, // tread + sidewall lettering
        { match: "exhaust",                  color: "#FFFFFF", colorFromSpecularMap: true, metalness: 0.9, roughness: 0.35 },
        { match: "engine",                   color: "#FFFFFF", colorFromSpecularMap: true, metalness: 0.55, roughness: 0.5 },               // engine, frame, swingarm
        { match: "bmw_m1krr_cockpit",        color: "#FFFFFF", keepTexture: true, metalness: 0, roughness: 0.6 },                           // dash
        { match: "cockpit",                  color: "#FFFFFF", colorFromSpecularMap: true, metalness: 0.2, roughness: 0.6 },                // controls, switchgear, small parts
        { match: "braided_alu",              color: "#FFFFFF", colorFromSpecularMap: true, metalness: 0.9, roughness: 0.4 },                // brake lines
        { match: "alcantara",                color: "#8A8A8A", colorFromSpecularMap: true, metalness: 0, roughness: 1 },                    // seat
        { match: "carbon",                   color: "#0E0E10", metalness: 0.2, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1, normalScale: 1.2 }, // carbon: black, weave comes from the model's relief map
        // --- wheels ---
        { match: "[WHEEL]",                  color: "#0F0F11", metalness: 0.85, roughness: 0.42 },
        // --- lights & glass ---
        { match: "headlight glass",          color: "#FFFFFF", opacity: 0.18, metalness: 0, roughness: 0.02 },
        { match: "glass_500px",              color: "#0A0A0C", opacity: 0.55, metalness: 0, roughness: 0.03 },      // windscreen
        { match: "rgbab60000ff",             color: "#9A0000", emissive: "#2A0000", metalness: 0, roughness: 0.15 }, // tail light
        // --- mechanical ---
        { match: "gold",                     color: "#A8842F", metalness: 1, roughness: 0.28 },                      // fork tubes
        { match: "chain",                    color: "#4A4A4E", metalness: 1, roughness: 0.45 },
        { match: "ptn_weave",                color: "#141416", metalness: 0.1, roughness: 0.75 },
        { match: "x3_b0",                    color: "#18181A", metalness: 0.4, roughness: 0.55 },
        // --- everything else that used a dirt-mask texture: satin black plastic / metal ---
        { match: "smallspecmap",             color: "#141416", metalness: 0.35, roughness: 0.55 },
        { match: "plastic",                  color: "#0B0B0C", metalness: 0, roughness: 0.65 },
        { match: "black",                    color: "#0B0B0C", metalness: 0, roughness: 0.65 },
      ],

      headlights: [                 // model-space points where the headlight flare glows (3D mode)
        [0.10, 0.80, 0.97],
        [-0.10, 0.80, 0.97],
      ],
      stockHp: 200,                 // Yamaha's claimed figure for the 2015+ YZF-R1 (200 PS) — confirm for the client's bike. S1000RR 2019 = 207
      tunedHp: "[PLACEHOLDER: hero bike tuned HP (number)]", // number → HP counter counts stock → tuned
    },

    lighting: {
      preset: "studio-dark",        // "studio-dark" | "studio-bright"
      rimColor: "#E10600",          // coloured back light that outlines the bike
      rimIntensity: 2.0,            // rim strength at the end of the reveal
      environment: "studio",        // "studio" (softbox reflections, most realistic) | "room" (plain even light)
      envIntensity: 1.0,            // reflections strength (0–2)
      exposure: 1.05,               // overall brightness of the 3D render (0.6–1.6)
      shadows: true,                // true = real soft shadows on the bike and floor (false = faster on weak phones)
      shadowStrength: 0.6,          // darkness of the floor shadow (0–1)
      headlightColor: "#DCEBFF",    // flare colour
      flareSize: 0.3,               // headlight flare size in metres (0 = no flare)
      flareIntensity: 1.2,          // how much the headlights light up the nose (0 = off)
    },

    background: "#0B0B0D",          // hero background colour (also the colour the backdrop fades into)

    /* 3D set behind the bike (3D mode). Built from code — no image files.
       type: "garage" → dark tuning bay: glossy floor with painted bay, wall panels,
                        LED strips and a glowing wall sign behind the side profile
             "none"   → plain dark studio (just the bike on the background colour) */
    backdrop: {
      type: "garage",
      wallText: "LA PERFORMANCE",       // big glowing sign on the wall behind the bike ("" = no sign)
      wallTextAccent: "LA",             // leading part of the sign drawn in the accent colour
      wallSubText: "PROVEN ON THE ROAD.", // small line under the sign ("" = none)
      signHeight: 1.98,                 // metres above the floor of the sign centre (raise/lower it behind the bike)
      signSize: 0.5,                    // letter height of the sign in metres
      accentColor: "#E10600",           // LED strips, bay lines, sign accent
      stripColor: "#DDE8FF",            // the cool-white LED line
      wallColor: "#121216",             // wall panels
      floorColor: "#101013",            // floor
      floorGloss: 0.55,                 // 0 = matt concrete … 0.95 = polished showroom floor
      floorReflection: 0.3,             // how strongly the floor mirrors the studio lights (0–1). Higher = brighter, washed floor
      glow: 1.0,                        // brightness of sign + LED strips (0 = off, 2 = strong)
      showBay: true,                    // painted bay outline + lane lines on the floor
      showChecker: true,                // checkered strips on floor and wall
      lightStrips: true,                // LED lines on the walls
      fog: [9, 24],                     // [start, end] distance in metres where the set fades into the background colour

      /* 3D objects standing in the garage. Add, remove or move lines freely ([] = empty garage).
         type:     toolChest | workbench | tyreStack | tyreRack | oilDrum | dynoFan | shutterDoor | locker | pillar
         position: [x, z] in metres. The bike stands at [0, 0], nose towards +z.
                   Sign wall (behind the side profile) is at x = -5.5, the wall behind the nose shot at z = -6.5.
         rotation: degrees. 0 = front faces the nose-shot camera, 90 = front faces the side-profile camera.
         optional: color, scale, count (tyreStack, locker), width (workbench, tyreRack, shutterDoor) */
      props: [
        { type: "tyreStack",   position: [-4.9, 2.7],   count: 4 },
        { type: "toolChest",   position: [-5.15, 3.9],  rotation: 90, color: "#B00E0E" },
        { type: "oilDrum",     position: [-5.05, 5.2] },
        { type: "oilDrum",     position: [-4.75, 5.9] },
        { type: "workbench",   position: [-5.1, -4.1],  rotation: 90 },   // pegboard, tuning laptop, helmet
        { type: "tyreRack",    position: [-4.2, -6.2] },
        { type: "locker",      position: [-2.2, -6.22], count: 2 },
        { type: "shutterDoor", position: [2.7, -6.48],  width: 3.4 },
        { type: "dynoFan",     position: [1.5, -3.8],   rotation: 15 },
      ],

      /* Optional: a downloaded garage/workshop 3D model (.glb) instead of the built-in set.
         Put the file in assets/models/ and set url. Empty url or missing file = built-in garage. */
      garageModel: {
        url: "",                        // e.g. "assets/models/garage.glb"
        position: [0, 0, 0],            // [x, y, z] metres — slide the room around the bike
        rotation: 0,                    // degrees
        scale: 1,
        replaceBuiltIn: true,           // true = model replaces floor, walls and props; false = model is added to them
      },
    },
    scrollLength: "450vh",          // how much scrolling the reveal takes (bigger = slower)
    poster: "assets/hero/desktop/frame_0001.webp", // shown while the model loads, and used by mode "image". Missing file → SVG silhouette

    /* Camera path. `at` = scroll progress 0–1. position & lookAt are in model
       space (metres): +Z = towards the nose, +Y = up, +X = bike's left side.
       Tune with the dev panel: press "D" on the homepage, tick "Free cam",
       drag to orbit, then "Copy keyframe" and paste the line here. */
    cameraKeyframes: [
      { at: 0.00, position: [0, 0.9, 1.6],   lookAt: [0, 0.85, 0.9], fov: 28 },  // nose close-up
      { at: 0.25, position: [0.6, 1.0, 3.0], lookAt: [0, 0.7, 0.4],  fov: 32 },
      { at: 0.60, position: [2.5, 1.0, 2.3], lookAt: [0, 0.6, 0],    fov: 35 },  // three-quarter
      { at: 0.90, position: [3.6, 0.85, 0],  lookAt: [0, 0.58, 0],   fov: 35 },  // full side profile
      { at: 1.00, position: [3.4, 0.85, 0],  lookAt: [0, 0.58, 0],   fov: 34 },
    ],

    /* Narrow-screen fit: on portrait screens the camera is pulled back
       automatically so the whole bike stays in frame. */
    fit: {
      minVisibleWidth: 2.6,   // metres that must be visible left-to-right by the end of the reveal
      portraitLift: 0.45,     // metres the bike is shifted UP in frame on portrait screens (room for text below)
    },

    /* Overlays shown during scroll ranges (from/to = scroll progress 0–1).
       type: "title"     → big headline            { text }
             "callout"   → label + red leader line { text, anchor: [x, y, z] model-space point, side?: "left" | "right" }
             "hpCounter" → stock → tuned HP counter (uses hero.bike.stockHp / tunedHp)
             "cta"       → the buttons in hero.cta */
    overlays: [
      { from: 0.00, to: 0.20, type: "title",   text: "PROVEN ON THE ROAD." },
      { from: 0.20, to: 0.45, type: "title",   text: "TUNED. TESTED. PROVEN." },
      { from: 0.30, to: 0.62, type: "callout", text: "ECU REMAP",    anchor: [0.2, 0.5, 0.3] },
      { from: 0.36, to: 0.62, type: "callout", text: "FULL EXHAUST", anchor: [-0.5, 0.35, -0.2] },
      { from: 0.42, to: 0.62, type: "callout", text: "QUICKSHIFTER", anchor: [0.1, 0.4, 0.0] },
      { from: 0.62, to: 0.92, type: "hpCounter" },
      { from: 0.90, to: 1.00, type: "cta" },
    ],

    /* Buttons for the "cta" overlay. style: "primary" | "secondary" */
    cta: [
      { label: "BOOK A TUNE", href: "contact.html", style: "primary" },
      { label: "SEE OUR BUILDS", href: "builds.html", style: "secondary" },
    ],

    /* mode "frames": image sequence. #### = zero-padded frame number starting at 0001 */
    frames: {
      desktop: "assets/hero/desktop/frame_####.webp",
      mobile: "assets/hero/mobile/frame_####.webp",
      count: 200,                     // frames cut from the first 10 s of the hero clip
      desktopStep: 1,                 // 1 = use every frame, 2 = every 2nd (half the download, slightly less smooth) …
      mobileStep: 2,                  // phones: every 2nd frame → about 2.9 MB instead of 5.8 MB; blending hides the gaps
      blend: true,                    // cross-fade between neighbouring frames → smooth motion when scrolling slowly (false = hard frame steps)
      preload: 12,                    // frames kept ready-to-draw on each side of the current one (more = smoother fast scrolling, more memory). Phones use 8
      /* How the frames sit on screen.
         fit:     "cover" = fill the screen (edges cropped) | "contain" = whole frame visible
         zoom:    extra magnification on top of fit (1 = none)
         focus:   [x, y] point of the frame kept in the middle of the screen (0–1)
         offsetY: move the picture up (negative) or down (positive), as a fraction of screen height */
      view: {
        desktop: { fit: "cover", zoom: 1, focus: [0.5, 0.75], offsetY: 0 },   // 0.75 = on wide screens crop the ceiling, keep the wheels
        mobile:  { fit: "contain", zoom: 1.1, focus: [0.58, 0.5], offsetY: -0.06 },   // bike fills the frame width in the side view, so little zoom
      },
    },
  },

  /* ------------------------------------------------------------------ */
  /* STATS — animated counter strip under the hero                        */
  /* value: number (animates) or text. suffix: text after the number.     */
  /* ------------------------------------------------------------------ */
  stats: [
    { value: 200, suffix: " HP", label: "Turbo R6 at the crank" },
    { value: 185, suffix: " WHP", label: "Turbo R6 at the wheel" },
    { value: "[PLACEHOLDER: number of bikes tuned]", suffix: "+", label: "Bikes tuned" },
    { value: 100, suffix: "%", label: "Dyno verified" },
  ],

  /* ------------------------------------------------------------------ */
  /* SERVICES                                                             */
  /* icon: "ecu" | "mods" | "dyno" | "turbo" | "wrench" | "bolt"          */
  /* priceFrom: e.g. "PKR 45,000". Empty = "Contact for quote".           */
  /* ------------------------------------------------------------------ */
  services: [
    {
      id: "ecu-tuning",
      title: "ECU Tuning / Remapping",
      icon: "ecu",
      short: "Base flashes and full custom maps built around your bike, your mods and your fuel.",
      description:
        "A stock ECU is tuned for emissions and noise, not for power. We rewrite the fuel, ignition and throttle maps so the engine makes clean, repeatable power everywhere in the rev range — then we prove it.",
      includes: [
        "Fuel / AFR mapping",
        "Ignition tables & timing optimisation",
        "Secondary throttle plate (STP) & throttle maps",
        "Restrictions and limiters removed where safe",
        "Before / after logs",
      ],
      suitableFor: ["Yamaha R1 / R6", "Kawasaki ZX-10R", "Suzuki GSX-R", "BMW S1000RR"],
      turnaround: "[PLACEHOLDER: ECU tuning turnaround, e.g. 1–2 days]",
      priceFrom: "",
    },
    {
      id: "performance-mods",
      title: "Performance Mods",
      icon: "mods",
      short: "Exhausts, intake, quickshifters and supporting parts — fitted and tuned to work together.",
      description:
        "Parts only make power when the tune matches them. We select, fit and map the hardware as a package so every upgrade actually shows up on the road.",
      includes: [
        "Full & slip-on exhaust systems",
        "Air filters and intake work",
        "Quickshifter / auto-blipper setup",
        "Gearing changes",
        "Tune update to match the new parts",
      ],
      suitableFor: ["Street bikes", "Track-day bikes", "Drag builds"],
      turnaround: "[PLACEHOLDER: mods turnaround]",
      priceFrom: "",
    },
    {
      id: "dyno-testing",
      title: "Dyno Testing",
      icon: "dyno",
      short: "Real numbers at the crank and at the wheel. No guesswork, no butt-dyno.",
      description:
        "Every claim we make is backed by a dyno sheet. Baseline run, tuned run, and a printout you can keep — run with our dyno partner.",
      includes: [
        "Baseline power & torque run",
        "Air–fuel ratio trace",
        "Post-tune verification run",
        "Dyno sheet to take home",
      ],
      suitableFor: ["Any superbike", "Pre-purchase health check", "Before / after comparisons"],
      turnaround: "[PLACEHOLDER: dyno session length, e.g. same day]",
      priceFrom: "",
    },
    {
      id: "custom-turbo-builds",
      title: "Custom & Turbo Builds",
      icon: "turbo",
      short: "One-off builds like Pakistan's 200 hp turbocharged Yamaha R6.",
      description:
        "When bolt-ons are not enough. Forced induction, custom fuelling and full project builds, engineered and dyno-tuned from start to finish.",
      includes: [
        "Turbo kit design & fitment",
        "Fuel system upgrades",
        "Custom boost & fuel mapping",
        "Dyno development",
        "Road testing",
      ],
      suitableFor: ["Project bikes", "Drag racing", "Owners who want a 1-of-1"],
      turnaround: "Quoted per project",
      priceFrom: "",
    },
  ],

  /* ------------------------------------------------------------------ */
  /* BUILDS — each one gets a card + its own page: build.html?slug=...    */
  /* stock / tuned: { hp, torque } numbers (torque in Nm). tuned.wheelHp   */
  /* is optional. Placeholders are fine: the chart shows "?" bars.         */
  /* ------------------------------------------------------------------ */
  builds: [
    {
      slug: "turbo-r6",
      title: "Turbo R6",
      brand: "Yamaha",
      model: "YZF-R6",
      year: "[PLACEHOLDER: Turbo R6 model year]",
      badge: "1 of 1",                                    // small tag on the card (optional)
      heroMedia: "assets/instagram/ig-10-reel-De6ste.jpg",
      gallery: [
        "assets/instagram/ig-10-reel-De6ste.jpg",
        "assets/instagram/ig-07-reel-DfCtti.jpg",
        "assets/instagram/ig-09-reel-De5l3x.jpg",
      ],
      mods: [
        "Turbocharger conversion",
        "Custom fuel & boost mapping",
        "Dyno tuned",
        "[PLACEHOLDER: full Turbo R6 parts list — turbo, injectors, exhaust, clutch ...]",
      ],
      stock: { hp: 117, torque: 62 },                     // Yamaha factory claim for the R6 (crank) — confirm for this model year
      tuned: { hp: 200, wheelHp: 185, torque: "[PLACEHOLDER: Turbo R6 tuned torque (Nm)]" },
      notes:
        "Pakistan's one-off turbocharged Yamaha R6. 200 hp at the crank and 185 hp at the wheel, verified on the dyno — and proven on the road against a tuned naturally-aspirated R6.",
      credits: { tuner: "Shahab Lodhi (@shahab_lodhi)", dyno: "[PLACEHOLDER: dyno used for the Turbo R6]", video: "@mahdi_motoventures" },
    },
    {
      slug: "yamaha-r1",
      title: "R1 Base Flash",
      brand: "Yamaha",
      model: "YZF-R1",
      year: 2022,
      badge: "Crossplane",
      heroMedia: "assets/instagram/ig-16-p-DehAaR.jpg",
      gallery: [
        "assets/instagram/ig-16-p-DehAaR.jpg",
        "assets/instagram/ig-19-p-DeRUf7.jpg",
        "assets/instagram/ig-21-p-DeHd1G.jpg",
        "assets/instagram/ig-12-reel-Det5nr.jpg",
      ],
      mods: ["ECU base flash", "[PLACEHOLDER: R1 parts list]"],
      stock: { hp: "[PLACEHOLDER: R1 stock HP]", torque: "[PLACEHOLDER: R1 stock torque (Nm)]" },
      tuned: { hp: "[PLACEHOLDER: R1 tuned HP]", torque: "[PLACEHOLDER: R1 tuned torque (Nm)]" },
      notes: "Crossplane R1 with a base flash — tested stock first, then tuned, on the same road.",
      credits: { tuner: "LA Performance", dyno: "[PLACEHOLDER: dyno used for the R1]", video: "[PLACEHOLDER: R1 photo/video credit]" },
    },
    {
      slug: "kawasaki-zx10r",
      title: "ZX-10R",
      brand: "Kawasaki",
      model: "Ninja ZX-10R",
      year: "[PLACEHOLDER: ZX-10R model year]",
      badge: "",
      heroMedia: "assets/instagram/ig-13-reel-DeovZV.jpg",
      gallery: ["assets/instagram/ig-13-reel-DeovZV.jpg"],
      mods: ["[PLACEHOLDER: ZX-10R parts list]"],
      stock: { hp: "[PLACEHOLDER: ZX-10R stock HP]", torque: "[PLACEHOLDER: ZX-10R stock torque (Nm)]" },
      tuned: { hp: "[PLACEHOLDER: ZX-10R tuned HP]", torque: "[PLACEHOLDER: ZX-10R tuned torque (Nm)]" },
      notes: "[PLACEHOLDER: ZX-10R build story]",
      credits: { tuner: "LA Performance", dyno: "[PLACEHOLDER: dyno used for the ZX-10R]", video: "" },
    },
    {
      slug: "gsxr-nemesis",
      title: "Project Nemesis",
      brand: "Suzuki",
      model: "GSX-R",
      year: 2012,
      badge: "Founder's build",
      heroMedia: "assets/instagram/ig-14-p-DemmG1.jpg",
      gallery: [
        "assets/instagram/ig-14-p-DemmG1.jpg",
        "assets/instagram/ig-24-reel-Dc3H5W.jpg",
        "assets/instagram/ig-17-reel-Deedz8.jpg",
      ],
      mods: ["Multiple performance parts", "Custom tune (in progress)", "[PLACEHOLDER: Nemesis parts list]"],
      stock: { hp: "[PLACEHOLDER: GSX-R stock HP]", torque: "[PLACEHOLDER: GSX-R stock torque (Nm)]" },
      tuned: { hp: "[PLACEHOLDER: GSX-R tuned HP]", torque: "[PLACEHOLDER: GSX-R tuned torque (Nm)]" },
      notes:
        "The older GSX-R generations are not everyone's favourite, but there is real potential in these bikes. Nemesis is a 2012 GSX-R built into a proper performance machine: performance parts, upgrades and a custom tune that is still being developed.",
      credits: { tuner: "Shahab Lodhi (@shahab_lodhi)", dyno: "[PLACEHOLDER: dyno used for Nemesis]", video: "" },
    },
  ],

  /* ------------------------------------------------------------------ */
  /* DYNO — leaderboard rows. Numbers sort; placeholders sort last.       */
  /* ------------------------------------------------------------------ */
  dyno: [
    { bike: "Yamaha R6 Turbo", mods: "Turbo conversion, custom map", crankHp: 200, wheelHp: 185, gainPercent: 71 }, // gain vs 117 hp factory claim
    { bike: "Yamaha R1", mods: "Base flash", crankHp: "[PLACEHOLDER: R1 crank HP]", wheelHp: "[PLACEHOLDER: R1 wheel HP]", gainPercent: "[PLACEHOLDER: R1 gain %]" },
    { bike: "Suzuki GSX-R “Nemesis”", mods: "Performance parts, custom tune", crankHp: "[PLACEHOLDER: Nemesis crank HP]", wheelHp: "[PLACEHOLDER: Nemesis wheel HP]", gainPercent: "[PLACEHOLDER: Nemesis gain %]" },
    { bike: "Kawasaki ZX-10R", mods: "[PLACEHOLDER: ZX-10R mods]", crankHp: "[PLACEHOLDER: ZX-10R crank HP]", wheelHp: "[PLACEHOLDER: ZX-10R wheel HP]", gainPercent: "[PLACEHOLDER: ZX-10R gain %]" },
  ],

  /* Brands shown in the "we tune" strip. Edit freely. */
  supportedBrands: ["Yamaha", "Kawasaki", "Suzuki", "BMW", "Honda"],

  /* REELS — 9:16 tiles linking to Instagram. caption is optional. */
  reels: [
    { thumbnail: "assets/instagram/ig-01-reel-DfpZoM.jpg", url: "https://www.instagram.com/la_performance_pk/reel/DfpZoMhOKak/", caption: "Torque monster" },
    { thumbnail: "assets/instagram/ig-07-reel-DfCtti.jpg", url: "https://www.instagram.com/la_performance_pk/reel/DfCttiNOk8m/", caption: "Turbo R6 just got tuned" },
    { thumbnail: "assets/instagram/ig-04-reel-DfU2sz.jpg", url: "https://www.instagram.com/la_performance_pk/reel/DfU2szuOkuf/", caption: "Best sounding bike ever" },
    { thumbnail: "assets/instagram/ig-13-reel-DeovZV.jpg", url: "https://www.instagram.com/la_performance_pk/reel/DeovZVvOEYk/", caption: "This says it all" },
    { thumbnail: "assets/instagram/ig-08-reel-De0pRu.jpg", url: "https://www.instagram.com/la_performance_pk/reel/De_-0pRuIz0/", caption: "Crossplane is love" },
    { thumbnail: "assets/instagram/ig-11-reel-De1Omx.jpg", url: "https://www.instagram.com/la_performance_pk/reel/De1Omx_uqXy/", caption: "Stock R1 vs GSX-R 1000" },
    { thumbnail: "assets/instagram/ig-02-reel-Dfmfe1.jpg", url: "https://www.instagram.com/la_performance_pk/reel/Dfmfe1jOoon/", caption: "CP4 is so thrilling" },
    { thumbnail: "assets/instagram/ig-03-reel-DfhDcN.jpg", url: "https://www.instagram.com/la_performance_pk/reel/DfhDcNLO-Ur/", caption: "Raw action" },
  ],

  /* TESTIMONIALS — slider on the homepage */
  testimonials: [
    { quote: "[PLACEHOLDER: customer testimonial 1]", name: "[PLACEHOLDER: customer name]", bike: "[PLACEHOLDER: customer bike]" },
    { quote: "[PLACEHOLDER: customer testimonial 2]", name: "[PLACEHOLDER: customer name]", bike: "[PLACEHOLDER: customer bike]" },
    { quote: "[PLACEHOLDER: customer testimonial 3]", name: "[PLACEHOLDER: customer name]", bike: "[PLACEHOLDER: customer bike]" },
  ],

  /* TEAM — About page */
  team: [
    { name: "Shahab Lodhi", role: "Founder & Tuner", photo: "[PLACEHOLDER: team photo path, e.g. assets/team/shahab.jpg (800×1000 jpg)]" },
    { name: "[PLACEHOLDER: team member name]", role: "[PLACEHOLDER: role]", photo: "" },
  ],

  /* ABOUT — story paragraphs (array = one paragraph each) + dyno partner */
  about: {
    story: [
      "Just another biker from the capital. I've always been fascinated by bikes — how they work and what makes them perform. What started as curiosity turned into learning, experimenting and tuning my own bikes.",
      "LA Performance is where that obsession ended up: superbike ECU tuning, performance mods and testing, with every result proven on the dyno and then on the road.",
      "[PLACEHOLDER: rest of the LA Performance story — year founded, workshop, milestones]",
    ],
    image: "assets/instagram/ig-06-p-DfHL0k.jpg",
    dynoPartner: {
      name: "Bike Master Performance",
      handle: "@bikemasterperformance",
      url: "https://www.instagram.com/bikemasterperformance/",
      description: "[PLACEHOLDER: one or two lines about the dyno partner and the dyno used]",
    },
  },

  /* ------------------------------------------------------------------ */
  /* HOME — headings and copy for homepage sections                       */
  /* ------------------------------------------------------------------ */
  home: {
    services: { kicker: "What we do", heading: "Built for power.", intro: "Four ways we make your bike faster — and prove it." },
    featured: { kicker: "Signature build", heading: "The 200 HP Turbo R6", buildSlug: "turbo-r6" }, // buildSlug = which build is featured
    builds: { kicker: "The garage", heading: "Recent builds" },
    dyno: { kicker: "Numbers don't lie", heading: "Dyno leaderboard", count: 3 }, // count = rows shown in the teaser
    reels: { kicker: "From the road", heading: "Latest reels" },
    testimonials: { kicker: "Riders", heading: "What they say" },
    brands: { label: "We tune" },
    cta: { heading: "Ready to unlock your bike?", text: "Tell us what you ride. We'll tell you what it can really do.", button: "Book a tune" },
  },

  /* PAGES — title + intro for the inner pages */
  pages: {
    home: { title: "Superbike Tuning in Pakistan" },
    services: { title: "Services", kicker: "What we do", intro: "ECU tuning, performance mods, dyno testing and full custom builds for superbikes.", labels: { includes: "What's included", suitableFor: "Suitable for", turnaround: "Turnaround", price: "Price" } },
    builds: { title: "Builds", kicker: "The garage", intro: "Every build tuned, tested and proven. Filter by brand." },
    build: { title: "Build", labels: { mods: "Mod list", power: "Stock vs tuned", gallery: "Gallery", credits: "Credits", tuner: "Tuner", dyno: "Dyno", video: "Photo / video", notes: "The build" } },
    dyno: { title: "Dyno Leaderboard", kicker: "Numbers don't lie", intro: "Verified dyno results. Tap a column to sort.", columns: { rank: "#", bike: "Bike", mods: "Mods", crankHp: "Crank HP", wheelHp: "Wheel HP", gainPercent: "Gain %" } },
    about: { title: "About", kicker: "Who we are", intro: "Superbike performance & tuning. Proven on the road.", labels: { story: "The story", team: "The team", dynoPartner: "Dyno partner", brands: "Bikes we tune" } },
    contact: { title: "Book a Tune", kicker: "Get in touch", intro: "Fill in your bike details and we'll continue on WhatsApp.", labels: { visit: "Visit", hours: "Hours", address: "Address", email: "Email", instagram: "Instagram", map: "Map" } },
  },

  /* ------------------------------------------------------------------ */
  /* FORM — booking form labels, messages and WhatsApp message format     */
  /* ------------------------------------------------------------------ */
  form: {
    fields: {
      name: "Your name",
      phone: "Phone / WhatsApp",
      make: "Bike make",
      model: "Model",
      year: "Year",
      mods: "Current mods",
      service: "Service",
      date: "Preferred date",
      message: "Message",
    },
    placeholders: { name: "Full name", phone: "03xx xxxxxxx", make: "Yamaha", model: "R1", year: "2022", mods: "Exhaust, air filter, quickshifter ...", message: "Anything else we should know?" },
    servicePrompt: "Choose a service",
    submit: "Send on WhatsApp",
    note: "Submitting opens WhatsApp with your details pre-filled. Nothing is stored on this website.",
    errors: { required: "This field is required.", phone: "Enter a valid phone number.", year: "Enter a valid year." },
    noWhatsapp: "WhatsApp number is not set in the config yet — the message will open in WhatsApp without a recipient.",
    messageHeader: "New tuning enquiry — LA Performance", // first line of the WhatsApp message
  },

  /* ------------------------------------------------------------------ */
  /* SEO — meta tags, Open Graph / Twitter cards, LocalBusiness JSON-LD   */
  /* After editing, run:  node tools/sync-seo.mjs   (stamps these into    */
  /* the HTML files so WhatsApp / Facebook link previews pick them up).   */
  /* ------------------------------------------------------------------ */
  seo: {
    title: "LA Performance — Superbike Tuning Pakistan",
    description: "Superbike performance & tuning in Pakistan. ECU tuning, performance mods, dyno testing and custom turbo builds. Proven on the road.",
    siteUrl: "[PLACEHOLDER: live site URL, e.g. https://laperformance.pk]", // used for canonical + absolute og:image
    ogImage: "assets/og-image.jpg",   // 1200×630 jpg
    keywords: ["superbike tuning Pakistan", "ECU tuning", "ECU remap", "dyno tuning", "Yamaha R1 tuning", "Yamaha R6 turbo", "ZX-10R tuning", "GSX-R tuning", "LA Performance"],
  },

  /* CREDITS — shown in the footer. Keep the model attribution if its licence requires it (CC-BY does). */
  credits: {
    model: "[PLACEHOLDER: 3D model attribution — “BMW S1000RR” by Patribikes on Sketchfab + the licence shown on its Sketchfab page, e.g. CC BY 4.0]",
    photos: "Photos & video: @mahdi_motoventures, @omarmalikx17, @piston_therapy",
  },
};

export default config;
