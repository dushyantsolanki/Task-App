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
  image = 'https://taskmate.dushyantportfolio.store/og.png',
  // type = 'website',
}: SEOProps) {
  return (
    <Helmet>
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={'TaskMate'} />
    </Helmet>
  );
}
