import React from 'react';
import Layout from '../components/Layout';

const PrivacyPage: React.FC = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">What we collect</h2>
        <p className="text-muted-foreground">
          We collect your name, email address, and profile information when you register.
          For developers, we also collect skills, availability, and payment verification status.
          We store help request content and ticket communications to facilitate sessions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">How we use it</h2>
        <p className="text-muted-foreground">
          Your data is used solely to operate the ProdSupport marketplace — matching clients
          with developers, sending notifications, and processing payments. We do not sell
          your data to third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Secure notes</h2>
        <p className="text-muted-foreground">
          When you share credentials via our secure note feature, the content is encrypted
          in your browser using AES-256-GCM before transmission. Our servers only store
          ciphertext and cannot read the plaintext.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Payments</h2>
        <p className="text-muted-foreground">
          Payments are processed by Stripe. We do not store card details. For questions,
          email{' '}
          <a href="mailto:hello@prod-support.com" className="text-primary underline">
            hello@prod-support.com
          </a>
        </p>
      </section>
    </div>
  </Layout>
);

export default PrivacyPage;
