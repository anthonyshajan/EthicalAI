import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EthicalAI</h1>
              <p className="text-xs text-gray-600">Academic Integrity Platform</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/login')}>Sign In</Button>
            <Button onClick={() => navigate('/login')}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Incorporating AI Ethically in Education
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
          A platform designed to help students succeed with integrity by providing ethical AI guidance, 
          feedback, and support throughout their academic journey.
        </p>
        <Button size="lg" className="text-lg px-8" onClick={() => navigate('/login')}>
          Start Learning Ethically →
        </Button>
      </section>

      {/* Purpose Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Purpose</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Academic Integrity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We help students maintain academic honesty while leveraging AI tools responsibly. 
                Learn to use AI as a learning aid, not a shortcut.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Ethical Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our AI provides hints and guidance without doing your work for you. 
                Develop critical thinking skills while getting the support you need.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Feedback & Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receive detailed feedback on your work, check for AI-generated content, 
                and improve your skills with personalized suggestions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI Detection</h3>
                <p className="text-gray-600">
                  Check if your work might be flagged as AI-generated before submission
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Ask AI for Help</h3>
                <p className="text-gray-600">
                  Get guidance and hints without getting direct answers
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Assignment Feedback</h3>
                <p className="text-gray-600">
                  Upload your work and receive comprehensive feedback with or without rubrics
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Track Your Progress</h3>
                <p className="text-gray-600">
                  View your past submissions and track your improvement over time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Sign Up', desc: 'Create your account with your student email' },
            { step: '2', title: 'Get Help', desc: 'Ask questions or upload your work for feedback' },
            { step: '3', title: 'Learn & Improve', desc: 'Receive ethical guidance and actionable suggestions' },
            { step: '4', title: 'Submit with Confidence', desc: 'Know your work is authentic and high-quality' }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Learn Ethically?</h2>
          <p className="text-xl mb-8">
            Join students who are using AI responsibly to enhance their learning
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 EthicalAI. Built for academic integrity and student success.</p>
        </div>
      </footer>
    </div>
  );
}
