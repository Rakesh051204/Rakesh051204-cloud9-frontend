import { useState } from "react";
import Sidebar from "./Sidebar";
import SearchPanel from "./SearchPanel";

export default function AppShellExample() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0B0B0D" }}>
      <Sidebar onOpenSearch={() => setSearchOpen(true)} />

      <main style={{ flex: 1 }}>{/* your existing chat/answer area */}</main>

      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNewSearch={() => {
          setSearchOpen(false);
          // navigate to fresh chat
        }}
        onSelect={(item) => {
          setSearchOpen(false);
          // load conversation by item.id
        }}
      />
    </div>
  );
}