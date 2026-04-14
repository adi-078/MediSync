"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/api";

export default function Patients() {

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [contact, setContact] = useState("");
  const [history, setHistory] = useState("");

  const [searchId, setSearchId] = useState("");
  const [patient, setPatient] = useState(null);

  const [patients, setPatients] = useState([]);


  // ===============================
  // LOAD ALL PATIENTS
  // ===============================

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients/all-patients");
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);


  // ===============================
  // ADD PATIENT
  // ===============================

  const addPatient = async () => {

    try {

      const res = await api.post("/patients/add-patient", {
        name,
        dob,
        gender,
        contact,
        medical_history_hash: history
      });

      const id = res.data.patient_id;

      alert("Patient added successfully. Patient ID: " + id);

      setSearchId(id);

      getPatient(id);

      loadPatients();

      setName("");
      setDob("");
      setGender("");
      setContact("");
      setHistory("");

    } catch (err) {

      console.error(err);
      alert("Error adding patient");

    }

  };


  // ===============================
  // GET PATIENT
  // ===============================

  const getPatient = async (id = searchId) => {

    try {

      const res = await api.get(`/patients/get-patient/${id}`);

      setPatient(res.data);

    } catch {

      alert("Patient not found");

    }

  };


  return (

<AuthGuard>

<div className="flex">

<Sidebar />

<div className="flex-1 p-10 bg-gray-100 min-h-screen">

<h1 className="text-3xl font-bold mb-8">
Patients
</h1>


{/* =============================== */}
{/* ADD PATIENT */}
{/* =============================== */}

<div className="bg-white p-6 rounded shadow mb-10">

<h2 className="text-xl font-bold mb-4">
Add Patient
</h2>

<div className="flex flex-wrap gap-3">

<input
placeholder="Name"
value={name}
className="border p-2"
onChange={(e)=>setName(e.target.value)}
/>

<input
type="date"
value={dob}
className="border p-2"
onChange={(e)=>setDob(e.target.value)}
/>

<input
placeholder="Gender"
value={gender}
className="border p-2"
onChange={(e)=>setGender(e.target.value)}
/>

<input
placeholder="Contact"
value={contact}
className="border p-2"
onChange={(e)=>setContact(e.target.value)}
/>

<input
placeholder="Medical History"
value={history}
className="border p-2"
onChange={(e)=>setHistory(e.target.value)}
/>

<button
onClick={addPatient}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Add Patient
</button>

</div>

</div>



{/* =============================== */}
{/* GET PATIENT */}
{/* =============================== */}

<div className="bg-white p-6 rounded shadow mb-10">

<h2 className="text-xl font-bold mb-4">
Get Patient
</h2>

<div className="flex gap-3">

<input
placeholder="Patient ID"
value={searchId}
className="border p-2"
onChange={(e)=>setSearchId(e.target.value)}
/>

<button
onClick={()=>getPatient()}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Get Patient
</button>

</div>


{patient && (

<div className="mt-6 border p-4 rounded bg-gray-50">

<p><b>ID:</b> {patient.patient_id}</p>
<p><b>Name:</b> {patient.name}</p>
<p><b>DOB:</b> {patient.dob}</p>
<p><b>Gender:</b> {patient.gender}</p>
<p><b>Contact:</b> {patient.contact}</p>

<p className="mt-2">
<b>Medical History:</b> {patient.medical_history}
</p>

</div>

)}

</div>



{/* =============================== */}
{/* ALL PATIENTS TABLE */}
{/* =============================== */}

<div className="bg-white p-6 rounded shadow">

<h2 className="text-xl font-bold mb-4">
All Patients
</h2>

<table className="w-full border">

<thead>

<tr className="bg-gray-200">

<th className="p-2">ID</th>
<th className="p-2">Name</th>
<th className="p-2">Gender</th>
<th className="p-2">Contact</th>

</tr>

</thead>

<tbody>

{patients.map((p)=>(
<tr key={p.patient_id} className="border-t">

<td className="p-2">{p.patient_id}</td>
<td className="p-2">{p.name}</td>
<td className="p-2">{p.gender}</td>
<td className="p-2">{p.contact}</td>

</tr>
))}

</tbody>

</table>

</div>


</div>

</div>

</AuthGuard>

);

}