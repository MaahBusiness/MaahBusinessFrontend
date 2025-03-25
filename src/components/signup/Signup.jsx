import { useState } from "react";
import "./signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    role: "manager",
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalErrorMessages, setModalErrorMessages] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalErrorMessages([...Object.values(data).flat()]);
        throw new Error("Registration failed.");
      }

      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="login signup">
        <h2>Sign Up</h2>
        <p className="Lab"> Enter Username </p>
        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <p className="Lab"> Enter Email </p>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <p className="Lab"> Enter Number </p>
        <input
          type="number"
          name="phone_number"
          placeholder="Enter Phone"
          value={formData.phone_number}
          onChange={(e) =>
            setFormData({ ...formData, phone_number: e.target.value })
          }
        />
        <p className="Lab"> Enter Password </p>
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
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
        <button type="submit" className="signupbtn" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}

      {modalErrorMessages.length > 0 && (
        <div className="modaal-overlay">
          <div className="modaal-content">
            <h3>Error Messages</h3>
            <ul>
              {modalErrorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
            <button
              onClick={() => setModalErrorMessages([])}
              className="close-btn"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
