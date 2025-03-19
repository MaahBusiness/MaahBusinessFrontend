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
      <form onSubmit={handleSubmit} className="login signup">
        <h2>Sign Up</h2>
        <p className="Lab"> Enter UserName </p>
        <input
          type="text"
          name="name"
          placeholder="Enter Username"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <p className="Lab"> Enter Email </p>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <p className="Lab"> Enter Number </p>
        <input
          type="number"
          name="phone"
          placeholder="Enter Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <p className="Lab"> Enter Password </p>
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <p className="Lab"> Select Role </p>
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
        <button type="submit" className="signupbtn">
          Register
        </button>
      </form>

      {is_register && <p>Registration Successful!</p>}
    </div>
  );
};

export default Signup;
