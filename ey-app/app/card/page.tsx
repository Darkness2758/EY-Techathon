"use client";
import { useCart } from "@/card/CardContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, totalPrice } = useCart();

  if (cart.length === 0) {
    return <p className="text-center mt-20">Your cart is empty</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl mb-6">Your Cart</h1>

      {cart.map((item) => (
        <div
          key={`${item.id}-${item.size}`}
          className="flex justify-between items-center border-b py-4"
        >
          <div>
            <h2 className="font-semibold">{item.name}</h2>
            <p>Size: {item.size}</p>
            <p>₹{item.price}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateQty(item.id, item.size, item.qty - 1)
              }
              className="px-2 border"
            >
              −
            </button>

            <span>{item.qty}</span>

            <button
              onClick={() =>
                updateQty(item.id, item.size, item.qty + 1)
              }
              className="px-2 border"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.id, item.size)}
            className="text-red-500"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="mt-6 flex justify-between text-xl">
        <span>Total</span>
        <span>₹{totalPrice}</span>
      </div>

      <button className="w-full mt-6 bg-black text-white py-3">
        Checkout
      </button>
    </div>
  );
}
