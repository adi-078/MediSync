"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/api";

export default function Visits() {

  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const [searchPatientId, setSearchPatientId] = useState("");

  const [visits, setVisits] = useState([]);
  const [showTable, setShowTable] = useState(false);

  // =========================
  // ADD VISIT
  // =========================
  const addVisit = async () => {

    if (!patientId) {
      alert("Please enter Patient ID");
      return;
    }

    try {

      const res = await api.post("/visits/add-visit", {
        patient_id: parseInt(patientId),
        diagnosis,
        symptoms
      });

      const visitId = res.data.visit_id;

      alert("Visit added successfully. Visit ID: " + visitId);

      setPatientId("");
      setDiagnosis("");
      setSymptoms("");

    } catch (error) {

      console.log(error.response?.data);
      alert("Error adding visit");

    }

  };


  // =========================
  // GET VISITS BY PATIENT
  // =========================
  const getVisits = async () => {

    if (!searchPatientId) {
      alert("Enter Patient ID");
      return;
    }

    try {

      const res = await api.get(`/visits/get-visit/${searchPatientId}`);

      setVisits(res.data);
      setShowTable(true);

    } catch (error) {

      console.log(error.response?.data);
      alert("No visits found");

    }

  };


  // =========================
  // GET ALL VISITS
  // =========================
  const getAllVisits = async () => {

    try {

      const res = await api.get("/visits/all-visits");

      setVisits(res.data);
      setShowTable(true);

    } catch (error) {

      console.log(error.response?.data);
      alert("Error loading visits");

    }

  };


  return (

<AuthGuard>

<div className="flex">

<Sidebar />

<div className="flex-1 p-10 bg-gray-100 min-h-screen">

<h1 className="text-3xl font-bold mb-8">
Patient Visits
</h1>


{/* ========================= */}
{/* ADD VISIT */}
{/* ========================= */}

<div className="bg-white p-6 rounded shadow mb-10">

<h2 className="text-xl font-bold mb-4">
Add Visit
</h2>

<div className="flex flex-wrap gap-3">

<input
placeholder="Patient ID"
value={patientId}
className="border p-2"
onChange={(e)=>setPatientId(e.target.value)}
/>

<input
placeholder="Diagnosis"
value={diagnosis}
className="border p-2"
onChange={(e)=>setDiagnosis(e.target.value)}
/>

<input
placeholder="Symptoms"
value={symptoms}
className="border p-2"
onChange={(e)=>setSymptoms(e.target.value)}
/>

<button
onClick={addVisit}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Add Visit
</button>

</div>

</div>


{/* ========================= */}
{/* GET VISITS */}
{/* ========================= */}

<div className="bg-white p-6 rounded shadow mb-10">

<h2 className="text-xl font-bold mb-4">
Search Visits
</h2>

<div className="flex gap-3">

<input
placeholder="Patient ID"
value={searchPatientId}
className="border p-2"
onChange={(e)=>setSearchPatientId(e.target.value)}
/>

<button
onClick={getVisits}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Get Visits
</button>

</div>

</div>


{/* ========================= */}
{/* VIEW ALL VISITS BUTTON */}
{/* ========================= */}

<div className="mb-6">

<button
onClick={getAllVisits}
className="bg-purple-600 text-white px-5 py-2 rounded"
>
View All Visits
</button>

</div>


{/* ========================= */}
{/* VISITS TABLE */}
{/* ========================= */}

{showTable && (

<div className="bg-white p-6 rounded shadow">

<h2 className="text-xl font-bold mb-4">
Visit Records
</h2>

<table className="w-full border">

<thead>

<tr className="bg-gray-200">

<th className="p-2">Visit ID</th>
<th className="p-2">Patient ID</th>
<th className="p-2">Date</th>
<th className="p-2">Diagnosis</th>
<th className="p-2">Symptoms</th>

</tr>

</thead>

<tbody>

{visits.map((visit,i)=>(

<tr key={i} className="border-t">

<td className="p-2">{visit.visit_id}</td>
<td className="p-2">{visit.patient_id}</td>
<td className="p-2">{visit.visit_date}</td>
<td className="p-2">{visit.diagnosis}</td>
<td className="p-2">{visit.symptoms}</td>

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