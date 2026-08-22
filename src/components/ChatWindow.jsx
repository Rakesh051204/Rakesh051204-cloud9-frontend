import { ConversationNavigator, useActiveMessageTracking } from "./ConversationNavigator";
const refs = useRef({});
const [activeId, setActiveId] = useState(messages[0]?.id);

useActiveMessageTracking("stoic-scroll", refs, setActiveId);

const handleJump = useCallback((id) => {
  setActiveId(id);
  refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
}, []);