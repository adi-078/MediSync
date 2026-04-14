"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function Analytics() {

  const [summary,setSummary] = useState({});
  const [trialData,setTrialData] = useState([]);
  const [diagnosisData,setDiagnosisData] = useState([]);

  const COLORS = ["#2563eb","#16a34a","#dc2626","#9333ea","#f59e0b"];

  useEffect(()=>{

    const fetchAnalytics = async()=>{

      try{

        const summaryRes = await api.get("/analytics/summary");

        setSummary(summaryRes.data || {});

      }catch(err){

        console.log("Summary error",err);

      }

      try{

        const trialRes = await api.get("/analytics/trial-success");

        setTrialData(trialRes.data || []);

      }catch(err){

        console.log("Trial data error",err);

      }

      try{

        const diagnosisRes = await api.get("/analytics/top-diagnosis");

        setDiagnosisData(diagnosisRes.data || []);

      }catch(err){

        console.log("Diagnosis data error",err);

      }

    };

    fetchAnalytics();

  },[]);


  return(

    <AuthGuard>

      <div className="flex">

        <Sidebar />

        <div className="flex-1 p-10 bg-gray-100 min-h-screen">

          <h1 className="text-3xl font-bold mb-8">
            Analytics Dashboard
          </h1>


          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-4 gap-6 mb-10">

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-gray-500">Patients</h2>
              <p className="text-3xl font-bold">
                {summary.patients || 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-gray-500">Visits</h2>
              <p className="text-3xl font-bold">
                {summary.visits || 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-gray-500">Clinical Trials</h2>
              <p className="text-3xl font-bold">
                {summary.clinical_trials || 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-gray-500">Trial Outcomes</h2>
              <p className="text-3xl font-bold">
                {summary.trial_outcomes || 0}
              </p>
            </div>

          </div>


          {/* SECOND ROW METRICS */}

          <div className="grid grid-cols-4 gap-6 mb-10">

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-gray-500">Hospitals</h2>
              <p className="text-3xl font-bold">
                {summary.hospitals || 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-gray-500">Doctors</h2>
              <p className="text-3xl font-bold">
                {summary.doctors || 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-gray-500">Treatments</h2>
              <p className="text-3xl font-bold">
                {summary.treatments || 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-gray-500">Trial Enrollments</h2>
              <p className="text-3xl font-bold">
                {summary.trial_enrollments || 0}
              </p>
            </div>

          </div>


          {/* CHARTS */}

          <div className="grid grid-cols-2 gap-10">


            {/* TRIAL SUCCESS CHART */}

            <div className="bg-white p-6 rounded-xl shadow">

              <h2 className="text-xl font-bold mb-4">
                Trial Outcome Distribution
              </h2>

              <ResponsiveContainer width="100%" height={300}>

                <BarChart data={trialData}>

                  <XAxis dataKey="result" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="count"
                    fill="#2563eb"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/* TOP DIAGNOSIS */}

            <div className="bg-white p-6 rounded-xl shadow">

              <h2 className="text-xl font-bold mb-4">
                Top Diagnoses
              </h2>

              <ResponsiveContainer width="100%" height={300}>

                <PieChart>

                  <Pie
                    data={diagnosisData}
                    dataKey="count"
                    nameKey="diagnosis"
                    outerRadius={110}
                    label
                  >

                    {diagnosisData.map((entry,index)=>(
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}

                  </Pie>

                  <Tooltip />
                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

    </AuthGuard>

  );

}