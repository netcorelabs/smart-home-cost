import { useEffect, useState } from "react";

export default function DeviceSelector() {
  const [devices, setDevices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    fetch("/api/devices")
      .then(res => res.json())
      .then(data => setDevices(data.data));
  }, []);

  // Unique categories for first dropdown
  const categories = [...new Set(devices.map(d => d.category_name))];

  const filteredDevices = devices.filter(
    (d) => d.category_name === selectedCategory
  );

  return (
    <div className="selector-wrapper">
      <h2>Choose Your Smart Home Devices</h2>

      {/* Dropdown #1 — Pick Category */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">Select Category</option>
        {categories.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Dropdown #2 — Pick Device Model */}
      {selectedCategory && (
        <select
          onChange={(e) => {
            const picked = filteredDevices.find(d => d.id == e.target.value);
            setSelectedDevice(picked);
          }}
        >
          <option value="">Select Device</option>
          {filteredDevices.map(d => (
            <option key={d.id} value={d.id}>
              {d.brand} {d.model} — {d.tier}
            </option>
          ))}
        </select>
      )}
import { useCart } from "../context/CartContext"; // add this at top
// ...

const [qty, setQty] = useState(1); // add near top with other useState()

{selectedDevice && (
  <div className="device-summary">
    <h3>{selectedDevice.brand} {selectedDevice.model}</h3>
    <p>Price: ${selectedDevice.price_usd}</p>
    <p>Monthly: ${selectedDevice.monthly_fee_usd}</p>

    <label>Quantity:</label>
    <input
      type="number"
      min="1"
      value={qty}
      onChange={(e) => setQty(Number(e.target.value))}
    />

    <button
      className="btn add"
      onClick={() => addToCart(selectedDevice, qty)}
    >
      Add Device
    </button>
  </div>
)}

      {/* Live device pricing output */}
     
    </div>
  );
}
