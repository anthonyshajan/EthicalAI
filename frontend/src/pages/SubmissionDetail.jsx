import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';

export default function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const loadSubmission = async () => {
    try {
      const docRef = doc(db, 'submissions', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSubmission({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert('Submission not found');
        navigate('/mywork');
      }
    } catch (error) {
      console.error('Error loading submission:', error);
      alert('Error loading submission');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading submission...</p>
        </div>
      </Layout>
    );
  }

  if (!submission) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Submission not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <Button
          onClick={() => navigate('/mywork')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Work
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {submission.type === 'ai-check' ? 'AI Detection Check' : 'Assignment Feedback'}
          </h1>
          <p className="text-gray-600">{formatDate(submission.createdAt)}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">File:</span>
              <span className="ml-2 text-gray-900">{submission.fileName}</span>
            </div>
            {submission.taskType && (
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-900 capitalize">{submission.taskType}</span>
              </div>
            )}
            {submission.textPreview && (
              <div>
                <span className="font-medium text-gray-700">Preview:</span>
                <p className="mt-1 text-sm text-gray-600">{submission.textPreview}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Detection Results */}
        {submission.type === 'ai-check' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Detection Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-6 rounded-lg ${
                submission.aiDetected 
                  ? 'bg-red-50 border-2 border-red-200' 
                  : 'bg-green-50 border-2 border-green-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {submission.aiDetected ? (
                    <>
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <div>
                        <h3 className="font-bold text-red-900 text-lg">AI Content Detected</h3>
                        <p className="text-sm text-red-700">This content may be flagged as AI-generated</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-bold text-green-900 text-lg">Appears Human-Written</h3>
                        <p className="text-sm text-green-700">This content looks like it was written by a human</p>
                      </div>
                    </>
                  )}
                </div>
                {submission.aiDetectionScore !== undefined && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                      <span className="text-2xl font-bold">{submission.aiDetectionScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          submission.aiDetected ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${submission.aiDetectionScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback Results */}
        {submission.type === 'feedback' && (
          <>
            {/* Score */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-6xl font-bold text-blue-600">{submission.score}/100</p>
                  <p className="text-sm text-gray-600 mt-2">Quality Score</p>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            {submission.detailedAnalysis && (
              <Card className="mb-6 bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Overall Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {submission.detailedAnalysis}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Strengths */}
            {submission.strengths && submission.strengths.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {submission.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span className="text-sm text-gray-900">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Areas for Improvement */}
            {submission.improvements && submission.improvements.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {submission.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold mt-0.5">→</span>
                        <span className="text-sm text-gray-900">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Actionable Suggestions */}
            {submission.suggestions && submission.suggestions.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Actionable Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {submission.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span className="text-sm text-gray-900">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Rubric-specific feedback */}
            {submission.rubricFeedback && (
              <Card>
                <CardHeader>
                  <CardTitle>Rubric-Specific Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {submission.rubricFeedback}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
