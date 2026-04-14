"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function Login() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {
  try {

    const res = await api.post("/auth/login", null, {
      params: {
        email: email,
        password: password
      }
    });

    console.log("LOGIN RESPONSE:", res.data);

    localStorage.setItem("token", res.data.access_token);

    router.push("/dashboard");

  } catch (err) {

    console.log("FULL ERROR:", err);

    alert("Login failed");

  }
};

  return(

    <div className="flex items-center justify-center h-screen bg-gray-100">

      <div className="bg-white p-8 rounded shadow w-80">

        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <input
          placeholder="Email"
          className="border p-2 w-full mb-4"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-6"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Login
        </button>

      </div>

    </div>

  );
}