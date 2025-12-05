import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (device, qty) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === device.id);
      if (existing) {
        return prev.map(p =>
          p.id === device.id ? { ...p, qty: p.qty + qty } : p
        );
      }
      return [...prev, { ...device, qty }];
    });
  };

  const totals = cart.reduce(
    (acc, item) => {
      acc.upfront += item.price_usd * item.qty + item.install_cost_usd;
      acc.monthly += item.monthly_fee_usd * item.qty;
      return acc;
    },
    { upfront: 0, monthly: 0 }
  );

  return (
    <CartContext.Provider value={{ cart, addToCart, totals }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
import { useCart } from "../context/CartContext";

const { cart } = useCart();
const deviceCount = cart.reduce((sum, d) => sum + d.qty, 0);
