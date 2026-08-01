// Step 1 of the GitHub OAuth flow for Decap CMS.
// Sends Robert to GitHub to approve, then GitHub returns to callback.js.
exports.handler = async () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.URL}/.netlify/functions/callback`;
  const url =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${clientId}` +
    "&scope=repo" +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  return { statusCode: 302, headers: { Location: url } };
};
