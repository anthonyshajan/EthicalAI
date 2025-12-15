import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AIDetectionCard({ aiScore, humanScore, explanation }) {
  const getScoreColor = (score) => {
    if (score < 30) return "text-green-600";
    if (score < 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score < 30) return "bg-green-100";
    if (score < 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getWarningLevel = () => {
    if (aiScore < 30) return { icon: CheckCircle, color: "green", text: "Low Risk", message: "Content appears predominantly human-written" };
    if (aiScore < 60) return { icon: Info, color: "yellow", text: "Moderate Risk", message: "Some sections may raise flags" };
    return { icon: AlertTriangle, color: "red", text: "High Risk", message: "Content likely to be flagged as AI-generated" };
  };

  const warning = getWarningLevel();
  const WarningIcon = warning.icon;

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className={`${getScoreBgColor(aiScore)} border-b`}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <WarningIcon className={`w-6 h-6 text-${warning.color}-600`} />
            AI Detection Analysis
          </CardTitle>
          <Badge variant="outline" className={`${getScoreBgColor(aiScore)} ${getScoreColor(aiScore)} border-${warning.color}-300 font-semibold`}>
            {warning.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">AI-Generated Likelihood</span>
              <span className={`text-2xl font-bold ${getScoreColor(aiScore)}`}>
                {aiScore}%
              </span>
            </div>
            <Progress value={aiScore} className="h-3" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Human-Written Likelihood</span>
              <span className="text-2xl font-bold text-green-600">
                {humanScore}%
              </span>
            </div>
            <Progress value={humanScore} className="h-3" />
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${
          aiScore < 30 ? 'bg-green-50 border-green-200' : 
          aiScore < 60 ? 'bg-yellow-50 border-yellow-200' : 
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            <WarningIcon className={`w-5 h-5 mt-0.5 text-${warning.color}-600`} />
            <div>
              <p className={`font-semibold text-${warning.color}-800 mb-1`}>
                {warning.message}
              </p>
              <p className={`text-sm text-${warning.color}-700`}>
                {explanation || "Our analysis examines patterns, vocabulary consistency, and structural elements to estimate authenticity."}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Why This Matters</p>
              <p>Academic institutions use similar detection tools. This analysis helps you understand how your work might be perceived and gives you the opportunity to revise before submission.</p>
            </div>
          </div>
        </div>

        {aiScore >= 60 && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-2">⚠️ Academic Integrity Warning</p>
                <p className="mb-2">Your submission has a high likelihood of being flagged as AI-generated. Consider:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Adding more personal analysis and examples</li>
                  <li>Including your unique perspective and voice</li>
                  <li>Revising sections that sound overly formal or generic</li>
                  <li>Ensuring proper citation of any AI assistance used</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}