import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { API_URL } from '../config/api'; 

export default function UploadPage() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [taskType, setTaskType] = useState(null);
  const [hasRubric, setHasRubric] = useState(null);
  const [rubric, setRubric] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setTaskType(null);
    setHasRubric(null);
    setRubric('');
    setFile(null);
    setResult(null);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTaskTypeClick = (type) => {
    setTaskType(taskType === type ? null : type);
  };

  const handleRubricClick = (value) => {
    setHasRubric(hasRubric === value ? null : value);
    if (value === false) {
      setRubric('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !taskType || hasRubric === null || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('task_type', taskType);
      if (hasRubric && rubric.trim()) {
        formData.append('rubric', rubric);
      }

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult({ ...data, taskType });

      if (currentUser) {
        try {
          await addDoc(collection(db, 'submissions'), {
            userId: currentUser.uid,
            type: 'feedback',
            taskType: taskType,
            fileName: file.name,
            score: data.score || 0,
            hasRubric: hasRubric && !!rubric.trim(),
            feedback: data.feedback || '',
            createdAt: serverTimestamp()
          });
          console.log('✅ Feedback saved to Firebase');
        } catch (saveError) {
          console.error('Error saving to Firebase:', saveError);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error getting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseFeedback = (feedbackText) => {
    const sections = {
      score: '',
      strengths: '',
      improvements: '',
      analysis: '',
      suggestions: '',
      assessment: ''
    };

    const lines = feedbackText.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('Score:')) {
        currentSection = 'score';
        sections.score = line.replace('Score:', '').trim();
      } else if (line.startsWith('Strengths:')) {
        currentSection = 'strengths';
      } else if (line.startsWith('Areas for Improvement:')) {
        currentSection = 'improvements';
      } else if (line.startsWith('Detailed Analysis:')) {
        currentSection = 'analysis';
      } else if (line.startsWith('Suggestions for Revision:')) {
        currentSection = 'suggestions';
      } else if (line.startsWith('Overall Assessment:')) {
        currentSection = 'assessment';
      } else if (line && currentSection) {
        sections[currentSection] += (sections[currentSection] ? '\n' : '') + line;
      }
    }

    return sections;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Assignment Feedback</h1>
          <p className="text-gray-600">Upload your work and receive detailed feedback</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Your Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="block text-sm font-medium mb-3">
                  What type of assignment is this?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {['essay', 'code', 'presentation', 'research'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTaskTypeClick(type)}
                      className={`px-4 py-3 rounded-lg border-2 transition text-left ${
                        taskType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {taskType === type && (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        )}
                        {taskType !== type && (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                        )}
                        <span className="font-medium capitalize">{type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-3">
                  Do you have a rubric, grading guide, or assignment details? (Optional)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' }
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleRubricClick(option.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition text-left ${
                        hasRubric === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {hasRubric === option.value && (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        )}
                        {hasRubric !== option.value && (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                        )}
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {hasRubric === true && (
                <div>
                  <Label className="block text-sm font-medium mb-2">
                    Paste your rubric or assignment details
                  </Label>
                  <Textarea
                    value={rubric}
                    onChange={(e) => setRubric(e.target.value)}
                    placeholder="Paste your assignment rubric, grading criteria, or specific requirements here..."
                    className="min-h-[120px]"
                  />
                </div>
              )}

              <div>
                <Label className="block text-sm font-medium mb-2">Upload Your File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.md,.doc,.docx,.pdf,.py,.js,.jsx,.html,.css,.json,.ppt,.pptx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports: Documents, Code, Presentations, Spreadsheets (Max 10MB)
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !file || !taskType || hasRubric === null}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Getting Feedback...
                  </>
                ) : (
                  'Get Feedback'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <div className="mt-6 space-y-6">
            {/* Overall Score Card */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback Results</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Analysis Type: {result.taskType.charAt(0).toUpperCase() + result.taskType.slice(1)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                  <span className="text-3xl font-bold text-blue-600">{result.score}/100</span>
                </div>
              </CardContent>
            </Card>

            {/* Strengths Card */}
            {(() => {
              const sections = parseFeedback(result.feedback);
              return (
                <>
                  {sections.strengths && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-gray-900">Strengths</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {sections.strengths}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Areas for Improvement Card */}
                  {sections.improvements && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-gray-900">Areas for Improvement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {sections.improvements}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Detailed Analysis Card */}
                  {sections.analysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-gray-900">Detailed Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {sections.analysis}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Suggestions Card */}
                  {sections.suggestions && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-gray-900">Suggestions for Revision</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {sections.suggestions}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Overall Assessment Card */}
                  {sections.assessment && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-gray-900">Overall Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {sections.assessment}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </Layout>
  );
}
