import { useState, useEffect } from "react"; // 👈 add useEffect
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast"; // 👈 import showToast


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // ✅ Check if already logged in
    useEffect(() => {
        if (localStorage.getItem("token")) {
            const role = localStorage.getItem("role");

            if (role === "admin") navigate("/admin");
            else if (role === "manager") navigate("/manager");
            else navigate("/user");
        }
    }, [navigate]);

    const login = async () => {
        if (!email || !password) {
            showToast("All fields required", "error");
            return;
        }
        try {
            const res = await axios.post(
                "http://localhost:8000/api/auth/login",
                { email, password }
            );

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
            localStorage.setItem("name", res.data.name);
            localStorage.setItem("email", res.data.email);
            showToast("Login successful");
            // 🔥 redirect after login
            if (res.data.role === "admin") navigate("/admin");
            else if (res.data.role === "manager") navigate("/manager");
            else navigate("/user");

        } catch (err) {
            showToast(err.response?.data || "Login failed");
        }
    };

    return (
     <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12">

        <div>
          <h1 className="text-5xl font-bold mb-6">
            Welcome 👋
          </h1>

          <p className="text-lg mb-6 text-3xl font-bold">
            Thatha Patti Elder Foundation
          </p>

          <ul className="space-y-3 text-lg">
            Assisted Living & Home Health Care
          </ul>

          <p className="mt-10 text-sm opacity-80">
            
          </p>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">

        {/* Glass Card */}
        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-10 w-96 border">

          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Login
          </button>

          {/* <p className="mt-4 text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer font-medium"
            >
              Register
            </span>
          </p> */}

        </div>
      </div>
    </div>
    );
}