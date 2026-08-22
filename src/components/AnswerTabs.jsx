export default function AnswerTabs({ active = 'answer', onChange, linkCount = 0, imageCount = 0 }) {
  const tabs = [
    { key: 'answer', label: 'Answer' },
    { key: 'links', label: 'Links', count: linkCount },
    { key: 'images', label: 'Images', count: imageCount },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-white/[0.06] mb-4">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange?.(t.key)}
          className={`relative pb-2.5 text-[14px] font-medium transition-colors ${
            active === t.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {t.label}
          {active === t.key && (
            <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#7C83DB] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}