import { useParams } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Upload, Video, CheckCircle, AlertCircle } from 'lucide-react';
import axiosClient from '../axiosClient';

function AdminUpload(){
    
    const { p_id } = useParams();
    const problemId = p_id;
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        setError,
        clearErrors
    } = useForm();

    const selectedFile = watch('videoFile')?.[0];

    // Upload video to Cloudinary
    const onSubmit = async (data) => {
        const file = data.videoFile[0];
        
        setUploading(true);
        setUploadProgress(0);
        clearErrors();

        try {
            // Step 1: Get upload signature from backend
            console.log("Fetching upload signature for problemId:", problemId);
            const signatureResponse = await axiosClient.get(`/solutionVideo/createSig/${problemId}`);
            const { signature, timestamp, public_id, api_key, upload_url } = signatureResponse.data;

            // Step 2: Create FormData for Cloudinary upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('public_id', public_id);
            formData.append('api_key', api_key);

            // Step 3: Upload directly to Cloudinary
            const uploadResponse = await axios.post(upload_url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });

            const cloudinaryResult = uploadResponse.data;

            // Step 4: Save video metadata to backend
            const metadataResponse = await axiosClient.post('/solutionVideo/save', {
                problemId: problemId,
                cloudinaryPublicId: cloudinaryResult.public_id,
                secureUrl: cloudinaryResult.secure_url,
                duration: cloudinaryResult.duration,
            });

            setUploadedVideo(metadataResponse.data.videoSolution);
            reset();
            
        } catch (err) {
            console.error('Upload error:', err);
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || 'Upload failed. Please try again.'
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format duration
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-300 p-6" style={{ paddingTop: "8rem" }}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-zinc-100 mb-2 flex items-center justify-center">
                        <Upload className="h-8 w-8 mr-3 text-red-500" />
                        Upload Solution Video
                    </h1>
                    <p className="text-zinc-400">Upload a video solution for this coding problem</p>
                </header>

                {/* Main Card */}
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* File Input Section */}
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-lg font-semibold text-zinc-100 flex items-center">
                                    <Video className="h-5 w-5 mr-2 text-red-500" />
                                    Choose Video File
                                </span>
                            </label>
                            
                            <input
                                type="file"
                                accept="video/*"
                                {...register('videoFile', {
                                    required: 'Please select a video file',
                                    validate: {
                                        isVideo: (files) => {
                                            if (!files || !files[0]) return 'Please select a video file';
                                            const file = files[0];
                                            return file.type.startsWith('video/') || 'Please select a valid video file';
                                        },
                                        fileSize: (files) => {
                                            if (!files || !files[0]) return true;
                                            const file = files[0];
                                            const maxSize = 100 * 1024 * 1024; // 100MB
                                            return file.size <= maxSize || 'File size must be less than 100MB';
                                        }
                                    }
                                })}
                                className={`w-full file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white file:cursor-pointer hover:file:bg-red-700 transition-all duration-200 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-zinc-300 cursor-pointer ${
                                    errors.videoFile ? 'border-red-500' : ''
                                }`}
                                disabled={uploading}
                            />
                            
                            {errors.videoFile && (
                                <div className="flex items-center text-red-400 text-sm">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {errors.videoFile.message}
                                </div>
                            )}
                        </div>

                        {/* Selected File Info */}
                        {selectedFile && (
                            <div className="bg-zinc-700/30 border border-zinc-600/50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <Video className="h-8 w-8 text-green-400 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-zinc-100 mb-1">Selected File:</h3>
                                        <p className="text-zinc-300 mb-1">{selectedFile.name}</p>
                                        <p className="text-zinc-400 text-sm">Size: {formatFileSize(selectedFile.size)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="bg-zinc-700/30 border border-zinc-600/50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-zinc-300 font-medium">Uploading...</span>
                                    <span className="text-red-400 font-semibold">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-zinc-600 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {errors.root && (
                            <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4">
                                <div className="flex items-center text-red-400">
                                    <AlertCircle className="h-5 w-5 mr-3" />
                                    <span>{errors.root.message}</span>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {uploadedVideo && (
                            <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="h-6 w-6 text-green-400 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-green-400 mb-2">Upload Successful!</h3>
                                        <p className="text-zinc-300 text-sm mb-1">
                                            Duration: {formatDuration(uploadedVideo.duration)}
                                        </p>
                                        <p className="text-zinc-400 text-sm">
                                            Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={uploading || !selectedFile}
                                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                                    uploading || !selectedFile
                                        ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25 transform hover:scale-105'
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-zinc-400 border-t-transparent"></div>
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5" />
                                        <span>Upload Video</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminUpload;
