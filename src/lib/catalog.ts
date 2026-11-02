/**
 * Static service catalogue for DEM PRODUCTION.
 * Prices are in Nigerian Naira (₦).
 */

export type EventPackage = {
  code: string;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  featured?: boolean;
};

export const EVENT_PACKAGES: EventPackage[] = [
  {
    code: "A",
    name: "Full Package",
    price: 1_000_000,
    tagline: "The complete cinematic production experience.",
    features: [
      "Professional video coverage",
      "Photography and photoshoot",
      "Photobook",
      "Drone piloting",
      "Red carpet services",
      "Projector services",
    ],
    featured: true,
  },
  {
    code: "B",
    name: "Coverage + Aerial",
    price: 600_000,
    tagline: "Multi-camera storytelling from the ground and the sky.",
    features: [
      "Video coverage",
      "Photography and photoshoot",
      "Photobook",
      "Drone piloting",
    ],
  },
  {
    code: "C",
    name: "Essential Coverage",
    price: 270_000,
    tagline: "Professional video and photography for intimate events.",
    features: ["Video coverage", "Photography and photoshoot"],
  },
  {
    code: "D",
    name: "Memory Package",
    price: 400_000,
    tagline: "Full coverage plus a beautifully printed photobook.",
    features: [
      "Video coverage",
      "Photography and photoshoot",
      "Photobook",
    ],
  },
];

export type MovieService = {
  key: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  deliverables: string[];
};

export const MOVIE_SERVICES: MovieService[] = [
  {
    key: "directing",
    name: "Movie Directing",
    price: 300_000,
    duration: "Four days of professional directing",
    description:
      "A dedicated film director leads your production from script breakdown to final cut. We block scenes, direct talent, shape performance and protect the visual identity of your story across four full production days.",
    deliverables: [
      "Script breakdown and shot planning",
      "On-set direction of cast and crew",
      "Continuity and performance coaching",
      "Creative supervision of every department",
    ],
  },
  {
    key: "editing",
    name: "Movie Editing",
    price: 200_000,
    duration: "One hour of edited feature footage",
    description:
      "Our editors sculpt your footage into a polished one-hour cut with sound design, colour grading and visual effects finishing. Built for Nollywood features, documentaries and premium brand films.",
    deliverables: [
      "Offline and online editing",
      "Sound design and audio mixing",
      "Colour grading and finishing",
      "Special effects integration",
    ],
  },
  {
    key: "vfx",
    name: "Special Effects Production",
    price: 600_000,
    duration: "Full VFX directing and editing",
    description:
      "End-to-end special effects production — from on-set supervision and green screen capture to compositing, simulation and final effects editing for blockbuster-level impact.",
    deliverables: [
      "VFX supervision and pre-visualisation",
      "Green screen and tracking",
      "Compositing and simulations",
      "Final effects editing and delivery",
    ],
  },
];

export type SessionType = {
  key: string;
  name: string;
  price: number;
  duration: string;
  description: string;
};

export const PHOTO_SESSIONS: SessionType[] = [
  {
    key: "pre-wedding",
    name: "Pre-Wedding Photography",
    price: 150_000,
    duration: "Half day · 1 location",
    description:
      "Romantic editorial-style engagement sessions shot on location or in our Aba studio, with wardrobe guidance and a curated gallery of retouched images.",
  },
  {
    key: "birthday",
    name: "Birthday Photography",
    price: 120_000,
    duration: "Up to 4 hours coverage",
    description:
      "Candid and styled coverage of birthdays, milestone celebrations and private parties, delivered as a fast-turnaround edited gallery.",
  },
  {
    key: "traditional-marriage",
    name: "Traditional Marriage Photography",
    price: 250_000,
    duration: "Full day coverage",
    description:
      "Culturally rich documentation of traditional marriage ceremonies — attire, family, rites and celebration — with cinematic and documentary coverage.",
  },
  {
    key: "family-portrait",
    name: "Family Portraits",
    price: 100_000,
    duration: "1 hour studio session",
    description:
      "Timeless family portraits in our controlled studio environment with professional lighting, styling support and fine-art print options.",
  },
  {
    key: "individual-portrait",
    name: "Individual Studio Portraits",
    price: 70_000,
    duration: "45 minute studio session",
    description:
      "Professional headshots, actor portfolios and personal branding portraits with premium lighting and expert retouching.",
  },
  {
    key: "professional-session",
    name: "Professional Photo Sessions",
    price: 180_000,
    duration: "Full day · custom brief",
    description:
      "Bespoke commercial, product and fashion sessions built around your brief, including art direction, lighting design and post-production.",
  },
];

export const COMPANY = {
  legalName: "DAVID EJIBE MOVIE PRODUCTION LIMITED",
  brand: "DEM PRODUCTION",
  tagline: "YOUR MOMENTS. OUR CREATIVITY. LASTING MEMORIES.",
  headline: "We Capture Your Moments, We Create Your Memories.",
  address: "No. 56, St. Michael's Road, Aba, Abia State, Nigeria.",
  addressNote: "Opposite DStv Station, Aba.",
  phone: "+2347055546059",
  phoneHref: "+2347055546059",
  whatsapp: "https://wa.me/2347055546059",
  email: "hello@demproduction.ng",
  hours: "Mon – Sat · 9:00am – 7:00pm",
  mapsQuery: "St Michael's Road, Aba, Abia State, Nigeria",
};
