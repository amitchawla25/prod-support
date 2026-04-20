import React from 'react';
import Layout from '../components/Layout';

const AboutPage: React.FC = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">About ProdSupport</h1>
      <p className="text-muted-foreground mb-4">
        ProdSupport connects vibe coders and early-stage builders with experienced developers
        who can unblock them fast — no long contracts, no guessing games.
      </p>
      <p className="text-muted-foreground mb-4">
        You describe what you're stuck on, a verified developer applies, you approve them,
        and they help you ship. Simple.
      </p>
      <p className="text-muted-foreground">
        Have questions? Email us at{' '}
        <a href="mailto:hello@prod-support.com" className="text-primary underline">
          hello@prod-support.com
        </a>
      </p>
    </div>
  </Layout>
);

export default AboutPage;
