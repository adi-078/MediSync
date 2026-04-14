"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/api";

export default function Treatments() {

  const [visitId, setVisitId] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [plan, setPlan] = useState("");

  const [searchVisitId, setSearchVisitId] = useState("");
  const [treatments, setTreatments] = useState([]);

  // ===============================
  // ADD TREATMENT
  // ===============================

  const addTreatment = async () => {

    if (!visitId || !medication || !dosage || !duration || !plan) {
      alert("Please fill all fields");
      return;
    }

    try {

      await api.post("/treatments/add-treatment", {
        visit_id: parseInt(visitId),
        medication,
        dosage,
        duration,
        treatment_plan: plan
      });

      alert("Treatment added successfully");

      // auto refresh treatments
      getTreatments(visitId);

      // clear form
      setVisitId("");
      setMedication("");
      setDosage("");
      setDuration("");
      setPlan("");

    } catch (error) {

      console.error(error);
      alert("Error adding treatment");

    }

  };

  // ===============================
  // GET TREATMENTS
  // ===============================

  const getTreatments = async (id = searchVisitId) => {

    if (!id) {
      alert("Enter Visit ID");
      return;
    }

    try {

      const res = await api.get(`/treatments/get-treatment/${parseInt(id)}`);

      setTreatments(res.data);

    } catch (error) {

      console.error(error);
      alert("No treatments found");

    }

  };

  return (

<AuthGuard>

<div className="flex">

<Sidebar />

<div className="flex-1 p-10 bg-gray-100 min-h-screen">

<h1 className="text-3xl font-bold mb-8">
Treatments
</h1>

{/* =============================== */}
{/* ADD TREATMENT */}
{/* =============================== */}

<div className="bg-white p-6 rounded shadow mb-10">

<h2 className="text-xl font-bold mb-4">
Add Treatment
</h2>

<div className="flex flex-wrap gap-3">

<input
placeholder="Visit ID"
value={visitId}
className="border p-2"
onChange={(e)=>setVisitId(e.target.value)}
/>

<input
placeholder="Medication"
value={medication}
className="border p-2"
onChange={(e)=>setMedication(e.target.value)}
/>

<input
placeholder="Dosage"
value={dosage}
className="border p-2"
onChange={(e)=>setDosage(e.target.value)}
/>

<input
placeholder="Duration"
value={duration}
className="border p-2"
onChange={(e)=>setDuration(e.target.value)}
/>

<input
placeholder="Treatment Plan"
value={plan}
className="border p-2"
onChange={(e)=>setPlan(e.target.value)}
/>

<button
onClick={addTreatment}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Add Treatment
</button>

</div>

</div>


{/* =============================== */}
{/* GET TREATMENTS */}
{/* =============================== */}

<div className="bg-white p-6 rounded shadow">

<h2 className="text-xl font-bold mb-4">
Get Treatments
</h2>

<div className="flex gap-3">

<input
placeholder="Visit ID"
value={searchVisitId}
className="border p-2"
onChange={(e)=>setSearchVisitId(e.target.value)}
/>

<button
onClick={()=>getTreatments()}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Get Treatments
</button>

</div>

<div className="mt-6">

{treatments.length === 0 && (
<p className="text-gray-500">No treatments found</p>
)}

{treatments.map((t)=>(
<div key={t.treatment_id} className="border p-4 mb-3 rounded bg-gray-50">

<p><b>Medication:</b> {t.medication}</p>
<p><b>Dosage:</b> {t.dosage}</p>
<p><b>Duration:</b> {t.duration}</p>
<p><b>Treatment Plan:</b> {t.treatment_plan}</p>

</div>
))}

</div>

</div>

</div>

</div>

</AuthGuard>

);
}