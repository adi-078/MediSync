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

export default function Dashboard(){

 const [summary,setSummary] = useState({});
 const [trialData,setTrialData] = useState([]);
 const [patientData,setPatientData] = useState([]);

 const COLORS = ["#2563eb","#16a34a","#dc2626","#9333ea","#f59e0b"];

 useEffect(()=>{

  const loadDashboard = async()=>{

   try{

    const res = await api.get("/analytics/summary");
    setSummary(res.data || {});

   }catch(err){
    console.log("Summary error");
   }

   try{

    const trialRes = await api.get("/analytics/trial-success");
    setTrialData(trialRes.data || []);

   }catch{
    console.log("Trial data error");
   }

   try{

    const diagRes = await api.get("/analytics/top-diagnosis");
    setPatientData(diagRes.data || []);

   }catch{
    console.log("Diagnosis error");
   }

  };

  loadDashboard();

 },[]);


 return(

<AuthGuard>

<div className="flex">

<Sidebar/>

<div className="flex-1 p-10 bg-gray-100 min-h-screen">

<h1 className="text-3xl font-bold mb-8">
MediSync AI Dashboard
</h1>


{/* METRIC CARDS */}

<div className="grid grid-cols-3 gap-6 mb-10">

<div className="bg-white p-6 rounded-xl shadow">
<h2 className="text-gray-500">Total Patients</h2>
<p className="text-3xl font-bold">
{summary.patients || 0}
</p>
</div>

<div className="bg-white p-6 rounded-xl shadow">
<h2 className="text-gray-500">Total Visits</h2>
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

</div>


{/* CHART SECTION */}

<div className="grid grid-cols-2 gap-10">


{/* PATIENT DISTRIBUTION */}

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-bold mb-4">
Patient Distribution
</h2>

<ResponsiveContainer width="100%" height={300}>

<PieChart>

<Pie
 data={patientData}
 dataKey="count"
 nameKey="diagnosis"
 outerRadius={110}
 label
>

{patientData.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]} />
))}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>

</ResponsiveContainer>

</div>


{/* TRIAL OUTCOME */}

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-bold mb-4">
Trial Outcome Distribution
</h2>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={trialData}>

<XAxis dataKey="result"/>
<YAxis/>
<Tooltip/>
<Legend/>

<Bar
 dataKey="count"
 fill="#2563eb"
/>

</BarChart>

</ResponsiveContainer>

</div>

</div>

</div>

</div>

</AuthGuard>

 );

}