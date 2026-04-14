"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/api";

export default function Trials() {

const [trials, setTrials] = useState([]);

const [patientId, setPatientId] = useState("");
const [trialId, setTrialId] = useState("");

const [enrollmentId, setEnrollmentId] = useState("");

const [result, setResult] = useState("");
const [sideEffects, setSideEffects] = useState("");
const [score, setScore] = useState("");

const [outcomes, setOutcomes] = useState([]);
const [enrollments, setEnrollments] = useState([]);
const [showEnrollments, setShowEnrollments] = useState(false);


//////////////////////////////////////////////////
// LOAD TRIALS
//////////////////////////////////////////////////

useEffect(()=>{

const fetchTrials = async ()=>{

try{

const res = await api.get("/trials/list");

setTrials(res.data);

}catch{

console.log("Error loading trials");

}

};

fetchTrials();

},[]);



//////////////////////////////////////////////////
// ENROLL PATIENT
//////////////////////////////////////////////////

const enrollPatient = async ()=>{

try{

const res = await api.post("/trials/enroll",null,{

params:{

trial_id:parseInt(trialId),
patient_id:parseInt(patientId),
status:"Enrolled"

}

});

const id = res.data.enrollment_id;

alert("Patient enrolled successfully. Enrollment ID: "+id);

setEnrollmentId(id);

setPatientId("");
setTrialId("");

}catch(error){

console.log(error.response?.data);
alert("Enrollment failed");

}

};



//////////////////////////////////////////////////
// GET ENROLLMENTS BY TRIAL
//////////////////////////////////////////////////

const getEnrollments = async ()=>{

try{

const res = await api.get(`/trials/enrollments/${trialId}`);

setEnrollments(res.data);

setShowEnrollments(true);

}catch{

alert("No enrollments found");

}

};



//////////////////////////////////////////////////
// GET ALL ENROLLMENTS
//////////////////////////////////////////////////

const getAllEnrollments = async ()=>{

try{

const res = await api.get("/trials/all-enrollments");

setEnrollments(res.data);

setShowEnrollments(true);

}catch{

alert("Error loading enrollments");

}

};



//////////////////////////////////////////////////
// RECORD OUTCOME
//////////////////////////////////////////////////

const recordOutcome = async ()=>{

try{

await api.post("/trials/record-outcome",null,{

params:{

enrollment_id:parseInt(enrollmentId),
result:result,
side_effects:sideEffects,
effectiveness_score:parseInt(score)

}

});

alert("Outcome Recorded");

setResult("");
setSideEffects("");
setScore("");

}catch(error){

console.log(error.response?.data);
alert("Error recording outcome");

}

};



//////////////////////////////////////////////////
// GET OUTCOMES
//////////////////////////////////////////////////

const getOutcomes = async ()=>{

try{

const res = await api.get(`/trials/outcomes/${enrollmentId}`);

setOutcomes(res.data);

}catch{

alert("No outcomes found");

}

};



//////////////////////////////////////////////////
// UI
//////////////////////////////////////////////////

return(

<AuthGuard>

<div className="flex">

<Sidebar/>

<div className="flex-1 p-10 bg-gray-100 min-h-screen">

<h1 className="text-3xl font-bold mb-8">
Clinical Trials
</h1>



{/* TRIAL LIST */}

<div className="bg-white p-6 rounded shadow mb-10">

<h2 className="text-xl font-bold mb-4">
Trial List
</h2>

{trials.map((trial,i)=>(

<div key={i} className="border p-4 mb-3 rounded bg-gray-50">

<h3 className="font-bold">{trial.trial_name}</h3>

<p>Phase: {trial.phase}</p>
<p>Status: {trial.status}</p>
<p>{trial.description}</p>

</div>

))}

</div>



{/* ENROLL PATIENT */}

<div className="bg-white p-6 rounded shadow mb-10">

<h2 className="text-xl font-bold mb-4">
Enroll Patient
</h2>

<div className="flex flex-wrap gap-3">

<input
placeholder="Patient ID"
className="border p-2"
value={patientId}
onChange={(e)=>setPatientId(e.target.value)}
/>

<input
placeholder="Trial ID"
className="border p-2"
value={trialId}
onChange={(e)=>setTrialId(e.target.value)}
/>

<button
onClick={enrollPatient}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Enroll
</button>

<button
onClick={getEnrollments}
className="bg-green-600 text-white px-4 py-2 rounded"
>
View Trial Enrollments
</button>

<button
onClick={getAllEnrollments}
className="bg-purple-600 text-white px-4 py-2 rounded"
>
View All Enrollments
</button>

</div>

</div>



{/* ENROLLMENT TABLE */}

{showEnrollments &&(

<div className="bg-white p-6 rounded shadow mb-10">

<h2 className="text-xl font-bold mb-4">
Enrollment List
</h2>

<table className="w-full border">

<thead>

<tr className="bg-gray-200">

<th className="p-2">Enrollment ID</th>
<th className="p-2">Patient ID</th>
<th className="p-2">Trial ID</th>
<th className="p-2">Status</th>

</tr>

</thead>

<tbody>

{enrollments.map((e,i)=>(

<tr key={i} className="border-t">

<td className="p-2">{e.enrollment_id}</td>
<td className="p-2">{e.patient_id}</td>
<td className="p-2">{e.trial_id}</td>
<td className="p-2">{e.status}</td>

</tr>

))}

</tbody>

</table>

</div>

)}



{/* RECORD OUTCOME */}

<div className="bg-white p-6 rounded shadow mb-10">

<h2 className="text-xl font-bold mb-4">
Record Outcome
</h2>

<div className="flex flex-wrap gap-3">

<input
placeholder="Enrollment ID"
className="border p-2"
value={enrollmentId}
onChange={(e)=>setEnrollmentId(e.target.value)}
/>

<select
className="border p-2"
value={result}
onChange={(e)=>setResult(e.target.value)}
>

<option value="">Select Result</option>
<option value="Improved">Improved</option>
<option value="No Change">No Change</option>
<option value="Worsened">Worsened</option>
<option value="Adverse Reaction">Adverse Reaction</option>

</select>

<input
placeholder="Side Effects"
className="border p-2"
value={sideEffects}
onChange={(e)=>setSideEffects(e.target.value)}
/>

<input
placeholder="Effectiveness Score"
className="border p-2"
value={score}
onChange={(e)=>setScore(e.target.value)}
/>

<button
onClick={recordOutcome}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Record
</button>

</div>

</div>



{/* VIEW OUTCOMES */}

<div className="bg-white p-6 rounded shadow">

<h2 className="text-xl font-bold mb-4">
View Outcomes
</h2>

<div className="flex gap-3">

<input
placeholder="Enrollment ID"
className="border p-2"
value={enrollmentId}
onChange={(e)=>setEnrollmentId(e.target.value)}
/>

<button
onClick={getOutcomes}
className="bg-purple-600 text-white px-4 py-2 rounded"
>
Get Outcomes
</button>

</div>

<div className="mt-6">

{outcomes.map((o,i)=>(

<div key={i} className="border p-4 mb-2 rounded bg-gray-50">

<p><b>Result:</b> {o.result}</p>
<p><b>Side Effects:</b> {o.side_effects}</p>
<p><b>Effectiveness Score:</b> {o.effectiveness_score}</p>

</div>

))}

</div>

</div>

</div>

</div>

</AuthGuard>

);

}