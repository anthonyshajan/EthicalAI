import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Code, Presentation, Eye, Trash2, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import Layout from "../components/Layout";

const taskIcons = {
  essay: FileText,
  code: Code,
  presentation: Presentation,
  research_paper: FileText,
  lab_report: FileText,
  other: FileText
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadAssignments();
    }
  }, [currentUser]);

  const loadAssignments = async () => {
    setIsLoading(true);
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
      
      setAssignments(data);
    } catch (error) {
      console.error("Error loading assignments:", error);
    }
    setIsLoading(false);
  };

  const deleteAssignment = async (id) => {
    if (!confirm("Delete this assignment? This cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, 'submissions', id));
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const getAIWarningBadge = (score) => {
    if (!score && score !== 0) return null;
    if (score < 30) return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Low Risk</Badge>;
    if (score < 60) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><AlertTriangle className="w-3 h-3 mr-1" />Moderate</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-red-300"><AlertTriangle className="w-3 h-3 mr-1" />High Risk</Badge>;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Assignments
          </h1>
          <p className="text-gray-600">
            All your checked work in one place
          </p>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nothing here yet
            </h3>
            <p className="text-gray-500 mb-6">
              Upload your first assignment to get it checked
            </p>
            <Button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Upload Assignment
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const TaskIcon = taskIcons[assignment.taskType || assignment.type] || FileText;
              const createdDate = assignment.createdAt?.toDate ? assignment.createdAt.toDate() : new Date();
              
              return (
                <div key={assignment.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <TaskIcon className="w-6 h-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {assignment.fileName || assignment.title || 'Untitled Assignment'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="capitalize">
                            {(assignment.taskType || assignment.type || 'document').replace(/_/g, ' ')}
                          </span>
                          <span>•</span>
                          <span>{format(createdDate, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    {assignment.aiDetectionScore !== undefined && getAIWarningBadge(assignment.aiDetectionScore)}
                  </div>

                  {assignment.score && (
                    <div className="flex gap-4 mb-3 p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-xs text-gray-600">Quality Score</p>
                        <p className="text-xl font-bold text-blue-600">{assignment.score}%</p>
                      </div>
                      {assignment.aiDetectionScore !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600">AI Detection</p>
                          <p className="text-xl font-bold text-orange-600">{assignment.aiDetectionScore}%</p>
                        </div>
                      )}
                    </div>
                  )}

                  {assignment.textPreview && (
                    <div className="mb-3 p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">Preview:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{assignment.textPreview}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {assignment.hasRubric ? '✓ Has rubric' : 'No rubric'}
                    </span>
                    <div className="flex gap-2">
                      {assignment.type === 'ai-check' && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/checkwork?id=${assignment.id}`)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      )}
                      {assignment.type === 'feedback' && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/upload?id=${assignment.id}`)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Feedback
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAssignment(assignment.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
