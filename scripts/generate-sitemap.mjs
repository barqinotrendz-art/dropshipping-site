import { SitemapStream, streamToPromise } from 'sitemap'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const hostname = 'https://dropshipping-site-xi.vercel.app'

const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/products', changefreq: 'daily', priority: 0.9 },
  { url: '/products/electronics', changefreq: 'weekly', priority: 0.7 },
  { url: '/products/fashion', changefreq: 'weekly', priority: 0.7 },
  { url: '/products/watches', changefreq: 'weekly', priority: 0.7 },
  { url: '/products/home-essentials', changefreq: 'weekly', priority: 0.7 },
  { url: '/about', changefreq: 'monthly', priority: 0.6 },
  { url: '/contact', changefreq: 'monthly', priority: 0.6 }
]

const sitemap = new SitemapStream({ hostname })

const distDir = resolve(process.cwd(), 'dist')
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

const sitemapPath = resolve(distDir, 'sitemap.xml')
const writeStream = createWriteStream(sitemapPath)

links.forEach((link) => sitemap.write(link))
sitemap.end()

try {
  const data = await streamToPromise(sitemap)
  writeStream.write(data)
  writeStream.end()
  console.log('Sitemap generated at', sitemapPath)
} catch (error) {
  console.error('Error generating sitemap:', error)
  process.exitCode = 1
}
