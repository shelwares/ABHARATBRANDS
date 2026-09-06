import { getOrderById } from "@/lib/actions/order";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = await params;
  const order = await getOrderById(resolvedParams.orderId);

  if (!order) {
    notFound();
  }

  const total = order.quantity * order.unit_price_at_join + order.logistics_fee_applied;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="flex justify-between">
          <span>Product</span>
          <span className="font-semibold">{order.pools?.products?.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Quantity</span>
          <span>{order.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span>Unit Price</span>
          <span>₹{order.unit_price_at_join}</span>
        </div>
        <div className="flex justify-between">
          <span>Logistics Fee</span>
          <span>₹{order.logistics_fee_applied}</span>
        </div>
        <div className="flex justify-between border-t pt-4 font-bold">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
        <Link
          href="/dashboard"
          className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
