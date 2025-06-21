export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("9xbuddy Worker active", { status: 200 });
    }

    if (url.pathname === "/decrypt") {
      return await handleDecrypt(request);
    }

    if (url.pathname === "/debug-html") {
      return await handleDebugHtml(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleDebugHtml(request) {
  try {
    const { encryptedUrl } = await request.json();

    if (!encryptedUrl) {
      return new Response(
        JSON.stringify({ error: "Missing 'encryptedUrl'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const processUrl = `https://9xbuddy.com/process?url=${encodeURIComponent(encryptedUrl)}`;
    const res = await fetch(processUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CFWorkerBot/1.0)",
      },
    });

    const html = await res.text();
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function handleDecrypt(request) {
  try {
    const { encryptedUrl } = await request.json();

    if (!encryptedUrl) {
      return new Response(
        JSON.stringify({ error: "Missing 'encryptedUrl'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const processUrl = `https://9xbuddy.com/process?url=${encodeURIComponent(encryptedUrl)}`;
    const res = await fetch(processUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CFWorkerBot/1.0)",
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to load 9xbuddy page" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const html = await res.text();

    // 🔁 Ganti regex agar tidak tergantung ekstensi file
    const videoLinks = extractVideoLinks(html);

    if (videoLinks.length === 0) {
      return new Response(
        JSON.stringify({ error: "No video links found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
        data: {
          decryptedUrl: videoLinks[0],
          allLinks: videoLinks,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Fungsi baru: ekstrak semua link yang mungkin adalah video
function extractVideoLinks(html) {
  const regex = /https?:\/\/(?:[^\s"']+)/gi;

  // Ambil semua link yang ditemukan
  const matches = html.match(regex) || [];

  // Filter hanya link yang mengandung pola mirip video
  const videoPatterns = [
    "c2\\.9xbud\\.com\\/v\\/",
    "o4\\.9xbud\\.com\\/v\\/",
    "files\\.video-src\\.com\\/media\\/video\\/.*?\\d+",
    "\\/v\\/[-a-zA-Z0-9]+",
    "\\/video\\/[-a-zA-Z0-9]+"
  ];

  const filtered = matches.filter(link => {
    return videoPatterns.some(pattern => {
      try {
        const re = new RegExp(pattern, "i");
        return re.test(link);
      } catch {
        return false;
      }
    });
  });

  // Hilangkan duplikasi
  return [...new Set(filtered)];
}
