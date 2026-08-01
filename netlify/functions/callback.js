// Step 2 of the GitHub OAuth flow for Decap CMS.
// Exchanges the code for a token and hands it back to the CMS window.
exports.handler = async (event) => {
  const code = (event.queryStringParameters || {}).code;
  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await res.json();
    const ok = !!data.access_token;
    const payload = ok
      ? { token: data.access_token, provider: "github" }
      : data;
    const status = ok ? "success" : "error";
    const html = `<!doctype html><html><body><script>
      (function () {
        function receive(e){ window.opener && window.opener.postMessage('authorization:github:${status}:${JSON.stringify(payload).replace(/</g,"\\u003c")}', e.origin); }
        window.addEventListener("message", receive, false);
        window.opener && window.opener.postMessage("authorizing:github", "*");
      })();
    </script><p>${ok ? "Login gelukt — je kunt dit venster sluiten." : "Inloggen mislukt."}</p></body></html>`;
    return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
  } catch (err) {
    return { statusCode: 500, body: "OAuth error: " + err.message };
  }
};
