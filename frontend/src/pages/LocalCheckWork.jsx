import React, { useState } from "react";
import { api } from "../api/client";

export default function LocalCheckWork() {
  const [content, setContent] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!content.trim()) {
      alert("Please paste your text");
      return;
    }

    setIsChecking(true);
    setResult(null);

    try {
      const response = await api.checkAI(content);
      setResult(response);
    } catch (error) {
      console.error("Error checking work:", error);
      alert("Something went wrong. Try again?");
    }

    setIsChecking(false);
  };

  const getRiskLevel = (score) => {
    if (score < 30) return { text: "Low Risk", color: "green" };
    if (score < 60) return { text: "Medium Risk", color: "yellow" };
    return { text: "High Risk", color: "red" };
  };

  const risk = result ? getRiskLevel(result.ai_score) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Check Your Work 🔍
          </h1>
          <p className="text-lg text-gray-700">
            Check if your work might be flagged as AI-generated before you submit.
          </p>
        </div>

        {!result ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <label className="text-lg font-semibold mb-3 block text-gray-900">
                Paste what you wrote
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Copy and paste your essay, code, or any text you want to check..."
                className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg text-base"
              />
            </div>

            <button
              onClick={handleCheck}
              disabled={isChecking || !content.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-lg py-4 shadow-lg font-semibold rounded-xl disabled:opacity-50"
            >
              {isChecking ? "Analyzing..." : "Check It Now"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`border-4 rounded-lg p-6 ${
              risk.color === 'green' ? 'border-green-400 bg-green-50' :
              risk.color === 'yellow' ? 'border-yellow-400 bg-yellow-50' :
              'border-red-400 bg-red-50'
            }`}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{risk.text}</h2>
              
              <div className="space-y-4 mb-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">AI-Generated Likelihood</span>
                    <span className="text-2xl font-bold text-blue-600">{result.ai_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${result.ai_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Human-Written Likelihood</span>
                    <span className="text-2xl font-bold text-green-600">{result.human_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full" 
                      style={{ width: `${result.human_score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <p className="text-gray-800">{result.explanation}</p>
              </div>
            </div>

            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-xl mb-4 text-gray-900">
                  Tips to make it sound more like you:
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span className="text-gray-800">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setResult(null);
                setContent("");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              Check Something Else
            </button>
          </div>
        )}
      </div>
    </div>
  );
}