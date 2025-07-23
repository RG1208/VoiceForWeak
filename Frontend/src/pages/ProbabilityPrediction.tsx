import React, { useState, useRef } from 'react';
import { Upload, FileAudio, AlertCircle, CheckCircle, Scale, Brain, FileText, Loader2, Sparkles } from 'lucide-react';
import ProtectedHeader from '../components/protectedHeader';
import { useTranslation } from 'react-i18next';

interface PredictionResult {
    accused_win_probability: number;
    petitioner_win_probability: number;
    role: string;
    category: string;
    suggested_evidence: string[];
}

interface UploadState {
    isDragging: boolean;
    isUploading: boolean;
    progress: number;
}

function ProbabilityPrediction() {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string>('');
    const [uploadState, setUploadState] = useState<UploadState>({
        isDragging: false,
        isUploading: false,
        progress: 0
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a'];
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    const validateFile = (file: File): string | null => {
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
            return 'Please upload an MP3, WAV, or M4A audio file';
        }
        if (file.size > maxFileSize) {
            return 'File size must be less than 50MB';
        }
        return null;
    };

    const handleFileSelect = (selectedFile: File) => {
        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            return;
        }

        setFile(selectedFile);
        setError('');
        setResult(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setUploadState(prev => ({ ...prev, isDragging: false }));

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            handleFileSelect(droppedFiles[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setUploadState(prev => ({ ...prev, isDragging: true }));
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setUploadState(prev => ({ ...prev, isDragging: false }));
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            handleFileSelect(selectedFiles[0]);
        }
    };

    const simulateProgress = () => {
        const intervals = [0, 20, 45, 70, 85, 95];
        let currentIndex = 0;

        const updateProgress = () => {
            if (currentIndex < intervals.length) {
                setUploadState(prev => ({ ...prev, progress: intervals[currentIndex] }));
                currentIndex++;
                setTimeout(updateProgress, 400 + Math.random() * 300);
            }
        };

        updateProgress();
    };

    const handleSubmit = async () => {
        if (!file) return;

        setUploadState({ isDragging: false, isUploading: true, progress: 0 });
        setError('');
        simulateProgress();

        const formData = new FormData();
        formData.append('audio', file);

        try {
            const response = await fetch('http://localhost:5000/api/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            const data = await response.json();
            setUploadState(prev => ({ ...prev, progress: 100 }));

            setTimeout(() => {
                setResult(data);
                setUploadState({ isDragging: false, isUploading: false, progress: 0 });
            }, 500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setUploadState({ isDragging: false, isUploading: false, progress: 0 });
        }
    };

    const resetForm = () => {
        setFile(null);
        setResult(null);
        setError('');
        setUploadState({ isDragging: false, isUploading: false, progress: 0 });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            <ProtectedHeader />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12 relative z-10">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl">
                            <Scale className="w-8 h-8 text-white" />
                        </div>

                    </div>
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">
                        {t('legal_audio_analyzer')}
                    </h1>
                    <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
                        {t('legal_audio_analyzer_desc')}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-700 text-sm font-medium">{t('powered_by_ml')}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-2xl border border-blue-200/50 p-8 relative z-10">
                    {!result ? (
                        <>
                            {/* File Upload Area */}
                            <div
                                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-500 cursor-pointer ${uploadState.isDragging
                                    ? 'border-blue-500 bg-blue-50 scale-105 shadow-xl'
                                    : file
                                        ? 'border-green-500 bg-green-50 shadow-lg'
                                        : 'border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg'
                                    }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => !uploadState.isUploading && fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".mp3,.wav,.m4a,audio/*"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                    disabled={uploadState.isUploading}
                                />

                                {!file ? (
                                    <div className="space-y-4">
                                        <div className={`mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center transition-transform duration-500 shadow-xl ${uploadState.isDragging ? 'scale-125 rotate-12' : 'hover:scale-110 hover:rotate-6'
                                            }`}>
                                            <Upload className="w-10 h-10 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-800 mb-3">
                                                {t('drop_audio_here')}
                                            </p>
                                            <p className="text-gray-600 text-lg">
                                                {t('supports_audio_types')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="bg-green-100 p-4 rounded-full border border-green-300">
                                                <FileAudio className="w-8 h-8 text-green-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-800 text-lg">{file.name}</p>
                                                <p className="text-green-600">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-4">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                            <span className="text-green-700 font-semibold text-lg">{t('file_ready')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-700 text-lg">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="mt-8 text-center">
                                {!uploadState.isUploading ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!file}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-10 rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-4 mx-auto text-lg"
                                    >
                                        <Brain className="w-6 h-6" />
                                        <span>{t('analyze_audio')}</span>
                                        <Sparkles className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
                                            <div className="flex items-center justify-center gap-4 mb-6">
                                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                                <span className="text-blue-800 font-bold text-xl">{t('analyzing_audio')}</span>
                                            </div>
                                            <div className="w-full bg-blue-200 rounded-full h-4 mb-4">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out shadow-lg"
                                                    style={{ width: `${uploadState.progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-center text-blue-700 text-lg font-semibold">{uploadState.progress}% complete</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Results Display */
                        <div className="space-y-8">
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl">
                                    <CheckCircle className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('analysis_complete')}</h2>
                                <p className="text-gray-600 text-xl">{t('analysis_results')}</p>
                            </div>

                            {/* Probability Cards */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-blue-800 mb-4">{t('accused_win_probability')}</h3>
                                        <div className="text-6xl font-bold text-blue-700 mb-4">
                                            {result.accused_win_probability}%
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-4">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-2000 shadow-lg"
                                                style={{ width: `${result.accused_win_probability}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border border-green-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-green-800 mb-4">{t('petitioner_win_probability')}</h3>
                                        <div className="text-6xl font-bold text-green-700 mb-4">
                                            {result.petitioner_win_probability}%
                                        </div>
                                        <div className="w-full bg-green-200 rounded-full h-4">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-2000 shadow-lg"
                                                style={{ width: `${result.petitioner_win_probability}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role and Category */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                        <Scale className="w-6 h-6 text-blue-600" />
                                        {t('legal_role')}
                                    </h3>
                                    <div className="inline-flex items-center px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                                        {result.role}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-indigo-600" />
                                        {t('case_category')}
                                    </h3>
                                    <div className="inline-flex items-center px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                                        {result.category}
                                    </div>
                                </div>
                            </div>

                            {/* Evidence Suggestions */}
                            {result.suggested_evidence && result.suggested_evidence.length > 0 && (
                                <div className="bg-white rounded-2xl p-8 border border-amber-200 shadow-xl">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <FileText className="w-7 h-7 text-amber-600" />
                                        {t('suggested_evidence')}
                                    </h3>
                                    <ul className="space-y-4">
                                        {result.suggested_evidence.map((suggestion, index) => (
                                            <li key={index} className="flex items-start gap-4 bg-white/70 rounded-xl p-4 hover:bg-white/90 transition-all duration-300 shadow-sm">
                                                <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                                                <span className="text-gray-700 text-lg leading-relaxed">{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-6 pt-8">
                                <button
                                    onClick={resetForm}
                                    className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 px-8 rounded-2xl border border-gray-300 shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-105"
                                >
                                    {t('analyze_another_file')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProbabilityPrediction;