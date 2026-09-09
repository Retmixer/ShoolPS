/**
 * Universal video utility for extracting embed, preview, and stream URLs
 * for Google Drive, YouTube, RuTube, VK, and direct video files.
 */

export type VideoProvider = 'google-drive' | 'youtube' | 'rutube' | 'vk' | 'direct' | 'unknown';

export interface VideoInfo {
  isValid: boolean;
  provider: VideoProvider;
  providerLabel: string;
  fileId: string | null;
  embedUrl: string | null;
  streamUrl?: string | null;
  viewUrl: string;
  downloadUrl?: string;
  directDownloadUrl?: string;
  originalUrl: string;
  isGoogleDrive: boolean;
  filename?: string;
}

export function extractGoogleDriveInfo(inputUrl: string): VideoInfo {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return {
      isValid: false,
      provider: 'unknown',
      providerLabel: 'Неизвестный источник',
      fileId: null,
      embedUrl: null,
      streamUrl: null,
      viewUrl: '',
      originalUrl: '',
      isGoogleDrive: false,
    };
  }

  const trimmed = inputUrl.trim();

  // 1. Check Google Drive pattern: /file/d/{FILE_ID}
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    const fileId = matchFileD[1];
    return {
      isValid: true,
      provider: 'google-drive',
      providerLabel: 'Google Drive',
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      streamUrl: `/api/video-stream/${fileId}`,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      downloadUrl: `https://drive.google.com/uc?id=${fileId}&export=download`,
      directDownloadUrl: `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
      originalUrl: trimmed,
      isGoogleDrive: true,
      filename: fileId === '1p0BYhROxfd6imOCQmmlGSBeC97goS6Or' ? 'Opencode.mp4 (1.5 ГБ)' : undefined,
    };
  }

  // 2. Google Drive pattern: ?id={FILE_ID} or open?id={FILE_ID}
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && matchIdParam && matchIdParam[1]) {
    const fileId = matchIdParam[1];
    return {
      isValid: true,
      provider: 'google-drive',
      providerLabel: 'Google Drive',
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      streamUrl: `/api/video-stream/${fileId}`,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      downloadUrl: `https://drive.google.com/uc?id=${fileId}&export=download`,
      directDownloadUrl: `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
      originalUrl: trimmed,
      isGoogleDrive: true,
    };
  }

  // 3. Google Drive preview already
  if (trimmed.includes('drive.google.com') && trimmed.includes('/preview')) {
    const possibleId = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || null;
    return {
      isValid: true,
      provider: 'google-drive',
      providerLabel: 'Google Drive',
      fileId: possibleId,
      embedUrl: trimmed,
      streamUrl: possibleId ? `/api/video-stream/${possibleId}` : null,
      viewUrl: trimmed.replace('/preview', '/view?usp=sharing'),
      downloadUrl: possibleId ? `https://drive.google.com/uc?id=${possibleId}&export=download` : undefined,
      directDownloadUrl: possibleId ? `https://drive.usercontent.google.com/download?id=${possibleId}&export=download&confirm=t` : undefined,
      originalUrl: trimmed,
      isGoogleDrive: true,
    };
  }

  // 4. YouTube support
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      isValid: true,
      provider: 'youtube',
      providerLabel: 'YouTube',
      fileId: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&autoplay=0`,
      streamUrl: null,
      viewUrl: `https://www.youtube.com/watch?v=${ytId}`,
      originalUrl: trimmed,
      isGoogleDrive: false,
    };
  }

  // 5. RuTube support
  const rutubeMatch = trimmed.match(/rutube\.ru\/video\/([a-zA-Z0-9_-]+)/);
  if (rutubeMatch && rutubeMatch[1]) {
    const rutubeId = rutubeMatch[1];
    return {
      isValid: true,
      provider: 'rutube',
      providerLabel: 'RuTube',
      fileId: rutubeId,
      embedUrl: `https://rutube.ru/play/embed/${rutubeId}`,
      streamUrl: null,
      viewUrl: trimmed,
      originalUrl: trimmed,
      isGoogleDrive: false,
    };
  }

  // 6. Direct MP4 / WebM video file
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return {
      isValid: true,
      provider: 'direct',
      providerLabel: 'Прямой видеофайл (MP4)',
      fileId: null,
      embedUrl: trimmed,
      streamUrl: trimmed,
      viewUrl: trimmed,
      downloadUrl: trimmed,
      originalUrl: trimmed,
      isGoogleDrive: false,
    };
  }

  // 7. Bare Google Drive ID heuristic (25-45 alphanumeric chars)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return {
      isValid: true,
      provider: 'google-drive',
      providerLabel: 'Google Drive',
      fileId: trimmed,
      embedUrl: `https://drive.google.com/file/d/${trimmed}/preview`,
      streamUrl: `/api/video-stream/${trimmed}`,
      viewUrl: `https://drive.google.com/file/d/${trimmed}/view?usp=sharing`,
      downloadUrl: `https://drive.google.com/uc?id=${trimmed}&export=download`,
      directDownloadUrl: `https://drive.usercontent.google.com/download?id=${trimmed}&export=download&confirm=t`,
      originalUrl: trimmed,
      isGoogleDrive: true,
    };
  }

  // Fallback for general web URLs
  return {
    isValid: trimmed.startsWith('http'),
    provider: 'unknown',
    providerLabel: 'Внешнее видео',
    fileId: null,
    embedUrl: trimmed.startsWith('http') ? trimmed : null,
    streamUrl: null,
    viewUrl: trimmed,
    originalUrl: trimmed,
    isGoogleDrive: false,
  };
}
