import React, { useState, useRef } from 'react';
import { extractGoogleDriveInfo, VideoInfo } from '../utils/googleDrive';
import {
  Play,
  ExternalLink,
  Download,
  Copy,
  Check,
  RotateCw,
  Maximize2,
  AlertTriangle,
  Info,
  Film,
  Zap,
  Tv,
  Loader2
} from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showDriveHelper, setShowDriveHelper] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasStreamError, setHasStreamError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoInfo: VideoInfo = extractGoogleDriveInfo(url);

  // Playback mode: 'stream' (Direct fast HTML5 video stream via Range requests) or 'iframe' (embedded frame)
  const canDirectStream = Boolean(videoInfo.streamUrl);
  const [playbackMode, setPlaybackMode] = useState<'stream' | 'iframe'>(() => {
    return canDirectStream ? 'stream' : 'iframe';
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPopup = () => {
    const targetUrl = videoInfo.viewUrl || url;
    window.open(
      targetUrl,
      'PaceSetterVideoPlayer',
      'width=1100,height=680,menubar=no,toolbar=no,location=yes,status=no'
    );
  };

  const handleReload = () => {
    setReloadKey((k) => k + 1);
    setIsVideoLoading(true);
    setHasStreamError(false);
  };

  const isDriveVideo = videoInfo.isGoogleDrive;
  const isSpecificLargeFile = videoInfo.fileId === '1p0BYhROxfd6imOCQmmlGSBeC97goS6Or';

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Status & Mode Bar */}
      <div className="px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-white font-medium truncate max-w-[180px] sm:max-w-xs">
            {videoInfo.providerLabel}
          </span>
          {isSpecificLargeFile && (
            <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded text-[10px]">
              Opencode.mp4 • 1.5 ГБ
            </span>
          )}
        </div>

        {/* Playback Engine Switcher */}
        <div className="flex items-center gap-2">
          {canDirectStream && (
            <div className="flex items-center bg-neutral-950 border border-neutral-800 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setPlaybackMode('stream');
                  setHasStreamError(false);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  playbackMode === 'stream'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Мгновенный прямой видеопоток без блокировок и ожидания"
              >
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Мгновенный HD поток</span>
              </button>

              <button
                type="button"
                onClick={() => setPlaybackMode('iframe')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  playbackMode === 'iframe'
                    ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Оригинальный встроенный плеер"
              >
                <Tv className="w-3 h-3" />
                <span>Google Плеер</span>
              </button>
            </div>
          )}

          <button
            onClick={handleReload}
            title="Перезагрузить плеер"
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenPopup}
            title="Открыть плеер в отдельном окне"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded text-[11px] transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">В окно</span>
          </button>
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {/* Instant HTML5 Video Player */}
        {playbackMode === 'stream' && videoInfo.streamUrl && !hasStreamError ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              key={`${videoInfo.streamUrl}-${reloadKey}`}
              src={videoInfo.streamUrl}
              controls
              playsInline
              preload="metadata"
              onLoadedMetadata={() => setIsVideoLoading(false)}
              onCanPlay={() => setIsVideoLoading(false)}
              onWaiting={() => setIsVideoLoading(true)}
              onPlaying={() => setIsVideoLoading(false)}
              onError={(e) => {
                console.warn('Native video stream error, switching to fallback:', e);
                setHasStreamError(true);
                setIsVideoLoading(false);
              }}
              className="w-full h-full object-contain bg-black z-10"
            >
              Ваш браузер не поддерживает встроенное воспроизведение MP4 видео.
            </video>

            {/* Video Loading Spinner Overlay */}
            {isVideoLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none transition-opacity">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <span className="text-xs font-mono text-neutral-300">
                  Мгновенная буферизация HD видео...
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Iframe or Fallback Player */
          <div className="w-full h-full flex items-center justify-center bg-neutral-900">
            {videoInfo.embedUrl ? (
              <iframe
                key={`${videoInfo.embedUrl}-${reloadKey}`}
                src={videoInfo.embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0 bg-neutral-950"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Play className="w-12 h-12 text-neutral-600 mb-3" />
                <p className="text-sm text-neutral-300 font-mono">
                  Видео недоступно для встроенного плеера
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-xs rounded hover:bg-neutral-200 transition-colors"
                >
                  <span>Открыть источник</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stream Performance Badge */}
      {playbackMode === 'stream' && !hasStreamError && (
        <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Активен мгновенный HTML5 видеопоток</span>
            <span className="text-neutral-500 hidden sm:inline">• Частичная загрузка (HTTP 206)</span>
          </div>
          <span className="text-neutral-500">
            Перемотка и управление скоростью (0.5x–2x)
          </span>
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="p-3.5 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {isDriveVideo ? (
            <a
              href={videoInfo.viewUrl || url}
              target="_blank"
              rel="noopener noreferrer"
              id="open-drive-video-btn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Смотреть в Google Диске</span>
            </a>
          ) : (
            <a
              href={videoInfo.viewUrl || url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Смотреть в источнике</span>
            </a>
          )}

          {videoInfo.downloadUrl && (
            <a
              href={videoInfo.directDownloadUrl || videoInfo.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Скачать исходный видеофайл"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать</span>
            </a>
          )}

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Ссылка</span>
              </>
            )}
          </button>
        </div>

        {isDriveVideo && (
          <button
            onClick={() => setShowDriveHelper(!showDriveHelper)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showDriveHelper ? 'Скрыть подсказку' : 'Как работает оптимизация?'}</span>
          </button>
        )}
      </div>

      {/* Optimization & Helper Information Box */}
      {isDriveVideo && showDriveHelper && (
        <div className="p-4 bg-neutral-900/60 border-t border-neutral-800/80 text-xs font-mono text-neutral-300 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Оптимизация мгновенного воспроизведения для Google Диска:</span>
          </div>

          <ul className="list-disc pl-5 space-y-1 text-neutral-400 text-[11px] leading-relaxed">
            <li>
              <strong className="text-neutral-200">Мгновенный HD поток:</strong> Видеофайл <code className="text-neutral-300">Opencode.mp4</code> передается напрямую через локальный стриминговый прокси частями (HTTP 206 Partial Content). Вы можете мгновенно перематывать видео в любую точку без скачивания всех 1.5 ГБ.
            </li>
            <li>
              <strong className="text-neutral-200">Без блокировок Cookies:</strong> Воспроизведение идет через нативный HTML5 плеер, обходя ограничения сторонних cookies браузеров Chrome и Safari.
            </li>
            <li>
              <strong className="text-neutral-200">Переключение режима:</strong> Вы можете в любой момент переключиться на стандартный Google Плеер кнопкой наверху или открыть видео в отдельной вкладке Google Диска.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
