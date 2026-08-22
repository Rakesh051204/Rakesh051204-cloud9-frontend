// src/components/discover/DiscoverSubNav.jsx
import styles from "./DiscoverFeed.module.css";

const TABS = [
  { key: "forYou", label: "For You" },
  { key: "top", label: "Top" },
  { key: "topics", label: "Topics" },
];

export default function DiscoverSubNav({ activeTab, onChange }) {
  return (
    <div className={styles.subNav}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.subNavItem} ${
            activeTab === tab.key ? styles.subNavItemActive : ""
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}