if (url.pathname === "/debug-html") {
  const { encryptedUrl } = await request.json();
  const processUrl = `https://9xbuddy.com/process?url=${encodeURIComponent(encryptedUrl)}`;
  const res = await fetch(processUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CFWorkerBot/1.0)"
    }
  });
  const html = await res.text();
  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
