/**
 * Worker that gets triggered via nin.sh
 */

export default {
  async fetch(request) {
    // Regex grabs last 5 - 8 characters
    const shortCode = request?.url.match(/\/([^\/]{5,8})$/)?.[1] ?? "";
    if (shortCode) {
      const apiRes = await fetch("https://api.shrink.ninja", {
        method: "POST",
        body: JSON.stringify({ shortCode: shortCode }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (apiRes.ok) {
        const apiResJson = await apiRes.json();
        if (apiResJson.LongUrl) {
          console.log(`[+] Shortcode: ${shortCode} visited.`);
          return Response.redirect(apiResJson.LongUrl);
        }
      } else {
        console.log(`[-] Bad API Response: ${apiRes}`);
      }
    }
    return Response.redirect(`https://shrink.ninja`);
  },
};
