import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '../components/Layout';

export default function Profile() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    avgFeedbackScore: 0,
    avgAiDetection: 0,
    feedbackCount: 0,
    aiCheckCount: 0,
    humanWritten: 0,
    aiDetected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserStats();
    }
  }, [currentUser]);

  const loadUserStats = async () => {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const submissions = querySnapshot.docs.map(doc => doc.data());
      
      const feedbackSubmissions = submissions.filter(s => s.type === 'feedback');
      const aiCheckSubmissions = submissions.filter(s => s.type === 'ai-check');
      
      const avgScore = feedbackSubmissions.length > 0
        ? feedbackSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / feedbackSubmissions.length
        : 0;
      
      const avgAi = aiCheckSubmissions.length > 0
        ? aiCheckSubmissions.reduce((sum, s) => sum + (s.aiDetectionScore || 0), 0) / aiCheckSubmissions.length
        : 0;
      
      const humanCount = aiCheckSubmissions.filter(s => !s.aiDetected).length;
      const aiCount = aiCheckSubmissions.filter(s => s.aiDetected).length;
      
      setStats({
        totalSubmissions: submissions.length,
        avgFeedbackScore: Math.round(avgScore),
        avgAiDetection: Math.round(avgAi),
        feedbackCount: feedbackSubmissions.length,
        aiCheckCount: aiCheckSubmissions.length,
        humanWritten: humanCount,
        aiDetected: aiCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Dashboard</h1>
          <p className="text-gray-600">Your account information and usage statistics</p>
        </div>

        {/* Stats Dashboard - No Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Submissions</p>
              <p className="text-4xl font-bold text-blue-600">{stats.totalSubmissions}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Avg Quality Score</p>
              <p className="text-4xl font-bold text-green-600">{stats.avgFeedbackScore}<span className="text-xl text-gray-400">/100</span></p>
              <p className="text-xs text-gray-500 mt-1">Average grade</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Feedback Reviews</p>
              <p className="text-4xl font-bold text-purple-600">{stats.feedbackCount}</p>
              <p className="text-xs text-gray-500 mt-1">Assignments reviewed</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">AI Checks</p>
              <p className="text-4xl font-bold text-orange-600">{stats.aiCheckCount}</p>
              <p className="text-xs text-gray-500 mt-1">Content scanned</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Breakdown and AI Detection - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Assignment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <svg className="w-48 h-48" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="8"
                      strokeDasharray={`${stats.totalSubmissions > 0 ? (stats.feedbackCount / stats.totalSubmissions * 251) : 0} 251`}
                      transform="rotate(-90 50 50)"
                      strokeLinecap="round"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#f97316" 
                      strokeWidth="8"
                      strokeDasharray={`${stats.totalSubmissions > 0 ? (stats.aiCheckCount / stats.totalSubmissions * 251) : 0} 251`}
                      transform={`rotate(${stats.totalSubmissions > 0 ? (stats.feedbackCount / stats.totalSubmissions * 360 - 90) : -90} 50 50)`}
                      strokeLinecap="round"
                    />
                    <text x="50" y="50" textAnchor="middle" dy=".3em" className="text-2xl font-bold" fill="#111827">
                      {stats.totalSubmissions}
                    </text>
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Assignment Feedback</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.feedbackCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">AI Detection Checks</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.aiCheckCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Detection Analysis - Simplified */}
          <Card>
            <CardHeader>
              <CardTitle>AI Detection Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Human-Written</span>
                    <span className="text-sm text-gray-600">{stats.humanWritten} submissions ({stats.aiCheckCount > 0 ? Math.round((stats.humanWritten / stats.aiCheckCount) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${stats.aiCheckCount > 0 ? (stats.humanWritten / stats.aiCheckCount * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">AI Detected</span>
                    <span className="text-sm text-gray-600">{stats.aiDetected} submissions ({stats.aiCheckCount > 0 ? Math.round((stats.aiDetected / stats.aiCheckCount) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full"
                      style={{ width: `${stats.aiCheckCount > 0 ? (stats.aiDetected / stats.aiCheckCount * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>

                {stats.avgAiDetection > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Average Detection Score</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.avgAiDetection}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${stats.avgAiDetection > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${stats.avgAiDetection}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.avgAiDetection < 30 ? '✓ Great! Your work appears human-written.' : 
                       stats.avgAiDetection < 60 ? '⚠ Some AI characteristics detected.' : 
                       '⚠ High AI detection - consider adding more personal voice.'}
                    </p>
                  </div>
                )}

                {stats.aiCheckCount === 0 && (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    <p className="text-sm">No AI checks performed yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border">{currentUser?.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Account Type</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border">Student</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">User ID</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border text-xs font-mono break-all">{currentUser?.uid}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Account Created</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                  {currentUser?.metadata?.creationTime 
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Last Sign In</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                  {currentUser?.metadata?.lastSignInTime 
                    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Integrity Commitment */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Integrity Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              By using EthicalAI, you agree to maintain academic integrity in all your work. 
              This platform is designed to help you learn and improve, not to complete assignments for you.
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">Our Promise:</p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• All AI assistance is transparent and educational</li>
                <li>• We guide your learning, never do your work</li>
                <li>• Every suggestion is designed to help you understand</li>
                <li>• Your academic growth is our priority</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
