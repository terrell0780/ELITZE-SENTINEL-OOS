import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.elitze.ca';

  // These are the main public and app routes
  const routes = [
    '',
    '/chat',
    '/dashboard',
    '/intelligence',
    '/global-search',
    '/studio',
    '/code',
    '/refactor',
    '/cli',
    '/runtime',
    '/voice',
    '/swarm',
    '/lindy',
    '/workflows',
    '/security',
    '/threat-intel',
    '/media',
    '/image-to-video',
    '/visual',
    '/gaming',
    '/world',
    '/sales',
    '/leadgen',
    '/marketplace',
    '/enterprise',
    '/collaboration',
    '/integrations',
    '/settings',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
