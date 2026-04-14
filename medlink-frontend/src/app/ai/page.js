"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/api";

export default function AI() {

const [patientId,setPatientId] = useState("");
const [disease,setDisease] = useState("");

const [similarPatients,setSimilarPatients] = useState([]);
const [recommendedTrials,setRecommendedTrials] = useState([]);
const [digitalTwin,setDigitalTwin] = useState(null);
const [riskScore,setRiskScore] = useState(null);

const [bestTreatment,setBestTreatment] = useState([]);
const [trialSuccess,setTrialSuccess] = useState([]);

const [loading,setLoading] = useState(false);

//////////////////////////////////////////////////////
// SIMILAR PATIENTS
//////////////////////////////////////////////////////

const getSimilarPatients = async () => {

if(!patientId){
alert("Enter Patient ID");
return;
}

setLoading(true);

try{

const res = await api.get(`/ai/similar-patients/${patientId}`);

setSimilarPatients(res.data.similar_patients || []);

}catch{

alert("Error fetching similar patients");

}

setLoading(false);

};

//////////////////////////////////////////////////////
// RECOMMEND TRIALS
//////////////////////////////////////////////////////

const getTrialRecommendations = async () => {

if(!patientId){
alert("Enter Patient ID");
return;
}

setLoading(true);

try{

const res = await api.get(`/ai/recommend-trials/${patientId}`);

setRecommendedTrials(res.data.recommended_trials || []);

}catch{

alert("Error fetching trials");

}

setLoading(false);

};

//////////////////////////////////////////////////////
// DIGITAL TWIN
//////////////////////////////////////////////////////

const getDigitalTwin = async () => {

if(!patientId){
alert("Enter Patient ID");
return;
}

setLoading(true);

try{

const res = await api.get(`/ai/gnn-digital-twin/${patientId}`);

setDigitalTwin(res.data);

}catch{

alert("Error generating digital twin");

}

setLoading(false);

};

//////////////////////////////////////////////////////
// RISK SCORE
//////////////////////////////////////////////////////

const getRiskScore = async () => {

if(!patientId){
alert("Enter Patient ID");
return;
}

setLoading(true);

try{

const res = await api.get(`/ai/risk-score/${patientId}`);

setRiskScore(res.data);

}catch{

alert("Error fetching risk score");

}

setLoading(false);

};

//////////////////////////////////////////////////////
// BEST TREATMENT
//////////////////////////////////////////////////////

const getBestTreatment = async () => {

if(!disease){
alert("Enter Disease");
return;
}

try{

const res = await api.get(`/ai/research/best-treatment`,{
params:{ disease }
});

setBestTreatment(res.data.best_treatments || []);

}catch{

alert("Error fetching best treatments");

}

};

//////////////////////////////////////////////////////
// TRIAL SUCCESS
//////////////////////////////////////////////////////

const getTrialSuccess = async () => {

try{

const res = await api.get(`/ai/research/trial-success`);

setTrialSuccess(res.data.clinical_trial_performance || []);

}catch{

alert("Error fetching trial success data");

}

};

//////////////////////////////////////////////////////
// UI
//////////////////////////////////////////////////////

return(

<AuthGuard>

<div className="flex">

<Sidebar/>

<div className="flex-1 p-10 bg-gray-100 min-h-screen">

<h1 className="text-3xl font-bold mb-8">
AI Insights
</h1>


{/* PATIENT INPUT */}

<div className="bg-white p-6 rounded shadow mb-8">

<input
placeholder="Patient ID"
className="border p-2 mr-4"
value={patientId}
onChange={(e)=>setPatientId(e.target.value)}
/>

<button
onClick={getSimilarPatients}
className="bg-blue-600 text-white px-3 py-2 mr-2 rounded"
>
Similar Patients
</button>

<button
onClick={getTrialRecommendations}
className="bg-green-600 text-white px-3 py-2 mr-2 rounded"
>
Recommend Trials
</button>

<button
onClick={getDigitalTwin}
className="bg-purple-600 text-white px-3 py-2 mr-2 rounded"
>
Digital Twin
</button>

<button
onClick={getRiskScore}
className="bg-red-600 text-white px-3 py-2 rounded"
>
Risk Score
</button>

{loading && (
<p className="mt-3 text-gray-500">
Running AI analysis...
</p>
)}

</div>


{/* SIMILAR PATIENTS */}

{similarPatients.length > 0 && (

<div className="bg-white p-6 rounded shadow mb-8">

<h2 className="text-xl font-bold mb-4">
Similar Patients
</h2>

<table className="w-full">

<thead className="bg-gray-200">
<tr>
<th className="p-2">Patient</th>
<th className="p-2">Similarity</th>
<th className="p-2">Condition</th>
<th className="p-2">Treatment</th>
</tr>
</thead>

<tbody>

{similarPatients.map((p,i)=>(
<tr key={i} className="border-t">

<td className="p-2">{p.patient}</td>
<td className="p-2">{p.similarity}</td>
<td className="p-2">{p.shared_condition}</td>
<td className="p-2">{p.shared_treatment}</td>

</tr>
))}

</tbody>

</table>

</div>

)}


{/* RECOMMENDED TRIALS */}

{recommendedTrials.length > 0 && (

<div className="bg-white p-6 rounded shadow mb-8">

<h2 className="text-xl font-bold mb-4">
Recommended Trials
</h2>

{recommendedTrials.map((t,i)=>(

<div key={i} className="border p-3 mb-2 rounded bg-gray-50">

<p><b>Trial ID:</b> {t.trial_id}</p>
<p><b>Trial Name:</b> {t.trial_name}</p>
<p><b>Predicted Success:</b> {(t.predicted_success_score*100).toFixed(1)}%</p>

</div>

))}

</div>

)}


{/* DIGITAL TWIN */}

{digitalTwin && (

<div className="bg-white p-6 rounded shadow mb-8">

<h2 className="text-xl font-bold mb-4">
Digital Twin Prediction
</h2>

<pre className="bg-gray-100 p-4 rounded">
{JSON.stringify(digitalTwin,null,2)}
</pre>

</div>

)}


{/* RISK SCORE */}

{riskScore && (

<div className="bg-white p-6 rounded shadow mb-8">

<h2 className="text-xl font-bold mb-4">
Patient Risk Score
</h2>

<pre className="bg-gray-100 p-4 rounded">
{JSON.stringify(riskScore,null,2)}
</pre>

</div>

)}


{/* RESEARCH INSIGHTS */}

<div className="bg-white p-6 rounded shadow">

<h2 className="text-xl font-bold mb-4">
Research Insights
</h2>

<input
placeholder="Disease (Example: Diabetes)"
className="border p-2 mr-4 mb-4"
value={disease}
onChange={(e)=>setDisease(e.target.value)}
/>

<div>

<button
onClick={getBestTreatment}
className="bg-blue-500 text-white px-3 py-2 mr-3 rounded"
>
Best Treatment
</button>

<button
onClick={getTrialSuccess}
className="bg-green-500 text-white px-3 py-2 rounded"
>
Trial Success
</button>

</div>

<div className="mt-4">

{bestTreatment.map((b,i)=>(
<div key={i} className="border p-3 mb-2 rounded bg-gray-50">

<p><b>Medication:</b> {b.medication}</p>
<p><b>Average Effectiveness:</b> {b.average_effectiveness}</p>
<p><b>Cases Analyzed:</b> {b.cases_analyzed}</p>

</div>
))}

{trialSuccess.map((t,i)=>(
<div key={i} className="border p-3 mb-2 rounded bg-gray-50">

<p><b>Trial:</b> {t.trial_name}</p>
<p><b>Average Effectiveness:</b> {t.average_effectiveness}</p>
<p><b>Participants:</b> {t.participants}</p>

</div>
))}

</div>

</div>

</div>

</div>

</AuthGuard>

);

}