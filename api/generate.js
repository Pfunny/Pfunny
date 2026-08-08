const STYLE_PROMPTS = {
  cute: "cute friendly children's coloring book style, large expressive face, rounded shapes, simple playful scene",
  simple: "very simple children's coloring page, large open coloring areas, minimal background details",
  detailed: "detailed premium coloring book line art, balanced decorative background, clean separated shapes",
  fantasy: "whimsical fantasy coloring book scene, magical but child-friendly, decorative stars plants and gentle fantasy elements",
  mandala: "symmetrical decorative coloring page with tasteful mandala-inspired patterns around the main subject",
};

const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Nur POST-Anfragen sind erlaubt." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const appPassword = process.env.PRIVATE_APP_PASSWORD;

  if (!apiKey) return sendJson(res, 503, { error: "OPENAI_API_KEY ist in Vercel noch nicht eingerichtet." });
  if (!appPassword) return sendJson(res, 503, { error: "PRIVATE_APP_PASSWORD ist in Vercel noch nicht eingerichtet." });

  const { prompt, password, style = "cute", quality = "medium", count = 1 } = req.body || {};

  if (password !== appPassword) return sendJson(res, 401, { error: "Das Passwort ist nicht korrekt." });
  if (typeof prompt !== "string" || prompt.trim().length < 3) {
    return sendJson(res, 400, { error: "Bitte gib eine etwas genauere Bildbeschreibung ein." });
  }

  const safeCount = Math.min(Math.max(Number(count) || 1, 1), 4);
  const safeQuality = ["low", "medium", "high"].includes(quality) ? quality : "medium";
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.cute;

  const fullPrompt = [
    "Create a printable black-and-white coloring book illustration in portrait orientation.",
    stylePrompt + ".",
    `Subject and scene: ${prompt.trim()}.`,
    "Use crisp pure black outlines on a pure white background.",
    "No grayscale, no shading, no color, no filled black areas except tiny necessary details.",
    "Use consistent bold outer contours and slightly thinner inner detail lines.",
    "Keep the main subject centered and occupying roughly 65 to 75 percent of the page height.",
    "Keep generous white safety margins around all sides and do not crop the subject.",
    "No text, letters, numbers, captions, signatures, logos, borders, frames, page numbers, or watermarks.",
    "The result should look like a clean professional children's coloring-book page suitable for print.",
  ].join(" ");

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: fullPrompt,
        n: safeCount,
        size: "1024x1536",
        quality: safeQuality,
        output_format: "png",
      }),
    });

    const data = await openaiResponse.json().catch(() => ({}));

    if (!openaiResponse.ok) {
      const message = data?.error?.message || "OpenAI konnte das Bild nicht erzeugen.";
      return sendJson(res, openaiResponse.status, { error: message });
    }

    const images = Array.isArray(data.data)
      ? data.data.map((item) => item.b64_json).filter(Boolean)
      : [];

    if (!images.length) return sendJson(res, 502, { error: "OpenAI hat keine Bilddaten zurückgegeben." });

    return sendJson(res, 200, { images });
  } catch (error) {
    console.error("Image generation failed", error);
    return sendJson(res, 500, { error: "Serverfehler bei der Bildgenerierung." });
  }
};
