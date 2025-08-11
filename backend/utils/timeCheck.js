import Message from "../models/message.model.js";

export async function hasFiveMinutesPassed(userId) {
  const lastMsg = await Message.findOne({ user: userId }).sort({ createdAt: -1 });
  if (!lastMsg) return false;
  const diffMs = Date.now() - lastMsg.createdAt.getTime();
  return diffMs >= 5 * 60 * 1000;
}
