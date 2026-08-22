import React, { useEffect, useRef } from "react";
import {
  Share2,
  Pencil,
  ExternalLink,
  Pin,
  PinOff,
  Star,
  FolderInput,
  FolderPlus,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";

/**
 * ConversationMenu
 * Dropdown menu for a single sidebar conversation/session row.
 * Rendered conditionally by Sidebar.jsx when openMenuFor === session.id.
 */
export default function ConversationMenu({
  session,
  projects = [],
  onClose,
  onShare,
  onRename,
  onOpenNewTab,
  onTogglePin,
  onToggleFavorite,
  onMoveToProject,
  onCreateProject,
  onArchive,
  onDelete,
}) {
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!session) return null;

  const isPinned = !!session.pinned;
  const isFavorite = !!session.favorite;
  const isArchived = !!session.archived;

  const item = (icon, label, onClick, extraClass = "") => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
        onClose?.();
      }}
      className={`flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-gray-200 hover:bg-white/[0.06] hover:text-white rounded-md transition-colors text-left ${extraClass}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-1.5 top-full mt-1 z-50 w-56 rounded-xl border border-white/[0.08] bg-[#141413] shadow-2xl shadow-black/40 py-1.5 backdrop-blur-sm"
      style={{ backgroundColor: "#141413" }}
    >
      {item(<Pencil size={14} />, "Rename", () => onRename(session.id))}

      {item(<Share2 size={14} />, "Share", () => onShare(session.id))}

      {item(<ExternalLink size={14} />, "Open in new tab", () =>
        onOpenNewTab(session.id)
      )}

      <div className="my-1 h-px bg-white/[0.06]" />

      {item(
        isPinned ? <PinOff size={14} /> : <Pin size={14} />,
        isPinned ? "Unpin" : "Pin",
        () => onTogglePin(session.id, !isPinned)
      )}

      {item(
        <Star
          size={14}
          fill={isFavorite ? "currentColor" : "none"}
          className={isFavorite ? "text-[#CC785C]" : ""}
        />,
        isFavorite ? "Remove from favorites" : "Add to favorites",
        () => onToggleFavorite(session.id, !isFavorite)
      )}

      <div className="my-1 h-px bg-white/[0.06]" />

      {/* Move to project submenu-lite: list projects inline */}
      {projects.length > 0 && (
        <div className="px-3 pt-1 pb-0.5 text-[11px] uppercase tracking-wide text-gray-500">
          Move to project
        </div>
      )}
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={(e) => {
            e.stopPropagation();
            onMoveToProject(session.id, p.id);
            onClose?.();
          }}
          className={`flex items-center gap-2.5 w-full px-3 py-1.5 text-[13px] rounded-md transition-colors text-left ${
            session.projectId === p.id
              ? "text-[#7C83DB]"
              : "text-gray-300 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <FolderInput size={13} />
          <span className="truncate">{p.name}</span>
        </button>
      ))}

      {item(<FolderPlus size={14} />, "New project…", () => onCreateProject())}

      <div className="my-1 h-px bg-white/[0.06]" />

      {item(
        isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />,
        isArchived ? "Unarchive" : "Archive",
        () => onArchive(session.id, !isArchived)
      )}

      {item(
        <Trash2 size={14} className="text-red-400" />,
        "Delete",
        () => onDelete(session.id),
        "text-red-400 hover:text-red-300"
      )}
    </div>
  );
}