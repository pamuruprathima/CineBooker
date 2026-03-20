import React, { useState } from "react";
import axios from "axios";

const SignIn = ({ onLogin, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        // 1️⃣ Registration
        await axios.post("http://localhost:3000/users", {
          name,
          email,
          password,
        });

        // 2️⃣ Automatically login after registration
        const loginRes = await axios.post("http://localhost:3000/users/login", {
          email,
          password,
        });

        localStorage.setItem("user", JSON.stringify(loginRes.data.user));
        localStorage.setItem("token", loginRes.data.token);
        onLogin(loginRes.data.user, loginRes.data.token);
      } else {
        // Login
        const res = await axios.post("http://localhost:3000/users/login", {
          email,
          password,
        });

        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        onLogin(res.data.user, res.data.token);
      }

      // Close modal after login/registration
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "30px",
          width: "350px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          {isRegister ? "Register" : "Sign In"}
        </h2>

        {error && (
          <div style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <button
            type="submit"
            style={{
              background: "#f84464",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "20px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "#f84464", cursor: "pointer", fontWeight: "bold" }}
                onClick={() => setIsRegister(false)}
              >
                Sign In
              </span>
            </>
          ) : (
            <>
              New user?{" "}
              <span
                style={{ color: "#f84464", cursor: "pointer", fontWeight: "bold" }}
                onClick={() => setIsRegister(true)}
              >
                Register here
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default SignIn;
