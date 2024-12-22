/**
 * Worker that gets triggered via nin.sh
 */

export default {
  async fetch(request) {
    // Regex grabs last 5 - 8 characters
    const ShortCode = request?.url.match(/\/([^\/]{5,8})$/)?.[1] ?? "";
    if (ShortCode) {
      const apiRes = await fetch("https://api.shrink.ninja", {
        method: "POST",
        body: JSON.stringify({ ShortCode: ShortCode }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (apiRes.ok) {
        const apiResJson = await apiRes.json();
        if (apiResJson.LongUrl) {
          console.log(`[+] Shortcode: ${ShortCode} visited.`);
          return Response.redirect(apiResJson.LongUrl);
        }
      } else {
        console.log(`[-] Bad API Response: ${apiRes}`);
      }
    }
    return Response.redirect(`https://shrink.ninja`);
  },
};
