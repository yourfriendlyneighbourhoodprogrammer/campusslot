export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server did not respond correctly. Please try again.");
  }
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
export const post = (path, body = {}) =>
  api(path, { method: "POST", body: JSON.stringify(body) });
export const dateInIndia = (date = new Date()) =>
  date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
export const displayTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
export const hourLabel = (h) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
