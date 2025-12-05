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
