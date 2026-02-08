const form = document.getElementById("generator-form");
const promptInput = document.getElementById("prompt");
const styleSelect = document.getElementById("style");
const batchInput = document.getElementById("batch");
const grid = document.getElementById("grid");
const counter = document.getElementById("counter");
const moreButton = document.getElementById("more");
const clearButton = document.getElementById("clear");
const sentinel = document.getElementById("sentinel");

let totalGenerated = 0;
let activePrompt = "";
let activeStyle = "dream";

const stylePalettes = {
  dream: ["#8b5cf6", "#ec4899", "#facc15", "#22d3ee"],
  noir: ["#111827", "#4b5563", "#9ca3af", "#f9fafb"],
  vapor: ["#f472b6", "#818cf8", "#22d3ee", "#facc15"],
  terra: ["#c2410c", "#f97316", "#fcd34d", "#78350f"],
  ocean: ["#0ea5e9", "#22d3ee", "#14b8a6", "#0f172a"],
};

const styleFilters = {
  dream: "contrast(1.05) saturate(1.2)",
  noir: "grayscale(0.2) contrast(1.2)",
  vapor: "saturate(1.4) hue-rotate(-10deg)",
  terra: "contrast(1.1) saturate(1.1)",
  ocean: "saturate(1.3) hue-rotate(10deg)",
};

const observers = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      generateBatch();
    }
  });
});

observers.observe(sentinel);

const createSeed = (text, index) => {
  let hash = 2166136261;
  const combined = `${text}-${index}`;
  for (let i = 0; i < combined.length; i += 1) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const generateArtwork = (prompt, style, index) => {
  const seed = createSeed(prompt + style, index);
  const rand = mulberry32(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const palette = stylePalettes[style];
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(0.5, palette[1]);
  gradient.addColorStop(1, palette[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 20; i += 1) {
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
    ctx.globalAlpha = 0.2 + rand() * 0.5;
    ctx.beginPath();
    ctx.arc(rand() * 512, rand() * 512, rand() * 180, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.8;
  ctx.fillStyle = palette[3];
  ctx.fillRect(rand() * 200, rand() * 200, 180 + rand() * 200, 120 + rand() * 200);

  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = palette[2];
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(rand() * 512, rand() * 512);
    ctx.bezierCurveTo(
      rand() * 512,
      rand() * 512,
      rand() * 512,
      rand() * 512,
      rand() * 512,
      rand() * 512
    );
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.filter = styleFilters[style];

  return canvas.toDataURL("image/png");
};

const addCard = (dataUrl, prompt, style) => {
  const card = document.createElement("article");
  card.className = "card";

  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = `KI-Bild für ${prompt}`;

  const meta = document.createElement("div");
  meta.className = "meta";

  const title = document.createElement("strong");
  title.textContent = prompt;

  const details = document.createElement("span");
  details.textContent = `Stil: ${style} · Bild #${totalGenerated}`;

  meta.append(title, details);
  card.append(img, meta);
  grid.prepend(card);
};

const updateCounter = () => {
  counter.textContent = `Bereits ${totalGenerated} Bilder generiert.`;
};

const generateBatch = () => {
  if (!activePrompt) {
    return;
  }

  const batchSize = Math.min(Number(batchInput.value) || 4, 8);
  for (let i = 0; i < batchSize; i += 1) {
    totalGenerated += 1;
    const artwork = generateArtwork(activePrompt, activeStyle, totalGenerated);
    addCard(artwork, activePrompt, activeStyle);
  }
  updateCounter();
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  activePrompt = promptInput.value.trim();
  activeStyle = styleSelect.value;
  if (!activePrompt) {
    return;
  }
  generateBatch();
});

moreButton.addEventListener("click", () => {
  if (!activePrompt) {
    activePrompt = promptInput.value.trim();
  }
  activeStyle = styleSelect.value;
  if (!activePrompt) {
    return;
  }
  generateBatch();
});

clearButton.addEventListener("click", () => {
  grid.innerHTML = "";
  totalGenerated = 0;
  updateCounter();
});

updateCounter();
