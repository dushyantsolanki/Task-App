import { Helmet } from 'react-helmet';
interface SEOProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
}

export default function SEO({
  title,
  description,
  url = 'https://taskmate.dushyantportfolio.store/login',
  image = '/public/og.png',
  type = 'website',
}: SEOProps) {
  return (
    <Helmet>
      {/* Standard tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
    </Helmet>
  );
}
