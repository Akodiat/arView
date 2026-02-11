function d(i) {
  if (!i || typeof i != "string")
    throw new Error("Resolution must be a non-empty string");
  const t = i.trim().toLowerCase(), e = {
    "144p": { width: { ideal: 256 }, height: { ideal: 144 } },
    "240p": { width: { ideal: 426 }, height: { ideal: 240 } },
    "360p": { width: { ideal: 640 }, height: { ideal: 360 } },
    "480p": { width: { ideal: 854 }, height: { ideal: 480 } },
    "720p": { width: { ideal: 1280 }, height: { ideal: 720 } },
    "1080p": { width: { ideal: 1920 }, height: { ideal: 1080 } },
    "1440p": { width: { ideal: 2560 }, height: { ideal: 1440 } },
    "2160p": { width: { ideal: 3840 }, height: { ideal: 2160 } }
    // 4K
  };
  if (e[t])
    return e[t];
  throw new Error(`Invalid resolution format: "${i}". Must be one of: ${Object.keys(e).join(", ")}`);
}
export {
  d as g
};
