import ClientPage from './ClientPage';

// Required by Next.js output: 'export' for dynamic routes.
export function generateStaticParams() {
  return [{ slug: '_placeholder' }];
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ClientPage params={params} />;
}
