import { useState } from "react";
import "./login.css";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const Submit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={Submit}>
        <p className="Lab"> Enter UserName </p>
        <input
          type="email"
          placeholder="Enter Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="Lab"> Enter UserName </p>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="loginbtn">
          Login
        </button>
        <p>
          I don't have an account?{" "}
          <Link to="/signup">
            <span>Sign up</span>
          </Link>
        </p>
        <p>
          Forgot your password?{" "}
          <Link to="/forgot-password">
            <span>Reset it</span>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
