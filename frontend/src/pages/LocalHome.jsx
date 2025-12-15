import React from "react";
import { useNavigate } from "react-router-dom";

export default function LocalHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Hey there! 👋
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-2">
            I'm your AI learning buddy
          </p>
          <p className="text-lg text-gray-600">
            I help you learn and improve - but I never do your work for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => navigate("/check")}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-200 hover:border-blue-400 text-left"
          >
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Check for AI</h3>
            <p className="text-gray-600">
              See if your work might be flagged as AI-generated
            </p>
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200 hover:border-purple-400 text-left"
          >
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ask AI for Help</h3>
            <p className="text-gray-600">
              Get guidance and hints, not answers
            </p>
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🛡️</div>
            <div>
              <h3 className="text-xl font-bold text-green-900 mb-2">
                My Promise to You
              </h3>
              <p className="text-green-800 leading-relaxed">
                I'm designed to be 100% ethical. I'll never write your essays, solve your problems, 
                or give you shortcuts. Instead, I'll ask you questions, help you think through things, 
                and guide you to learn and grow. Your work stays YOUR work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}