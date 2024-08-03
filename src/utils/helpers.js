export const getTimeString = (ts) => {
  const diff = (Date.now() - ts) / 1000;
  if (diff > 86400) return `${Math.floor(diff / 86400)} days ago`;
  if (diff > 3600) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff > 60) return `${Math.floor(diff / 60)} minutes ago`;
  return diff < 10 ? 'now' : `${Math.floor(diff)} seconds ago`;
};
