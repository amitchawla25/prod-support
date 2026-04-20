import React from 'react';
import Layout from '../components/Layout';

const TermsPage: React.FC = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Using ProdSupport</h2>
        <p className="text-muted-foreground">
          ProdSupport is a marketplace that connects clients with freelance developers.
          By creating an account, you agree to use the platform lawfully and in good faith.
          You are responsible for the accuracy of information you provide.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Developer verification</h2>
        <p className="text-muted-foreground">
          Developers pay a one-time verification fee of $29.99 to be listed on the marketplace.
          This fee is non-refundable unless the payment failed to process correctly.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Content and conduct</h2>
        <p className="text-muted-foreground">
          You may not use ProdSupport to share malicious code, engage in fraud, harass
          other users, or violate any applicable law. We reserve the right to suspend
          accounts that violate these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Limitation of liability</h2>
        <p className="text-muted-foreground">
          ProdSupport facilitates connections but is not a party to the work agreement
          between clients and developers. We are not liable for the quality, timeliness,
          or outcome of any session.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Contact</h2>
        <p className="text-muted-foreground">
          Questions about these terms? Email{' '}
          <a href="mailto:hello@prod-support.com" className="text-primary underline">
            hello@prod-support.com
          </a>
        </p>
      </section>
    </div>
  </Layout>
);

export default TermsPage;
