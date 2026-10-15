import { Browserbase } from "@browserbasehq/sdk";

const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY });

export async function startTakeover(req, res) {
  try {
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
    });

    const liveView = await bb.sessions.debug(session.id);

    res.json({
      sessionId: session.id,
      liveViewUrl: liveView.debuggerFullscreenUrl,
    });
  } catch (err) {
    console.error("Takeover session failed:", err);
    res.status(500).json({ error: "Failed to start takeover session" });
  }
}

export async function stopTakeover(req, res) {
  const { sessionId } = req.body;
  try {
    await bb.sessions.update(sessionId, { status: "REQUEST_RELEASE" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Takeover stop failed:", err);
    res.status(500).json({ error: "Failed to stop takeover session" });
  }
}
