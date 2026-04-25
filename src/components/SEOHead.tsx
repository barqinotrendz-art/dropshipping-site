import React from 'react'

type Props = {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  price?: number
  currency?: string
  availability?: 'in stock' | 'out of stock'
  brand?: string
  category?: string
}

const SEOHead: React.FC<Props> = ({
  title = 'Barqino - Your Online Shopping Destination',
  description = 'Discover a wide range of products from electronics, fashion, watches, home essentials, and more. Barqino delivers quality products fast, anywhere in the region, with reliable service.',
  keywords = 'barqino, online store, electronics, fashion, watches, home essentials, shopping online, dropshipping store',
  image = "https://dropshipping-site-xi.vercel.app//logo.png",
  url,
  type = 'website',
  price,
  currency = 'USD',
  availability = 'in stock',
  brand,
  category
}) => {
  const siteName = 'Barqino'
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`

  React.useEffect(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://dropshipping-site-xi.vercel.app/'
    const logoUrl = `${origin}/logo.png`
    const currentUrl =
      url || (typeof window !== 'undefined' ? window.location.href : origin)

    // Set document title
    document.title = fullTitle

    const setMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null
      if (!el) {
        const tagName: 'meta' | 'link' = selector.startsWith('meta') ? 'meta' : 'link'
        const created = document.createElement(tagName)
        document.head.appendChild(created)
        el = created as HTMLMetaElement | HTMLLinkElement
      }
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
      return el
    }

    const canonicalUrl = currentUrl.split('?')[0]
    setMeta('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl })
    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[name="keywords"]', { name: 'keywords', content: keywords })

    // OpenGraph
    setMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: currentUrl })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    setMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'en_US' })
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: siteName })

    // Twitter
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    const addJsonLd = (id: string, data: Record<string, unknown>) => {
      let script = document.getElementById(id) as HTMLScriptElement | null
      if (!script) {
        const created = document.createElement('script')
        created.type = 'application/ld+json'
        created.id = id
        document.head.appendChild(created)
        script = created
      }
      script.text = JSON.stringify(data)
      return script
    }

    const scripts: HTMLScriptElement[] = []

    // Product Schema
    if (type === 'product' && price) {
      scripts.push(
        addJsonLd('ld-product', {
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: title,
          description,
          image,
          brand: brand ? { '@type': 'Brand', name: brand } : { '@type': 'Brand', name: 'Barqino' },
          category: category || 'General',
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: currency,
            availability:
              availability === 'in stock'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: currentUrl,
            seller: { '@type': 'Organization', name: siteName },
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '152',
          },
        })
      )
    } else if (type === 'website') {
      scripts.push(
        addJsonLd('ld-website', {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteName,
          url: origin,
          description,
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${origin}/?search={search_term_string}` },
            'query-input': 'required name=search_term_string',
          },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '152' },
        })
      )
    }

    // Organization Schema
    scripts.push(
      addJsonLd('ld-org', {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Barqino',
        url: origin,
        logo: { '@type': 'ImageObject', url: logoUrl },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+123-456-7890',
            contactType: 'customer support',
            areaServed: 'Global',
            availableLanguage: 'English',
          },
        ],
        sameAs: [
          'https://facebook.com/barqino',
          'https://instagram.com/barqino',
          'https://twitter.com/barqino',
        ],
      })
    )

    return () => {
      scripts.forEach((s) => s && s.parentNode && s.parentNode.removeChild(s))
    }
  }, [
    fullTitle,
    title,
    description,
    keywords,
    image,
    url,
    type,
    price,
    currency,
    availability,
    brand,
    category,
  ])

  return null
}

export default SEOHead
