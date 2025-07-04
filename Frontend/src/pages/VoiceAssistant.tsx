import React, { useState, useRef } from 'react';
import { Mic, MicOff, Play, Pause, RotateCcw, Send } from 'lucide-react';

const VoiceAssistant: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate voice recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const playRecording = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000); // Simulate playback
  };

  const resetRecording = () => {
    setHasRecording(false);
    setIsPlaying(false);
    setRecordingTime(0);
    setAnalysis(null);
  };

  // Simulate ML analysis
  const analyzeRecording = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis response
    const mockAnalysis = `Based on your voice input, I understand you're facing a human rights concern. Here's what I recommend:

1. **Document Everything**: Keep detailed records of incidents, dates, times, and any witnesses.

2. **Legal Resources**: Contact your local human rights commission or legal aid society for professional assistance.

3. **Immediate Safety**: If you're in immediate danger, contact emergency services (911 in the US, 100 in India).

4. **Support Networks**: Reach out to community organizations and advocacy groups who can provide guidance and support.

5. **Know Your Rights**: Everyone has the right to dignity, safety, and equal treatment under the law.

Would you like me to connect you with specific resources in your area, or do you have additional questions about your rights?`;

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Human Rights Helpline
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your concerns using voice. Our AI assistant will analyze your situation and provide immediate guidance and support.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          {/* Voice Recording Interface */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
                } text-white shadow-lg`}
                disabled={isAnalyzing}
              >
                {isRecording ? (
                  <MicOff className="h-12 w-12" />
                ) : (
                  <Mic className="h-12 w-12" />
                )}
              </button>
              
              {isRecording && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Recording: {formatTime(recordingTime)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isRecording ? 'Recording your voice...' : 'Click to start recording'}
              </h3>
              <p className="text-gray-600">
                {isRecording
                  ? 'Speak clearly about your human rights concern. Click the microphone again to stop.'
                  : 'Press and hold the microphone button to record your voice message.'}
              </p>
            </div>
          </div>

          {/* Recording Controls */}
          {hasRecording && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={playRecording}
                  disabled={isPlaying || isAnalyzing}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Playing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Play Recording</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetRecording}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={analyzeRecording}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Get AI Analysis'}</span>
                </button>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Recording length: {formatTime(recordingTime)}
              </div>
            </div>
          )}

          {/* Analysis Loading */}
          {isAnalyzing && (
            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analyzing your voice input...
              </h3>
              <p className="text-gray-600">
                Our AI is carefully processing your message to provide the most helpful guidance.
              </p>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="bg-green-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-green-800 mb-4">
                AI Analysis & Guidance
              </h3>
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-line">
                  {analysis}
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This is AI-generated guidance and should not replace professional legal advice. For serious matters, please contact qualified legal professionals or emergency services.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Support Information */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Emergency Contacts & Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 rounded-xl p-4">
              <h4 className="font-semibold text-red-800 mb-2">Emergency Services</h4>
              <p className="text-sm text-red-700">
                Immediate danger: Call 911 (US) or your local emergency number
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Human Rights Commission</h4>
              <p className="text-sm text-blue-700">
                File complaints and get legal guidance from official channels
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2">Legal Aid Society</h4>
              <p className="text-sm text-green-700">
                Free legal assistance for those who cannot afford representation
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Support Hotlines</h4>
              <p className="text-sm text-purple-700">
                24/7 crisis support and counseling services available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;