import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, ShieldAlert, Quote, Lightbulb, FileText } from "lucide-react";

export default function PlagiarismReport({ report }) {
  if (!report) return null;

  const getRiskLevel = () => {
    if (report.plagiarism_risk < 20) return { 
      color: "green", 
      text: "Low Risk", 
      icon: CheckCircle,
      bg: "bg-green-50",
      border: "border-green-300"
    };
    if (report.plagiarism_risk < 50) return { 
      color: "yellow", 
      text: "Moderate Risk", 
      icon: AlertTriangle,
      bg: "bg-yellow-50",
      border: "border-yellow-300"
    };
    return { 
      color: "red", 
      text: "High Risk", 
      icon: ShieldAlert,
      bg: "bg-red-50",
      border: "border-red-300"
    };
  };

  const getConcernColor = (level) => {
    if (level === "high") return "text-red-600 bg-red-50 border-red-200";
    if (level === "medium") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const risk = getRiskLevel();
  const RiskIcon = risk.icon;

  return (
    <Card className={`border-2 shadow-lg ${risk.border}`}>
      <CardHeader className={`${risk.bg} border-b`}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-6 h-6 text-purple-600" />
            Plagiarism & Originality Check
          </CardTitle>
          <Badge variant="outline" className={`${risk.bg} text-${risk.color}-800 border-${risk.color}-300 font-semibold`}>
            {risk.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Scores */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Plagiarism Risk</span>
              <span className={`text-2xl font-bold text-${risk.color}-600`}>
                {report.plagiarism_risk}%
              </span>
            </div>
            <Progress value={report.plagiarism_risk} className="h-3" />
            <p className="text-xs text-gray-600 mt-1">Lower is better</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Originality Score</span>
              <span className="text-2xl font-bold text-green-600">
                {report.originality_score}%
              </span>
            </div>
            <Progress value={report.originality_score} className="h-3" />
            <p className="text-xs text-gray-600 mt-1">Higher is better</p>
          </div>
        </div>

        {/* Overall Assessment */}
        <div className={`p-4 rounded-lg border-2 ${risk.bg} ${risk.border}`}>
          <div className="flex items-start gap-3">
            <RiskIcon className={`w-5 h-5 mt-0.5 text-${risk.color}-600`} />
            <div>
              <p className={`font-semibold text-${risk.color}-800 mb-1`}>
                {report.plagiarism_risk < 20 ? "Good Job! Your work appears original." :
                 report.plagiarism_risk < 50 ? "Some sections need attention." :
                 "Multiple concerns detected - review carefully."}
              </p>
              <p className={`text-sm text-${risk.color}-700`}>
                We compared your work against academic sources and web content to identify potential attribution issues.
              </p>
            </div>
          </div>
        </div>

        {/* Flagged Sections with Source Matches */}
        {report.flagged_sections && report.flagged_sections.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Sections That Need Review
            </h4>
            <div className="space-y-3">
              {report.flagged_sections.map((section, index) => (
                <div key={index} className={`border-2 rounded-lg p-4 ${getConcernColor(section.concern_level)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getConcernColor(section.concern_level)}>
                      {section.concern_level} concern
                    </Badge>
                  </div>
                  <p className="text-sm font-mono bg-white p-2 rounded border mb-2 text-gray-800">
                    "{section.text}"
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Why flagged:</strong> {section.reason}
                  </p>
                  
                  {/* Potential Source Matches */}
                  {section.potential_sources && section.potential_sources.length > 0 && (
                    <div className="mt-3 bg-white border border-gray-300 rounded p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Potential Sources:</p>
                      <div className="space-y-2">
                        {section.potential_sources.map((source, sIdx) => (
                          <div key={sIdx} className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              {source.url ? (
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline font-medium"
                                >
                                  {source.title}
                                </a>
                              ) : (
                                <span className="text-xs text-gray-700 font-medium">{source.title}</span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {source.match_percentage}% match
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Writing Style Analysis */}
        {report.style_analysis && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Writing Style Analysis
            </h4>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-800">Style Consistency</span>
                <span className="text-lg font-bold text-purple-700">
                  {report.style_analysis.consistency_score}%
                </span>
              </div>
              <Progress value={report.style_analysis.consistency_score} className="h-2" />
              <p className="text-xs text-purple-600 mt-1">
                {report.style_analysis.consistency_score >= 80 ? 'Consistent with your past work' :
                 report.style_analysis.consistency_score >= 60 ? 'Some style variations detected' :
                 'Significant style differences from past work'}
              </p>
            </div>

            {report.style_analysis.writing_fingerprint && (
              <div className="mb-3 bg-white p-3 rounded border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-1">Your Writing Style:</p>
                <p className="text-xs text-gray-700">{report.style_analysis.writing_fingerprint}</p>
              </div>
            )}

            {report.style_analysis.comparison_notes && (
              <div className="mb-3 bg-white p-3 rounded border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-1">Comparison to Past Work:</p>
                <p className="text-xs text-gray-700">{report.style_analysis.comparison_notes}</p>
              </div>
            )}

            {report.style_analysis.deviations_detected && report.style_analysis.deviations_detected.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-purple-900 mb-2">Style Deviations Detected:</p>
                <div className="space-y-2">
                  {report.style_analysis.deviations_detected.map((deviation, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-purple-200">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-purple-900">{deviation.aspect}</span>
                        <Badge variant="outline" className={
                          deviation.concern_level === 'high' ? 'bg-red-50 text-red-700' :
                          deviation.concern_level === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-blue-50 text-blue-700'
                        }>
                          {deviation.concern_level}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{deviation.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Citation Issues */}
        {report.citation_issues && report.citation_issues.length > 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Citation Issues Found
            </h4>
            <ul className="space-y-2">
              {report.citation_issues.map((issue, index) => (
                <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              How to Improve Your Citations & Originality
            </h4>
            <ul className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">{index + 1}.</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Educational Note */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">About This Check</p>
              <p>
                This analysis compares your work against publicly available content to help you identify 
                areas where proper citation is needed. Always cite your sources properly and express ideas 
                in your own words while giving credit to original authors.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}