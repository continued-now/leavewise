interface ReadingTimeProps {
  minutes: number;
  locale: 'en' | 'ko';
}

export default function ReadingTime({ minutes, locale }: ReadingTimeProps) {
  const label = locale === 'ko' ? `${minutes}분 읽기` : `${minutes} min read`;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
      {label}
    </span>
  );
}
