import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body;
  const token = process.env.GITHUB_TOKEN;

  if (!domain || !token) {
    return res.status(400).json({ error: 'Missing domain or token' });
  }

  const normalized = domain.replace(/^www\./, '').toLowerCase();
  const yamlPath = path.join(process.cwd(), 'my-local-rules.yaml');

  let rules;
  try {
    const file = fs.readFileSync(yamlPath, 'utf8');
    rules = yaml.load(file);

    if (!Array.isArray(rules?.payload)) {
      return res.status(500).json({ error: 'YAML повреждён или не содержит payload' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка при чтении YAML' });
  }

  const exists = rules.payload.some(rule => rule === `'+.${normalized}'`);
  if (exists) {
    return res.status(409).json({ error: 'Домен уже в списке' });
  }

  // Создание issue
  try {
    const response = await fetch(`https://api.github.com/repos/neosalixaion/my-local-rules/issues`, {
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
      res.status(response.status).json({ error: error.message || 'Ошибка при создании issue' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при подключении к GitHub' });
  }
}
