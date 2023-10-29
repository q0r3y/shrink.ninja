/**
 * Worker that gets triggered via nin.sh
 */

export default {
  async fetch(request) {
    const shortCode = request.url.slice(`https://nin.sh/`.length);
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
        if (apiResJson.longUrl) {
          return Response.redirect(apiResJson.longUrl);
        }
      }
    }
    return Response.redirect(`https://shrink.ninja`);
  },
};
