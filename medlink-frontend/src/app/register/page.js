"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function Register() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const register = async () => {

    try {

      await api.post("/auth/register",{
        email: email,
        password: password
      });

      alert("User Registered");

    } catch {

      alert("Error registering");

    }

  };

  return(

    <div className="flex justify-center items-center h-screen bg-gray-100">

      <div className="bg-white p-8 rounded shadow w-96">

        <h1 className="text-2xl font-bold mb-6">
          Register
        </h1>

        <input
          placeholder="Email"
          className="border p-2 mb-4 w-full"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-4 w-full"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={register}
          className="bg-green-600 text-white w-full p-2 rounded"
        >
          Register
        </button>

      </div>

    </div>

  );
}