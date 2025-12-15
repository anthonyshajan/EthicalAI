import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function MyWork() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadSubmissions();
    }
  }, [currentUser]);

  const loadSubmissions = async () => {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (submissionId) => {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    
    try {
      await deleteDoc(doc(db, 'submissions', submissionId));
      await loadSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission. Please try again.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSubmissionTypeLabel = (submission) => {
    if (submission.type === 'ai-check') return 'AI Detection Check';
    if (submission.type === 'feedback') return 'Assignment Feedback';
    return 'Submission';
  };

  const getStatusBadge = (submission) => {
    if (submission.type === 'ai-check') {
      if (submission.aiDetected) {
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
              AI Detected
            </span>
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              Appears Human-Written
            </span>
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading your work...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Work</h1>
          <p className="text-gray-600">View your past submissions and feedback</p>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No submissions yet</p>
              <p className="text-sm text-gray-400">Upload your first assignment or check your work for AI content to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {getSubmissionTypeLabel(submission)}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(submission.createdAt)}
                      </p>

                      <p className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">File:</span> {submission.fileName}
                      </p>

                      {submission.textPreview && (
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Preview:</span> {submission.textPreview.substring(0, 100)}...
                        </p>
                      )}

                      {getStatusBadge(submission)}

                      {submission.type === 'feedback' && submission.score !== undefined && (
                        <div className="mt-3">
                          <div className="inline-block px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <span className="text-3xl font-bold text-blue-600">{submission.score}/100</span>
                            <p className="text-xs text-gray-600 mt-1">Quality Score</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => navigate(`/submission/${submission.id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleDelete(submission.id)}
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
