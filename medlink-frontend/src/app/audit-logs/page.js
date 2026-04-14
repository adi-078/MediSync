"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/api";

export default function AuditLogs() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchLogs = async () => {

      try {

        const res = await api.get("/audit/logs");

        setLogs(res.data);

      } catch (error) {

        console.error(error);
        alert("Failed to load audit logs");

      } finally {

        setLoading(false);

      }

    };

    fetchLogs();

  }, []);


  return (

    <AuthGuard>

      <div className="flex">

        <Sidebar />

        <div className="flex-1 p-10 bg-gray-100 min-h-screen">

          <h1 className="text-3xl font-bold mb-8">
            Audit Logs
          </h1>


          {loading ? (

            <p>Loading logs...</p>

          ) : (

            <div className="bg-white rounded shadow overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-gray-200">

                  <tr>

                    <th className="p-3">User ID</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Timestamp</th>

                  </tr>

                </thead>


                <tbody>

                  {logs.map((log, i) => (

                    <tr key={i} className="border-t hover:bg-gray-50">

                      <td className="p-3">
                        {log.user_id}
                      </td>

                      <td className="p-3">
                        {log.action}
                      </td>

                      <td className="p-3">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </AuthGuard>

  );

}