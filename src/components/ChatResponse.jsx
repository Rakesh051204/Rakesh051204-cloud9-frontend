// src/components/ChatResponse.jsx
import React from 'react';
import AnswerCard from './AnswerCard';

export default function ChatResponse({ responseData, isLoading, onFollowUpClick, onOpenPanel, query }) {
  if (isLoading) {
    return (
      <div className="w-full max-w-[720px] mx-auto animate-pulse space-y-4">
        <div className="h-[180px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl w-full" />
        <div className="space-y-2">
          <div className="h-4 bg-[#1a1a1a] rounded w-3/4" />
          <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!responseData) return null;

  return (
    <div className="w-full py-4 transition-all duration-300">
      <AnswerCard
        content={responseData.content || responseData.answer || ''}
        sources={responseData.sources || []}
        followUps={responseData.followUps || []}
        onFollowUpClick={onFollowUpClick}
        onOpenPanel={onOpenPanel}
        userQuery={query || responseData.query} // <-- Pass query fallback here
      />
    </div>
  );
}