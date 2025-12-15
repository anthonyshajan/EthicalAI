import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function LocalUpload() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState("");
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [hasRubric, setHasRubric] = useState("no");
  const [rubricFile, setRubricFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file, type) => {
    if (type === "assignment") setAssignmentFile(file);
    else setRubricFile(file);
  };

  const uploadFile = async (file, path) => {
    const storage = getStorage();
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !taskType || !assignmentFile) {
      alert("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      // Upload files to Firebase Storage
      const assignmentUrl = await uploadFile(assignmentFile, "assignments");
      let rubricUrl = null;
      if (rubricFile) {
        rubricUrl = await uploadFile(rubricFile, "rubrics");
      }

      // Save to Firestore
      const db = getFirestore();
      const docRef = await addDoc(collection(db, "assignments"), {
        title,
        task_type: taskType,
        content_url: assignmentUrl,
        rubric_url: rubricUrl,
        status: "uploaded",
        analysis_complete: false,
        created_by: user?.email || "anonymous",
        created_date: serverTimestamp()
      });

      // Navigate to analysis
      navigate(`/analysis?id=${docRef.id}`);
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Upload failed. Try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Let me help you improve your work 📝
          </h1>
          <p className="text-lg text-gray-700">
            Upload what you've got so far, and I'll give you feedback to make it even better
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div>
              <label className="text-lg font-semibold mb-2 block text-gray-900">
                What are you working on?
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Essay on Climate Change"
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
              />
            </div>

            <div>
              <label className="text-lg font-semibold mb-3 block text-gray-900">
                What type of assignment is it?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Essay", emoji: "📝", value: "essay" },
                  { label: "Code", emoji: "💻", value: "code" },
                  { label: "Presentation", emoji: "📊", value: "presentation" },
                  { label: "Research Paper", emoji: "📚", value: "research_paper" },
                  { label: "Lab Report", emoji: "🔬", value: "lab_report" },
                  { label: "Other", emoji: "📄", value: "other" }
                ].map((type) => (
                  <label 
                    key={type.value} 
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      taskType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="taskType"
                      value={type.value}
                      checked={taskType === type.value}
                      onChange={(e) => setTaskType(e.target.value)}
                      required
                      className="sr-only"
                    />
                    <span className="text-2xl">{type.emoji}</span>
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-lg font-semibold mb-3 block text-gray-900">
                Upload your work
              </label>
              <input
                type="file"
                onChange={(e) => handleFileSelect(e.target.files[0], "assignment")}
                accept=".pdf,.doc,.docx,.txt,.py,.js"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {assignmentFile && (
                <p className="text-sm text-gray-600 mt-2">Selected: {assignmentFile.name}</p>
              )}
            </div>

            <div className="border-t pt-6">
              <label className="text-lg font-semibold mb-3 block text-gray-900">
                Do you have a rubric?
              </label>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="yes"
                    checked={hasRubric === "yes"}
                    onChange={(e) => setHasRubric(e.target.value)}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="no"
                    checked={hasRubric === "no"}
                    onChange={(e) => setHasRubric(e.target.value)}
                  />
                  <span>No</span>
                </label>
              </div>

              {hasRubric === "yes" && (
                <input
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files[0], "rubric")}
                  accept=".pdf,.doc,.docx,.txt"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || !title || !taskType || !assignmentFile}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-7 shadow-lg font-semibold rounded-xl disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Get My Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}