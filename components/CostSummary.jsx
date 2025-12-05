import { useCart } from "../context/CartContext";

export default function CostSummary() {
  const { totals, cart } = useCart();

  if (!cart.length) return null;

  return (
    <aside className="summary-card">
      <h2>Your Smart Home Cost</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            {item.qty}× {item.brand} {item.model} = ${item.qty * item.price_usd}
          </li>
        ))}
      </ul>

      <hr />

      <p><strong>Upfront:</strong> ${totals.upfront.toFixed(2)}</p>
      <p><strong>Monthly:</strong> ${totals.monthly.toFixed(2)}</p>

      <button className="btn primary">
        View Recommended Packages
      </button>
    </aside>
  );
}
