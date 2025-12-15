import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, MinusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RubricAlignmentCard({ criteria, feedbackData }) {
  const [expandedCriteria, setExpandedCriteria] = React.useState({});

  const toggleCriterion = (index) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getAlignmentColor = (score) => {
    if (score >= 80) return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" };
    if (score >= 60) return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" };
    return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" };
  };

  const getAlignmentIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <MinusCircle className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          Rubric Alignment Analysis
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          See how well your work addresses each rubric criterion
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {criteria && criteria.length > 0 ? (
          criteria.map((criterion, index) => {
            const feedback = feedbackData?.find(f => f.criterion_name === criterion.criterion);
            const alignmentScore = feedback?.alignment_score || 0;
            const colors = getAlignmentColor(alignmentScore);
            const isExpanded = expandedCriteria[index];

            return (
              <div key={index} className={`border-2 ${colors.border} rounded-lg overflow-hidden`}>
                <div className={`${colors.bg} p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getAlignmentIcon(alignmentScore)}
                        <h4 className="font-semibold text-gray-900">{criterion.criterion}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
                    </div>
                    {criterion.max_points && (
                      <Badge variant="outline" className="ml-2">
                        {criterion.max_points} pts
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Alignment Score</span>
                      <span className={`text-lg font-bold ${colors.text}`}>
                        {alignmentScore}%
                      </span>
                    </div>
                    <Progress value={alignmentScore} className="h-2" />
                  </div>

                  {feedback && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCriterion(index)}
                      className="w-full mt-3 justify-between"
                    >
                      <span className="text-sm font-medium">
                        {isExpanded ? 'Hide' : 'Show'} Detailed Feedback
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  )}
                </div>

                {isExpanded && feedback && (
                  <div className="bg-white p-4 space-y-4 border-t-2 border-gray-200">
                    {/* Criterion Intent */}
                    {feedback.explanation && (
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <p className="text-xs font-semibold text-indigo-900 mb-1">What This Criterion Asks For:</p>
                        <p className="text-sm text-indigo-800">{feedback.explanation}</p>
                      </div>
                    )}

                    {/* Overall Feedback */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Overall Assessment:</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{feedback.feedback_text}</p>
                    </div>

                    {/* Strengths with Examples */}
                    {feedback.strengths_found && feedback.strengths_found.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          What's Working Well:
                        </p>
                        {feedback.strengths_found.map((strength, idx) => (
                          <div key={idx} className="mb-3 last:mb-0">
                            <p className="text-xs font-mono bg-white p-2 rounded border border-green-200 mb-1 text-gray-800">
                              "{strength.example_text}"
                            </p>
                            <p className="text-xs text-green-800">✓ {strength.why_this_works}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Gaps Identified */}
                    {feedback.gaps_identified && feedback.gaps_identified.length > 0 && (
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <p className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Areas to Strengthen:
                        </p>
                        {feedback.gaps_identified.map((gap, idx) => (
                          <div key={idx} className="mb-3 last:mb-0 pl-3 border-l-2 border-orange-300">
                            <p className="text-sm font-medium text-orange-900">{gap.what_missing}</p>
                            <p className="text-xs text-orange-700 mt-1">Location: {gap.where_in_text}</p>
                            <p className="text-xs text-orange-800 mt-1">Impact: {gap.impact}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Specific Examples from Text */}
                    {feedback.specific_examples && feedback.specific_examples.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Specific Examples from Your Work:</p>
                        <div className="space-y-2">
                          {feedback.specific_examples.map((example, idx) => (
                            <p key={idx} className="text-xs font-mono bg-gray-100 p-2 rounded border text-gray-700">
                              "{example}"
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tailored Suggestions */}
                    {feedback.tailored_suggestions && feedback.tailored_suggestions.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Specific Ways to Improve:</p>
                        <ul className="space-y-2">
                          {feedback.tailored_suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                              <span className="text-blue-600 font-bold">{idx + 1}.</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Questions to Deepen Understanding */}
                    {feedback.suggested_questions && feedback.suggested_questions.length > 0 && (
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-sm font-semibold text-purple-900 mb-2">Questions to Deepen Your Thinking:</p>
                        <ul className="space-y-2">
                          {feedback.suggested_questions.map((question, qIndex) => (
                            <li key={qIndex} className="text-sm text-purple-800 flex items-start gap-2">
                              <span className="text-purple-600 font-bold">?</span>
                              <span>{question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No rubric uploaded</p>
            <p className="text-sm">Upload a rubric to see alignment analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}