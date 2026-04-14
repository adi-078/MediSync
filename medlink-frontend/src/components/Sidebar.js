"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Activity,
  Pill,
  FlaskConical,
  Brain,
  Network,
  BarChart3,
  FileText,
  LogOut,
  UserPlus
} from "lucide-react";

export default function Sidebar() {

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, link: "/dashboard" },
    { name: "Patients", icon: Users, link: "/patients" },
    { name: "Visits", icon: Activity, link: "/visits" },
    { name: "Treatments", icon: Pill, link: "/treatments" },
    { name: "Clinical Trials", icon: FlaskConical, link: "/trials" },
    { name: "AI Insights", icon: Brain, link: "/ai" },
    { name: "Patient Network", icon: Network, link: "/ai-network" },
    { name: "Analytics", icon: BarChart3, link: "/analytics" },
    { name: "Audit Logs", icon: FileText, link: "/audit-logs" },
  ];

  return (
    <div className="h-screen w-64 bg-blue-900 text-white p-6 flex flex-col overflow-y-auto">

      <h1 className="text-2xl font-bold mb-10">
        MediSync AI
      </h1>

      <nav className="flex flex-col gap-5 flex-1">

        {menu.map((item, index) => (
          <Link
            key={index}
            href={item.link}
            className="flex items-center gap-3 hover:text-blue-300"
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}

      </nav>

      {/* Auth Section */}

      <div className="flex flex-col gap-4 mt-6 border-t border-blue-700 pt-4">

        <Link
          href="/register"
          className="flex items-center gap-3 hover:text-green-300"
        >
          <UserPlus size={20} />
          Register
        </Link>

        <Link
          href="/login"
          className="flex items-center gap-3 text-red-300 hover:text-red-400"
        >
          <LogOut size={20} />
          Logout
        </Link>

      </div>

    </div>
  );
}