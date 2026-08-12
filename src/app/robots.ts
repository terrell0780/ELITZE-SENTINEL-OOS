import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/settings', '/enterprise/billing'],
    },
    sitemap: 'https://www.elitze.ca/sitemap.xml',
  };
}
