import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Upload, Shield } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const handleAsk = () => {
    if (input.trim()) {
      navigate(createPageUrl(`Chat?q=${encodeURIComponent(input)}`));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Hey, I'm EthicalAI 👋
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            I'm here to help you grow as a learner. I won't do your homework for you, 
            but I'll guide you to understand it better and do your best work.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Here's what I believe in:</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              <span className="font-semibold text-blue-600">Learning is yours.</span> I'm not here to give you answers. 
              I'm here to help you find them yourself, because that's how you actually learn and grow.
            </p>
            <p>
              <span className="font-semibold text-purple-600">Honesty matters.</span> Using AI to cheat isn't just wrong—it cheats you 
              out of learning. I'll help you stay on the right side of academic integrity.
            </p>
            <p>
              <span className="font-semibold text-green-600">Everyone gets stuck.</span> That's totally normal! When you do, 
              I'll ask you questions that help you think through problems your own way.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ask Me Anything</h3>
            <p className="text-gray-600 text-sm">
              Stuck on a concept? Not sure where to start? Just ask—I'll help you figure it out.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Check Your Work</h3>
            <p className="text-gray-600 text-sm">
              Worried your work might look AI-generated? I'll check it before you submit.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Get Feedback</h3>
            <p className="text-gray-600 text-sm">
              Upload your assignment and I'll give you tips to make it even better.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 md:p-10 shadow-xl text-white mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">
            What can I help you with today?
          </h2>
          <p className="text-blue-100 text-center mb-6">
            Type your question below and let's figure it out together
          </p>
          
          <div className="bg-white rounded-xl p-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Example: I don't understand how to start this essay... or Help me break down this math problem..."
              className="resize-none text-base text-gray-900 border-0 focus:ring-0"
              rows={3}
            />
          </div>
          
          <Button
            onClick={handleAsk}
            disabled={!input.trim()}
            className="w-full bg-white text-blue-600 hover:bg-gray-50 text-lg py-6 mt-4 font-semibold shadow-md"
          >
            <Send className="w-5 h-5 mr-2" />
            Let's Talk
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(createPageUrl("CheckWork"))}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-400 transition-all text-left shadow-sm hover:shadow-md"
          >
            <Shield className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-bold text-lg text-gray-900 mb-1">Check if My Work Has AI</h3>
            <p className="text-gray-600 text-sm">See if your work might get flagged before submitting</p>
          </button>
          <button
            onClick={() => navigate(createPageUrl("Upload"))}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-400 transition-all text-left shadow-sm hover:shadow-md"
          >
            <Upload className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-bold text-lg text-gray-900 mb-1">Get Feedback on Assignment</h3>
            <p className="text-gray-600 text-sm">Upload your work and get helpful guidance</p>
          </button>
        </div>
      </div>
    </div>
  );
}