import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Download } from "lucide-react";
import AIDetectionCard from "../components/analysis/AIDetectionCard";
import RubricAlignmentCard from "../components/analysis/RubricAlignmentCard";
import ImprovementSuggestions from "../components/analysis/ImprovementSuggestions";
import PlagiarismReport from "../components/analysis/PlagiarismReport";

export default function Analysis() {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [improvementPlan, setImprovementPlan] = useState(null);
  const [plagiarismReport, setPlagiarismReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('id');
    
    if (assignmentId) {
      analyzeAssignment(assignmentId);
    }
  }, []);

  const analyzeAssignment = async (assignmentId) => {
    setIsAnalyzing(true);

    try {
      // Get assignment
      const assignmentData = await base44.entities.Assignment.get(assignmentId);
      
      // Fetch file content
      const contentResponse = await fetch(assignmentData.content_url);
      const contentText = await contentResponse.text();

      // AI Detection Analysis
      const detectionPrompt = `Analyze this academic content for AI-generation likelihood. Provide:
1. AI-generated likelihood score (0-100)
2. Human-written likelihood score (0-100)
3. Brief explanation

Content: ${contentText.substring(0, 3000)}

Return as JSON: {"ai_score": number, "human_score": number, "explanation": string}`;

      const detectionResult = await base44.integrations.Core.InvokeLLM({
        prompt: detectionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            ai_score: { type: "number" },
            human_score: { type: "number" },
            explanation: { type: "string" }
          }
        }
      });

      // Get user's past submissions for style analysis
      const pastAssignments = await base44.entities.Assignment.filter(
        { created_by: (await base44.auth.me()).email },
        '-created_date',
        5
      );
      const pastTexts = pastAssignments
        .filter(a => a.id !== assignmentId && a.extracted_text)
        .map(a => a.extracted_text.substring(0, 1000))
        .join('\n---\n');

      // Enhanced Plagiarism Detection with Internet Search & Style Analysis
      const plagiarismPrompt = `Perform comprehensive plagiarism and originality analysis.

CURRENT SUBMISSION:
${contentText.substring(0, 3000)}

PAST SUBMISSIONS BY THIS STUDENT:
${pastTexts || 'No past submissions available'}

ANALYSIS REQUIREMENTS:
1. Check against web sources and academic content
2. Identify specific phrases/passages that match external sources
3. For flagged sections, identify likely source URLs or titles
4. Analyze writing style consistency with past work
5. Detect significant style deviations (vocabulary, sentence structure, complexity)

PROVIDE COMPREHENSIVE JSON:
- plagiarism_risk (0-100)
- originality_score (0-100)
- flagged_sections: array with {text, concern_level, reason, potential_sources: [{title, url, match_percentage}]}
- citation_issues: specific attribution problems
- recommendations: actionable citation advice
- style_analysis: {
    consistency_score (0-100),
    deviations_detected: [{aspect, description, concern_level}],
    writing_fingerprint: description of current style,
    comparison_notes: how this compares to past work
  }

Return detailed JSON with source links where possible.`;

      const plagiarismResult = await base44.integrations.Core.InvokeLLM({
        prompt: plagiarismPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            plagiarism_risk: { type: "number" },
            originality_score: { type: "number" },
            flagged_sections: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  text: { type: "string" },
                  concern_level: { type: "string" },
                  reason: { type: "string" },
                  potential_sources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        url: { type: "string" },
                        match_percentage: { type: "number" }
                      }
                    }
                  }
                }
              }
            },
            citation_issues: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            style_analysis: {
              type: "object",
              properties: {
                consistency_score: { type: "number" },
                deviations_detected: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      aspect: { type: "string" },
                      description: { type: "string" },
                      concern_level: { type: "string" }
                    }
                  }
                },
                writing_fingerprint: { type: "string" },
                comparison_notes: { type: "string" }
              }
            }
          }
        }
      });

      // Extract rubric if provided
      let rubricCriteria = [];
      if (assignmentData.rubric_url) {
        const rubricExtraction = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: assignmentData.rubric_url,
          json_schema: {
            type: "object",
            properties: {
              criteria: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    criterion: { type: "string" },
                    description: { type: "string" },
                    max_points: { type: "number" }
                  }
                }
              }
            }
          }
        });

        if (rubricExtraction.status === "success") {
          rubricCriteria = rubricExtraction.output.criteria || [];
        }
      }

      // Generate feedback for each criterion
      const feedbackList = [];
      for (const criterion of rubricCriteria) {
        const feedbackPrompt = `As an expert academic advisor, perform a deep analysis of how this student work aligns with the rubric criterion. Go beyond keyword matching - understand the INTENT of the criterion.

RUBRIC CRITERION:
Name: ${criterion.criterion}
Description: ${criterion.description}
Points: ${criterion.max_points || 'Not specified'}

STUDENT WORK (Full Text):
${contentText.substring(0, 3000)}

ANALYSIS REQUIREMENTS:
1. Understand the deeper intent and expectations of this criterion
2. Identify SPECIFIC passages from the student's work that relate to this criterion
3. Analyze strengths with concrete examples
4. Identify gaps with specific examples of what's missing
5. Provide actionable, criterion-specific improvement guidance

RETURN DETAILED JSON with:
- alignment_score: 0-100 (nuanced assessment)
- criterion_intent: what this criterion is really asking for
- strengths_found: array of {example_text, why_this_works}
- gaps_identified: array of {what_missing, where_in_text, impact}
- specific_examples: array of direct quotes showing alignment or misalignment
- tailored_suggestions: criterion-specific improvements (not generic advice)
- questions_to_deepen: thought-provoking questions specific to this criterion
- explanation: overall nuanced assessment

Be specific. Quote actual text. Don't be generic.`;

        const feedbackResult = await base44.integrations.Core.InvokeLLM({
          prompt: feedbackPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              alignment_score: { type: "number" },
              criterion_intent: { type: "string" },
              strengths_found: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    example_text: { type: "string" },
                    why_this_works: { type: "string" }
                  }
                }
              },
              gaps_identified: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    what_missing: { type: "string" },
                    where_in_text: { type: "string" },
                    impact: { type: "string" }
                  }
                }
              },
              specific_examples: { type: "array", items: { type: "string" } },
              tailored_suggestions: { type: "array", items: { type: "string" } },
              questions_to_deepen: { type: "array", items: { type: "string" } },
              explanation: { type: "string" }
            }
          }
        });

        const feedbackRecord = await base44.entities.Feedback.create({
          assignment_id: assignmentId,
          criterion_name: criterion.criterion,
          alignment_score: feedbackResult.alignment_score,
          feedback_text: feedbackResult.explanation,
          explanation: feedbackResult.criterion_intent,
          suggested_questions: feedbackResult.questions_to_deepen,
          feedback_type: feedbackResult.alignment_score >= 80 ? "strength" : "gap",
          strengths_found: feedbackResult.strengths_found,
          gaps_identified: feedbackResult.gaps_identified,
          specific_examples: feedbackResult.specific_examples,
          tailored_suggestions: feedbackResult.tailored_suggestions
        });

        feedbackList.push(feedbackRecord);
      }

      // Generate improvement plan
      const improvementPrompt = `Create a comprehensive improvement plan for this student's work.

Task Type: ${assignmentData.task_type}
Content: ${contentText.substring(0, 2500)}

Provide:
1. Overall assessment
2. Key strengths (3-5 items)
3. Areas for improvement with guidance (not solutions)
4. Critical thinking prompts (5 questions)
5. Next steps (actionable but not directive)

Remember: Guide learning, don't complete work.

Return as JSON.`;

      const improvementResult = await base44.integrations.Core.InvokeLLM({
        prompt: improvementPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            areas_for_improvement: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  current_state: { type: "string" },
                  guidance: { type: "string" },
                  questions_to_consider: { type: "array", items: { type: "string" } }
                }
              }
            },
            critical_thinking_prompts: { type: "array", items: { type: "string" } },
            next_steps: { type: "array", items: { type: "string" } }
          }
        }
      });

      const planRecord = await base44.entities.ImprovementPlan.create({
        assignment_id: assignmentId,
        ...improvementResult,
        ai_warning_issued: detectionResult.ai_score >= 60
      });

      // Update assignment
      await base44.entities.Assignment.update(assignmentId, {
        ai_detection_score: detectionResult.ai_score,
        human_score: detectionResult.human_score,
        rubric_criteria: rubricCriteria,
        extracted_text: contentText.substring(0, 5000),
        word_count: contentText.split(/\s+/).length,
        status: "analyzed",
        analysis_complete: true
      });

      setAssignment({
        ...assignmentData,
        ai_detection_score: detectionResult.ai_score,
        human_score: detectionResult.human_score,
        rubric_criteria: rubricCriteria
      });
      setFeedback(feedbackList);
      setImprovementPlan(planRecord);
      setPlagiarismReport(plagiarismResult);

    } catch (error) {
      console.error("Error analyzing assignment:", error);
      alert("Analysis failed. Please try again.");
    }

    setIsAnalyzing(false);
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Checking Your Work</h2>
          <p className="text-gray-600">
            Hang tight, this takes about 30-60 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Assignment not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {assignment.title}
          </h1>
          <p className="text-gray-600 capitalize">
            {assignment.task_type.replace(/_/g, ' ')} • {assignment.word_count} words
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* AI Detection */}
          <AIDetectionCard
            aiScore={assignment.ai_detection_score}
            humanScore={assignment.human_score}
          />

          {/* Rubric Alignment */}
          <RubricAlignmentCard
            criteria={assignment.rubric_criteria}
            feedbackData={feedback}
          />
        </div>

        {/* Plagiarism Report */}
        {plagiarismReport && (
          <div className="mb-6">
            <PlagiarismReport report={plagiarismReport} />
          </div>
        )}

        {/* Improvement Suggestions */}
        <ImprovementSuggestions improvementPlan={improvementPlan} />
      </div>
    </div>
  );
}