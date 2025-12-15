import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, BookOpen, HelpCircle, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImprovementSuggestions({ improvementPlan }) {
  if (!improvementPlan) return null;

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      {improvementPlan.overall_assessment && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lightbulb className="w-5 h-5" />
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800">{improvementPlan.overall_assessment}</p>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {improvementPlan.strengths && improvementPlan.strengths.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-900">
              ✓ Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {improvementPlan.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-gray-800">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Areas for Improvement */}
      {improvementPlan.areas_for_improvement && improvementPlan.areas_for_improvement.length > 0 && (
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <ArrowRight className="w-5 h-5" />
              Areas for Growth
            </CardTitle>
            <p className="text-sm text-orange-700 mt-2">
              Guidance to help you improve - not answers, but directions to explore
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {improvementPlan.areas_for_improvement.map((area, index) => (
              <div key={index} className="border-l-4 border-orange-400 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">{area.area}</h4>
                
                {area.current_state && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Current State:</p>
                    <p className="text-sm text-gray-600">{area.current_state}</p>
                  </div>
                )}

                {area.guidance && (
                  <div className="mb-3 bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 mb-1">Guidance:</p>
                    <p className="text-sm text-orange-800">{area.guidance}</p>
                  </div>
                )}

                {area.questions_to_consider && area.questions_to_consider.length > 0 && (
                  <div className="bg-white border border-orange-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Questions to Help You Think Deeper:
                    </p>
                    <ul className="space-y-2">
                      {area.questions_to_consider.map((question, qIndex) => (
                        <li key={qIndex} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-orange-500 font-bold">?</span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Critical Thinking Prompts */}
      {improvementPlan.critical_thinking_prompts && improvementPlan.critical_thinking_prompts.length > 0 && (
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <HelpCircle className="w-5 h-5" />
              Critical Thinking Exercises
            </CardTitle>
            <p className="text-sm text-purple-700 mt-2">
              These questions help deepen your understanding and strengthen your work
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {improvementPlan.critical_thinking_prompts.map((prompt, index) => (
                <li key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                      {index + 1}
                    </Badge>
                    <p className="text-gray-800 flex-1">{prompt}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {improvementPlan.next_steps && improvementPlan.next_steps.length > 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BookOpen className="w-5 h-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {improvementPlan.next_steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Badge className="bg-blue-600 text-white">{index + 1}</Badge>
                  <span className="text-gray-800 flex-1">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Transparency Notice */}
      <Card className="border-2 border-gray-300 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">Why We Give These Suggestions</p>
              <p>
                All suggestions are designed to help you learn and improve your own work. 
                We don't provide answers or complete sections for you. Instead, we guide 
                you to think critically, identify gaps, and develop stronger arguments 
                through your own effort and understanding.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}