import { createElement } from 'react';
import { ExternalLink, Briefcase } from 'lucide-react';

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

function JobLink({ title, url, company, location }) {
  const domain = getDomain(url);
  return createElement(
    'a',
    {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'group flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.07] hover:border-[#7C83DB]/50 transition-colors no-underline',
    },
    <div className="min-w-0" key="info">
      <div className="text-[14px] font-medium text-white leading-snug truncate group-hover:text-[#7C83DB] transition-colors">
        {title}
      </div>
      <div className="text-[12px] text-gray-400 mt-0.5 truncate">
        {[company, location, domain].filter(Boolean).join(' · ')}
      </div>
    </div>,
    <span
      key="cta"
      className="flex items-center gap-1 shrink-0 text-[12.5px] font-medium text-[#7C83DB] rounded-full px-2.5 py-1 bg-[#7C83DB]/10 group-hover:bg-[#7C83DB]/20 transition-colors"
    >
      Apply
      <ExternalLink size={12} />
    </span>
  );
}

export default function JobLinksCard({ jobs = [] }) {
  if (!jobs.length) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0F0F12] p-4 my-3">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase size={15} className="text-[#7C83DB]" />
        <span className="text-[13px] font-medium text-gray-300">Jobs found</span>
        <span className="text-[12px] text-gray-500">({jobs.length})</span>
      </div>
      <div className="flex flex-col gap-2">
        {jobs.map((job, i) => (
          <JobLink key={job.url || i} {...job} />
        ))}
      </div>
    </div>
  );
}