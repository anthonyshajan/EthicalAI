import React, { useState } from 'react';
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

export default function CheckWork() {
  const { currentUser } = useAuth();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setText('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !file) || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', text);
      }

      const response = await fetch(`${API_URL}/check-ai`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);

      if (currentUser) {
        try {
          await addDoc(collection(db, 'submissions'), {
            userId: currentUser.uid,
            type: 'ai-check',
            fileName: file?.name || 'Text Submission',
            textPreview: text.substring(0, 200) || `File: ${file?.name}`,
            aiDetectionScore: data.confidence || 0,
            aiDetected: data.ai_detected || false,
            analysis: data.analysis || {},
            createdAt: serverTimestamp()
          });
        } catch (saveError) {
          console.error('Error saving:', saveError);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error checking your work. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score <= 40) return 'blue';
    return 'red';
  };

  const scoreColor = result ? getScoreColor(result.confidence) : 'blue';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check for AI-Generated Content</h1>
          <p className="text-gray-600">See if your work might be flagged as AI-made</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Your Work</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Paste your text</Label>
                <Textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setFile(null);
                  }}
                  placeholder="Paste your text here..."
                  className="min-h-[200px]"
                  disabled={!!file}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Upload a file</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.md,.doc,.docx,.pdf,.py,.js,.jsx,.html,.css,.json"
                    className="hidden"
                    id="file-upload"
                    disabled={!!text.trim()}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports: Documents, Code - Max 10MB
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || (!text.trim() && !file)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Check for AI Content'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <div className="mt-6 space-y-6">
            {/* Main Result with Dynamic Color */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {result.confidence <= 40 ? 'Appears Human-Written' : 'AI Characteristics Detected'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          scoreColor === 'blue' ? 'bg-blue-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                    <span className={`text-2xl font-bold ${
                      scoreColor === 'blue' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {result.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Confidence Score</p>
                </div>
              </CardContent>
            </Card>

            {/* Human Indicators */}
            {result.analysis?.human_indicators && result.analysis.human_indicators.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">Human-Like Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.analysis.human_indicators.map((indicator, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                        <span className="text-gray-600 mt-0.5">✓</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{indicator.point}</p>
                          {indicator.example && (
                            <p className="text-xs text-gray-600 mt-1 italic">"{indicator.example}"</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* AI Indicators */}
            {result.analysis?.ai_indicators && result.analysis.ai_indicators.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">AI-Like Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.analysis.ai_indicators.map((indicator, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                        <span className="text-gray-600 mt-0.5">→</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{indicator.point}</p>
                          {indicator.example && (
                            <p className="text-xs text-gray-600 mt-1 italic">"{indicator.example}"</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Sentence Analysis */}
            {result.analysis?.line_analysis && result.analysis.line_analysis.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">Sentence-by-Sentence Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.analysis.line_analysis.map((line, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded border">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-600">Sentence {line.line_number}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              line.likely_ai ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {line.likely_ai ? 'AI Likely' : 'Human Likely'}
                            </span>
                            <span className="text-xs font-semibold text-gray-700">{line.confidence}%</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-800 mb-2 italic">"{line.text}"</p>
                        <p className="text-xs text-gray-600">{line.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
