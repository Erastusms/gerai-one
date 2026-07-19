import CheckoutDetailClient from "./checkout-detail-client";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function Page({ params }: PageProps) {
  const { orderNumber } = await params;
  return <CheckoutDetailClient orderNumber={orderNumber} />;
}
