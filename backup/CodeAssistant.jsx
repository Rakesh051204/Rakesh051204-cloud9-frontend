import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://codezaro-backend-7.onrender.com";

function CodeAssistant() {
  const [task, setTask] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [prStatus, setPrStatus] = useState("idle");
  const [prUrl, setPrUrl] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prBody, setPrBody] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/agent/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post(
        `${API_BASE_URL}/agent/sessions`,
        { task, repo_url: repoUrl || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newSession = res.data;
      setSessions([newSession, ...sessions]);
      setSelectedSessionId(newSession.session_id);
      setTask("");
      setRepoUrl("");
      setShowCreateForm(false);
      setLoading(false);
    } catch (err) {
      setError("Failed to create session");
      setLoading(false);
    }
  };

  const handleRunAgent = async () => {
    if (!selectedSessionId) {
      setError("Please select or create a session first.");
      return;
    }
    setLoading(true);
    setError("");
    setSteps([]);
    setPendingAction(null);
    setPrStatus("idle");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/agent/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          task: sessions.find((s) => s.id === selectedSessionId)?.task || "",
          session_id: selectedSessionId,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.substring(6));
            if (data.done) {
              setLoading(false);
              fetchSessions();
              break;
            }
            if (data.type === "action_proposed") {
              setPendingAction({
                action_id: data.action_id,
                tool: data.tool,
                params: data.params,
              });
            } else if (data.type === "tool_result") {
              setSteps((prev) => {
                const newSteps = [...prev];
                if (newSteps.length > 0) {
                  newSteps[newSteps.length - 1].result = data.result;
                }
                return newSteps;
              });
            } else if (data.type === "action_rejected") {
              setSteps((prev) => {
                const newSteps = [...prev];
                if (newSteps.length > 0) {
                  newSteps[newSteps.length - 1].rejected = true;
                }
                return newSteps;
              });
            } else if (data.decision) {
              setSteps((prev) => [...prev, data.decision]);
            }
          }
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleApprove = async (approved) => {
    if (!pendingAction) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE_URL}/agent/approve`,
        { action_id: pendingAction.action_id, approved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingAction(null);
    } catch (err) {
      console.error(err);
      setError("Failed to send approval decision.");
    }
  };

  const handleCreatePR = async () => {
    if (!selectedSessionId) {
      setError("No session selected.");
      return;
    }
    setPrStatus("loading");
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post(
        `${API_BASE_URL}/agent/pr`,
        {
          session_id: selectedSessionId,
          title: prTitle || "CodeZaro agent changes",
          body: prBody || "Automated changes from CodeZaro agent",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrUrl(res.data.pr_url);
      setPrStatus("success");
    } catch (err) {
      setPrStatus("error");
      setError(err.response?.data?.detail || "Failed to create PR");
    }
  };

  return (
    <div className="h-full bg-white dark:bg-[#1F1F1F] text-gray-900 dark:text-white p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Code Assistant</h2>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            className="flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-[#0D0D0D] border border-gray-300 dark:border-[#3D3D3D] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
          >
            <option value="">Select session</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                #{s.id} – {s.task?.slice(0, 20)} ({s.status})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="text-[#0078D4] hover:underline text-sm"
          >
            {showCreateForm ? "Cancel" : "+ New"}
          </button>
          <button
            onClick={handleRunAgent}
            disabled={loading || !selectedSessionId}
            className="px-4 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-md text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Running..." : "Run"}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateSession} className="space-y-2">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Task description"
              className="w-full px-3 py-2 bg-white dark:bg-[#0D0D0D] border border-gray-300 dark:border-[#3D3D3D] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              required
            />
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Repo URL (optional)"
              className="w-full px-3 py-2 bg-white dark:bg-[#0D0D0D] border border-gray-300 dark:border-[#3D3D3D] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              Create Session
            </button>
          </form>
        )}

        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
        {loading && <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">Agent is thinking...</p>}

        {pendingAction && (
          <div className="border border-yellow-300 dark:border-yellow-700 p-4 rounded-md bg-yellow-50 dark:bg-yellow-950/30">
            <p className="text-sm font-semibold">Proposed Action</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Tool:</span> {pendingAction.tool}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Params:</span> {JSON.stringify(pendingAction.params)}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleApprove(true)}
                className="px-4 py-1 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-md text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => handleApprove(false)}
                className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {steps.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Steps</h3>
            {steps.map((step, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-[#3D3D3D] p-3 rounded-md bg-gray-50 dark:bg-[#2D2D2D]">
                <div className="flex items-start gap-2">
                  <span className="text-[#0078D4] font-mono text-xs">#{idx+1}</span>
                  <div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Thought:</span> {step.thought || "—"}
                    </p>
                    {step.action && (
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        <span className="font-medium">Action:</span> {step.action}
                        {step.action_input && (
                          <span className="text-gray-500 dark:text-gray-400 ml-1">
                            {JSON.stringify(step.action_input)}
                          </span>
                        )}
                      </p>
                    )}
                    {step.result && (
                      <p className="text-xs text-green-700 dark:text-green-400">
                        <span className="font-medium">Result:</span> {step.result}
                      </p>
                    )}
                    {step.rejected && <p className="text-xs text-red-600 dark:text-red-400">⛔ Rejected</p>}
                    {step.stop && <p className="text-xs text-green-700 dark:text-green-400">✅ Task complete</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedSessionId && (
          <div className="border-t border-gray-200 dark:border-[#3D3D3D] pt-4 mt-2">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="PR title"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                className="flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-[#0D0D0D] border border-gray-300 dark:border-[#3D3D3D] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              />
              <input
                type="text"
                placeholder="PR body"
                value={prBody}
                onChange={(e) => setPrBody(e.target.value)}
                className="flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-[#0D0D0D] border border-gray-300 dark:border-[#3D3D3D] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              />
              <button
                onClick={handleCreatePR}
                disabled={prStatus === "loading"}
                className="px-4 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-md text-sm font-medium transition disabled:opacity-50"
              >
                {prStatus === "loading" ? "Creating..." : "Create PR"}
              </button>
            </div>
            {prStatus === "success" && prUrl && (
              <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                ✅ <a href={prUrl} target="_blank" rel="noopener noreferrer" className="text-[#0078D4] hover:underline">{prUrl}</a>
              </p>
            )}
            {prStatus === "error" && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">❌ Failed to create PR</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeAssistant;