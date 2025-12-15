import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function LocalDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      const db = getFirestore();
      const q = query(
        collection(db, "assignments"),
        where("created_by", "==", user?.email || "anonymous"),
        orderBy("created_date", "desc")
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "assignments", id));
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Delete failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Work</h1>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            + New Assignment
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No assignments yet</p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Upload Your First Assignment
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {assignment.task_type?.replace(/_/g, ' ')} • 
                      {assignment.created_date?.toDate?.()?.toLocaleDateString() || 'Recently'}
                    </p>
                    
                    {assignment.analysis_complete && (
                      <div className="flex gap-4 mt-3">
                        <div className="text-sm">
                          <span className="text-gray-600">AI Score: </span>
                          <span className="font-bold text-blue-600">
                            {assignment.ai_detection_score}%
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Human Score: </span>
                          <span className="font-bold text-green-600">
                            {assignment.human_score}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {assignment.analysis_complete && (
                      <button
                        onClick={() => navigate(`/analysis?id=${assignment.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}