const form = document.getElementById("generator-form");
const promptInput = document.getElementById("prompt");
const passwordInput = document.getElementById("password");
const styleSelect = document.getElementById("style");
const qualitySelect = document.getElementById("quality");
const batchInput = document.getElementById("batch");
const generateButton = document.getElementById("generate");
const clearButton = document.getElementById("clear");
const grid = document.getElementById("grid");
const counter = document.getElementById("counter");
const status = document.getElementById("status");

let totalGenerated = 0;

const savedPassword = sessionStorage.getItem("infinityart-password");
if (savedPassword) passwordInput.value = savedPassword;

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.classList.toggle("error", isError);
};

const updateCounter = () => {
  counter.textContent = totalGenerated === 0
    ? "Noch keine Bilder erstellt."
    : `${totalGenerated} ${totalGenerated === 1 ? "Bild" : "Bilder"} in dieser Sitzung erstellt.`;
};

const imageToKdpPage = (dataUrl) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2550;
    canvas.height = 3300;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const margin = 150;
    const maxWidth = canvas.width - margin * 2;
    const maxHeight = canvas.height - margin * 2;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;
    ctx.drawImage(image, x, y, width, height);
    resolve(canvas.toDataURL("image/png"));
  };
  image.onerror = reject;
  image.src = dataUrl;
});

const addCard = async (dataUrl, prompt, style, index) => {
  const card = document.createElement("article");
  card.className = "card";

  const preview = document.createElement("div");
  preview.className = "preview";
  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = `Ausmalbild: ${prompt}`;
  preview.appendChild(img);

  const meta = document.createElement("div");
  meta.className = "meta";
  const title = document.createElement("strong");
  title.textContent = prompt;
  const details = document.createElement("span");
  details.textContent = `Stil: ${style} · Bild #${index}`;

  const download = document.createElement("a");
  download.className = "download";
  download.textContent = "8,5 × 11 PNG herunterladen";
  download.download = `infinityart-ausmalbild-${index}.png`;
  download.href = await imageToKdpPage(dataUrl);

  meta.append(title, details, download);
  card.append(preview, meta);
  grid.prepend(card);
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const prompt = promptInput.value.trim();
  const password = passwordInput.value;
  const style = styleSelect.value;
  const quality = qualitySelect.value;
  const count = Math.min(Math.max(Number(batchInput.value) || 1, 1), 4);

  if (!prompt || !password) return;

  sessionStorage.setItem("infinityart-password", password);
  generateButton.disabled = true;
  setStatus(`Erstelle ${count} ${count === 1 ? "Ausmalbild" : "Ausmalbilder"} mit KI …`);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, password, style, quality, count }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "Die Bildgenerierung ist fehlgeschlagen.");
    }

    for (const base64 of result.images || []) {
      totalGenerated += 1;
      await addCard(`data:image/png;base64,${base64}`, prompt, style, totalGenerated);
    }

    updateCounter();
    setStatus("Fertig. Du kannst die Bilder jetzt als 8,5 × 11 PNG herunterladen.");
  } catch (error) {
    setStatus(error.message || "Unbekannter Fehler.", true);
  } finally {
    generateButton.disabled = false;
  }
});

clearButton.addEventListener("click", () => {
  grid.innerHTML = "";
  totalGenerated = 0;
  updateCounter();
  setStatus("");
});

updateCounter();
