import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { api } from "../api/client";

export default function LocalAnalysis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('id');
  
  const [assignment, setAssignment] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (assignmentId) {
      analyzeAssignment(assignmentId);
    }
  }, [assignmentId]);

  const fetchFileContent = async (url) => {
    const response = await fetch(url);
    return await response.text();
  };

  const analyzeAssignment = async (id) => {
    setIsAnalyzing(true);

    try {
      const db = getFirestore();
      const docRef = doc(db, "assignments", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Assignment not found");
        return;
      }

      const assignmentData = { id: docSnap.id, ...docSnap.data() };
      
      // Fetch content
      const contentText = await fetchFileContent(assignmentData.content_url);

      // AI Detection via local backend
      const aiResult = await api.checkAI(contentText.substring(0, 3000));

      // Analyze with backend
      const analysisResult = {
        ai_detection: aiResult,
        word_count: contentText.split(/\s+/).length,
        extracted_text: contentText.substring(0, 5000)
      };

      // Update Firestore
      await updateDoc(docRef, {
        ai_detection_score: aiResult.ai_score,
        human_score: aiResult.human_score,
        word_count: analysisResult.word_count,
        extracted_text: analysisResult.extracted_text,
        status: "analyzed",
        analysis_complete: true
      });

      setAssignment({ ...assignmentData, ...analysisResult });
      setAnalysis(analysisResult);

    } catch (error) {
      console.error("Analysis error:", error);
      alert("Analysis failed. Try again.");
    }

    setIsAnalyzing(false);
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Work</h2>
          <p className="text-gray-600">This takes about 30-60 seconds...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">Assignment not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getRiskLevel = (score) => {
    if (score < 30) return { text: "Low Risk", color: "green" };
    if (score < 60) return { text: "Medium Risk", color: "yellow" };
    return { text: "High Risk", color: "red" };
  };

  const risk = getRiskLevel(analysis.ai_detection.ai_score);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {assignment.title}
          </h1>
          <p className="text-gray-600">
            {assignment.task_type.replace(/_/g, ' ')} • {assignment.word_count} words
          </p>
        </div>

        {/* AI Detection Card */}
        <div className={`border-4 rounded-lg p-6 mb-6 ${
          risk.color === 'green' ? 'border-green-400 bg-green-50' :
          risk.color === 'yellow' ? 'border-yellow-400 bg-yellow-50' :
          'border-red-400 bg-red-50'
        }`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            AI Detection: {risk.text}
          </h2>
          
          <div className="space-y-4 mb-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">AI-Generated Likelihood</span>
                <span className="text-2xl font-bold text-blue-600">
                  {analysis.ai_detection.ai_score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full" 
                  style={{ width: `${analysis.ai_detection.ai_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Human-Written Likelihood</span>
                <span className="text-2xl font-bold text-green-600">
                  {analysis.ai_detection.human_score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ width: `${analysis.ai_detection.human_score}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <p className="text-gray-800">{analysis.ai_detection.explanation}</p>
          </div>

          {analysis.ai_detection.suggestions && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold mb-2">Suggestions:</h3>
              <ul className="space-y-1">
                {analysis.ai_detection.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700">• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}