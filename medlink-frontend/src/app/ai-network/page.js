"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/api";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d"),
  { ssr: false }
);

export default function PatientNetwork() {

  const [patientId,setPatientId] = useState("");
  const [graph,setGraph] = useState({nodes:[],links:[]});
  const [loading,setLoading] = useState(false);

  const [stats,setStats] = useState({
    similar:0,
    avgSimilarity:0,
    nodes:0,
    links:0
  });

  //////////////////////////////////////////////////////
  // LOAD GRAPH
  //////////////////////////////////////////////////////

  const loadGraph = async () => {

    if(!patientId){
      alert("Enter Patient ID");
      return;
    }

    setLoading(true);

    try{

      const res = await api.get(`/ai/similar-patients/${patientId}`);

      const similar = res.data.similar_patients || [];

      const nodes = [
        {
          id:`patient_${patientId}`,
          label:`Patient ${patientId}`,
          group:1,
          size:18
        }
      ];

      const links = [];

      let totalSimilarity = 0;

      similar.forEach((p)=>{

        nodes.push({
          id:p.patient,
          label:p.patient,
          group:2,
          size:10
        });

        links.push({
          source:`patient_${patientId}`,
          target:p.patient,
          similarity:p.similarity
        });

        totalSimilarity += p.similarity;

      });

      setGraph({nodes,links});

      setStats({
        similar:similar.length,
        avgSimilarity:similar.length
          ? (totalSimilarity/similar.length).toFixed(2)
          : 0,
        nodes:nodes.length,
        links:links.length
      });

    }catch{

      alert("Error generating network");

    }

    setLoading(false);

  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return(

  <AuthGuard>

  <div className="flex">

    <Sidebar/>

    <div className="flex-1 p-10 bg-gray-100 min-h-screen">

      {/* HEADER */}

      <h1 className="text-3xl font-bold mb-2">
        AI Patient Similarity Network
      </h1>

      <p className="text-gray-600 mb-6">
        Graph-based AI model identifying patients with similar medical patterns.
      </p>


      {/* INPUT */}

      <div className="bg-white p-4 rounded shadow mb-6">

        <input
          placeholder="Enter Patient ID"
          className="border p-2 mr-4 rounded"
          value={patientId}
          onChange={(e)=>setPatientId(e.target.value)}
        />

        <button
          onClick={loadGraph}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate Network
        </button>

        {loading && (
          <p className="text-gray-500 mt-2">
            AI analyzing patient similarity...
          </p>
        )}

      </div>


      {/* METRICS */}

      <div className="grid grid-cols-4 gap-6 mb-6">

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Similar Patients</p>
          <p className="text-2xl font-bold">{stats.similar}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Avg Similarity</p>
          <p className="text-2xl font-bold">{stats.avgSimilarity}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Graph Nodes</p>
          <p className="text-2xl font-bold">{stats.nodes}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Connections</p>
          <p className="text-2xl font-bold">{stats.links}</p>
        </div>

      </div>


      {/* GRAPH */}

      <div className="bg-gray-900 rounded shadow p-4 mb-6">

        <ForceGraph2D

          graphData={graph}

          height={550}

          backgroundColor="#111"

          nodeRelSize={6}

          nodeLabel={(node)=>node.label}

          linkLabel={(link)=>`Similarity: ${link.similarity.toFixed(2)}`}

          linkWidth={(link)=>link.similarity*5}

          nodeCanvasObject={(node,ctx)=>{

            const label = node.label;
            const size = node.size;

            ctx.beginPath();
            ctx.arc(node.x,node.y,size,0,2*Math.PI);

            ctx.fillStyle = node.group === 1 ? "#ff4d4d" : "#3b82f6";
            ctx.fill();

            ctx.font="12px Sans-Serif";
            ctx.fillStyle="white";
            ctx.fillText(label,node.x+size+2,node.y+4);

          }}

          cooldownTicks={120}

        />

      </div>


      {/* LEGEND */}

      <div className="bg-white p-4 rounded shadow">

        <h3 className="font-bold mb-2">
          Graph Legend
        </h3>

        <div className="flex gap-6">

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            Target Patient
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            Similar Patients
          </div>

        </div>

        <p className="text-gray-600 mt-3 text-sm">
          Nodes represent patients. Links indicate similarity in medical history
          calculated using graph embeddings.
        </p>

      </div>

    </div>

  </div>

  </AuthGuard>

  );

}