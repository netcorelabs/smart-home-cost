import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function PackageComparison() {
  const { cart } = useCart();
  const deviceCount = cart.reduce((sum, d) => sum + d.qty, 0);

  // Track home size
  const [homeSize, setHomeSize] = useState("medium");

  // Define your packages
  const packages = [
    { id: "basic", name: "Basic", price: 29.99 },
    { id: "better", name: "Better", price: 49.99 },
    { id: "best", name: "Best", price: 79.99 },
  ];

  // Determine recommended package dynamically
  function determineRecommendedPlan(homeSize, deviceCount) {
    if (deviceCount > 10 || homeSize === "large") return "best";
    if (deviceCount > 3 || homeSize === "medium") return "better";
    return "basic";
  }

  const recommended = determineRecommendedPlan(homeSize, deviceCount);

  return (
    <div className="package-comparison-wrapper">
      <div className="home-size-selector">
        <label htmlFor="home-size">Select Home Size:</label>
        <select
          id="home-size"
          value={homeSize}
          onChange={(e) => setHomeSize(e.target.value)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="package-grid">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`card ${pkg.id === recommended ? "recommended" : ""}`}
          >
            {pkg.id === recommended && (
              <div className="badge-recommended">✔ Recommended</div>
            )}
            <h3>{pkg.name}</h3>
            <p>${pkg.price} / month</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .package-comparison-wrapper {
          margin-top: 20px;
        }

        .home-size-selector {
          margin-bottom: 20px;
        }

        .package-grid {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .card {
          position: relative;
          flex: 1 1 200px;
          max-width: 250px;
          padding: 20px;
          border: 2px solid #ccc;
          border-radius: 12px;
          text-align: center;
          transition: transform 0.3s, border 0.3s, box-shadow 0.3s;
        }

        .card.recommended {
          transform: scale(1.08);
          border: 3px solid #3ab65c;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
        }

        .badge-recommended {
          position: absolute;
          top: -10px;
          right: -10px;
          background-color: #3ab65c;
          color: #fff;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
