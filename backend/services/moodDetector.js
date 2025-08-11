import axios from "axios";

export async function detectMood(text) {
  const res = await axios.post(
    process.env.HF_MODEL_URL,
    { inputs: text },
    { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
  );
  const emotion = res.data[0]?.label ?? "neutral";
  const confidence = res.data[0]?.score ?? 0;
  return { emotion, confidence };
}
