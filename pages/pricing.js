import DeviceSelector from "../components/DeviceSelector";

export default function PricingPage() {
  return (
    <main className="container">
      <h1>Smart Home Pricing</h1>
      <DeviceSelector />
    </main>
  );
}
import DeviceSelector from "../components/DeviceSelector";
import CostSummary from "../components/CostSummary";

export default function PricingPage() {
  return (
    <main className="pricing-container">
      <DeviceSelector />
      <CostSummary />
    </main>
  );
}
import { useState } from "react";

export default function PackageComparison({ deviceCount }) {
  // Track home size (small / medium / large)
  const [homeSize, setHomeSize] = useState("medium"); 

  // Example: deviceCount comes from your cart context
  // const { cart } = useCart();
  // const deviceCount = cart.reduce((sum, d) => sum + d.qty, 0);
<select
  value={homeSize}
  onChange={(e) => setHomeSize(e.target.value)}
>
  <option value="small">Small</option>
  <option value="medium">Medium</option>
  <option value="large">Large</option>
</select>
function determineRecommendedPlan(homeSize, deviceCount) {
  if (deviceCount > 10 || homeSize === "large") return "best";
  if (deviceCount > 3 || homeSize === "medium") return "better";
  return "basic";
}

// Compute recommended plan
const recommended = determineRecommendedPlan(homeSize, deviceCount);
const packages = [
  { id: "basic", name: "Basic", price: 29.99 },
  { id: "better", name: "Better", price: 49.99 },
  { id: "best", name: "Best", price: 79.99 },
];
