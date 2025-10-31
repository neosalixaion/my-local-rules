export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body;
  const token = process.env.GITHUB_TOKEN;

  if (!domain || !token) {
    return res.status(400).json({ error: 'Missing domain or token' });
  }

  const response = await fetch('https://api.github.com/repos/neosalixaion/my-local-rules/issues', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      title: `Добавить: ${domain}`,
      body: `Пожалуйста, добавьте домен ${domain} в my-local-rules.yaml`,
    }),
  });

  if (response.ok) {
    res.status(200).json({ success: true });
  } else {
    const error = await response.json();
    res.status(response.status).json({ error: error.message || 'GitHub issue creation failed' });
  }
}
