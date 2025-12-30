interface YouTubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

/**
 * Componente para embedar vídeos do YouTube
 * Aceita URLs no formato:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function YouTubeEmbed({ url, title = "YouTube video", className = "" }: YouTubeEmbedProps) {
  // Extrair o ID do vídeo da URL
  const getVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      
      // youtube.com/watch?v=VIDEO_ID
      if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
        return urlObj.searchParams.get('v');
      }
      
      // youtu.be/VIDEO_ID
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      
      // youtube.com/embed/VIDEO_ID
      if (urlObj.pathname.startsWith('/embed/')) {
        return urlObj.pathname.split('/embed/')[1];
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const videoId = getVideoId(url);

  if (!videoId) {
    return (
      <div className={`bg-muted rounded-lg p-8 text-center ${className}`}>
        <p className="text-muted-foreground">URL de vídeo inválida</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
