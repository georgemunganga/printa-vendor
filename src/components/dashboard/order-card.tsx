import React from "react";
import { ChevronRight, Navigation, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PrintJob } from "@/types";
import { OrderMoney, OrderStatusBadge } from "@/components/dashboard/order";

interface OrderCardProps {
  order: PrintJob;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const canTrack = order.status === "printing" || order.status === "ready";

  const handleTrackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/dashboard/tracking/${order.id}`);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/dashboard/chat/${order.id}`);
  };

  return (
    <Link
      to={`/dashboard/job/${order.id}`}
      className="block w-full bg-white rounded-2xl border border-gray-100 active:bg-gray-50 transition-colors"
    >
      <div className="p-4">
        {/* Top: Status + Price */}
        <div className="flex items-center justify-between mb-3">
          <OrderStatusBadge status={order.status} withIcon className="py-1.5" />
          <OrderMoney amount={order.totalPrice} currency={order.currency} className="text-lg font-bold text-gray-900" />
        </div>

        {/* Middle: File name + details */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {order.fileName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {order.pageCount} pages · {order.copies} {order.copies === 1 ? 'copy' : 'copies'} · {order.colorMode === "color" ? "Color" : "B&W"}
          </p>
        </div>

        {/* Bottom: Order ID + Date + Track/Arrow */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium">{order.id}</span>
            <span>·</span>
            <span>
              {order.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleChatClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              <MessageCircle size={12} />
              Chat
            </button>
            {canTrack && (
              <button
                onClick={handleTrackClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-printa-red text-white text-xs font-semibold hover:bg-printa-red/90 transition-colors"
              >
                <Navigation size={12} />
                Track
              </button>
            )}
            <ChevronRight size={20} className="text-gray-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};
