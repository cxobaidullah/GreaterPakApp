const VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/,
  /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
];

export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  return null;
};

export const thumbnailUrlFromId = (videoId) =>
  videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
