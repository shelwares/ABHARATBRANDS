import { getOrderDetails } from "@/lib/actions/dashboard";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = await params;
  const order = await getOrderDetails(resolvedParams.orderId);

  if (!order) {
    notFound();
  }

  const total = order.quantity * order.unit_price_at_join + order.logistics_fee_applied;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/dashboard/orders" className="text-indigo-600 text-sm">
        ← Back to Orders
      </Link>
      <h1 className="text-2xl font-bold mt-4">Order Details</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 mt-4 space-y-4">
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
        <div className="flex justify-between pt-2">
          <span>Status</span>
          <span className="capitalize bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {order.status}
          </span>
        </div>
      </div>
    </div>
  );
}
