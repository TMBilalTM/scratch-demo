export const defaultSprites = [
  {
    id: "cat",
    name: "Cat",
    category: "animals",
    svg: `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 10 L20 5 L15 15 L20 20 L30 20 Z" fill="#FF8C42"/>
      <path d="M30 10 L40 5 L45 15 L40 20 L30 20 Z" fill="#FF8C42"/>
      <circle cx="30" cy="35" r="18" fill="#FF8C42"/>
      <circle cx="25" cy="32" r="3" fill="white"/>
      <circle cx="35" cy="32" r="3" fill="white"/>
      <circle cx="25" cy="32" r="1.5" fill="black"/>
      <circle cx="35" cy="32" r="1.5" fill="black"/>
      <path d="M25 40 Q30 43 35 40" stroke="black" fill="none" stroke-width="2"/>
    </svg>`,
  },
  {
    id: "dog",
    name: "Dog",
    category: "animals",
    svg: `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="25" rx="8" ry="12" fill="#A0522D"/>
      <ellipse cx="40" cy="25" rx="8" ry="12" fill="#A0522D"/>
      <circle cx="30" cy="35" r="16" fill="#A0522D"/>
      <circle cx="26" cy="32" r="2.5" fill="white"/>
      <circle cx="34" cy="32" r="2.5" fill="white"/>
      <circle cx="26" cy="32" r="1.2" fill="black"/>
      <circle cx="34" cy="32" r="1.2" fill="black"/>
      <circle cx="30" cy="38" r="3" fill="#8B4513"/>
    </svg>`,
  },
  {
    id: "bird",
    name: "Bird",
    category: "animals",
    svg: `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="30" rx="14" ry="18" fill="#4169E1"/>
      <ellipse cx="16" cy="28" rx="10" ry="6" fill="#4169E1"/>
      <ellipse cx="44" cy="28" rx="10" ry="6" fill="#4169E1"/>
      <circle cx="26" cy="26" r="2" fill="white"/>
      <circle cx="34" cy="26" r="2" fill="white"/>
      <circle cx="26" cy="26" r="1" fill="black"/>
      <circle cx="34" cy="26" r="1" fill="black"/>
      <path d="M28 32 L30 36 L32 32" fill="#FFA500"/>
    </svg>`,
  },
  {
    id: "robot",
    name: "Robot",
    category: "fantasy",
    svg: `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="25" width="30" height="25" rx="3" fill="#708090"/>
      <rect x="20" y="15" width="20" height="15" rx="2" fill="#A9A9A9"/>
      <circle cx="26" cy="22" r="3" fill="#00FF00"/>
      <circle cx="34" cy="22" r="3" fill="#00FF00"/>
      <rect x="27" y="28" width="6" height="3" fill="#333"/>
      <rect x="12" y="35" width="8" height="4" fill="#708090"/>
      <rect x="40" y="35" width="8" height="4" fill="#708090"/>
    </svg>`,
  },
  {
    id: "ball",
    name: "Ball",
    category: "objects",
    svg: `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="20" fill="#FF4444"/>
      <ellipse cx="30" cy="30" rx="20" ry="20" fill="url(#ball-gradient)"/>
      <defs>
        <radialGradient id="ball-gradient">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.5"/>
          <stop offset="100%" style="stop-color:white;stop-opacity:0"/>
        </radialGradient>
      </defs>
    </svg>`,
  },
];

export const defaultBackdrops = [
  {
    id: "sky",
    name: "Sky",
    category: "nature",
    svg: `<svg width="480" height="360" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="360" fill="url(#sky-gradient)"/>
      <defs>
        <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style="stop-color:#87CEEB"/>
          <stop offset="100%" style="stop-color:#E0F6FF"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    id: "grass",
    name: "Grass Field",
    category: "nature",
    svg: `<svg width="480" height="360" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="180" fill="#87CEEB"/>
      <rect y="180" width="480" height="180" fill="#90EE90"/>
      <circle cx="100" cy="60" r="40" fill="white" opacity="0.7"/>
      <circle cx="130" cy="60" r="50" fill="white" opacity="0.7"/>
      <circle cx="160" cy="60" r="40" fill="white" opacity="0.7"/>
    </svg>`,
  },
  {
    id: "space",
    name: "Space",
    category: "fantasy",
    svg: `<svg width="480" height="360" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="360" fill="#000033"/>
      <circle cx="80" cy="80" r="2" fill="white"/>
      <circle cx="150" cy="120" r="1.5" fill="white"/>
      <circle cx="300" cy="60" r="2" fill="white"/>
      <circle cx="400" cy="140" r="1" fill="white"/>
      <circle cx="250" cy="200" r="1.5" fill="white"/>
      <circle cx="420" cy="280" r="2" fill="white"/>
      <circle cx="100" cy="300" r="1" fill="white"/>
    </svg>`,
  },
];

export const soundCategories = [
  { id: "effects", name: "Sound Effects" },
  { id: "music", name: "Music" },
  { id: "animals", name: "Animal Sounds" },
  { id: "voices", name: "Voices" },
];
