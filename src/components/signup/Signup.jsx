import { useState } from "react";
import "./signup.css";
const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    role: "",
    is_active: true,
  });

  const [is_register, setIsRegister] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsRegister(true);
    console.log("User registered:", formData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="login">
        <h2>Sign Up</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="number"
          name="phone"
          placeholder="Phone Num"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <select
          name="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        >
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
          <option value="stock_keeper">Stock Keeper</option>
          <option value="wholesale_client">Wholesale Client</option>
          <option value="sales_agent">Sales Agent</option>
        </select>
        <button type="submit">Register</button>
      </form>

      {is_register && <p>Registration Successful!</p>}
    </div>
  );
};

export default Signup;
