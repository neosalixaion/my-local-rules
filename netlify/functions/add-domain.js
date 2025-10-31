export async function handler(event) {
  const { domain } = JSON.parse(event.body || '{}');
  const token = process.env.GITHUB_TOKEN;

  if (!domain || !token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing domain or token' }),
    };
  }

  const issue = await fetch('https://api.github.com/repos/neosalixaion/my-local-rules/issues', {
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

  return {
    statusCode: issue.ok ? 200 : issue.status,
    body: JSON.stringify({ success: issue.ok }),
  };
}
