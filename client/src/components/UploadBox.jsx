import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, FileUp, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UploadBox = ({ sessionId }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    setStatus(null);
    const validTypes = ['text/plain', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setStatus({ type: 'error', message: 'Invalid file type. Only PDF and TXT allowed.' });
      return;
    }
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);
    if (sessionId) {
      formData.append("sessionId", sessionId);
    }

    try {
      const response = await axios.post(`${API_URL}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.message === 'Document already exists') {
        setStatus({ type: 'error', message: 'Document already exists in the database!' });
      } else {
        setStatus({ type: 'success', message: 'File extracted and added to knowledge base!' });
        handleRemoveFile();
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Failed to upload document';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl overflow-hidden h-full transition-all duration-300 hover:-translate-y-1">
      <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2.5">
        <FileUp size={20} className="text-indigo-400" />
        <h2 className="font-semibold text-gray-200">Knowledge Base</h2>
      </div>
      
      <div className="p-5 flex flex-col h-full">
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          Upload PDF or TXT documents below to enrich the chatbot's memory.
        </p>

        <form onSubmit={handleUpload} className="flex-1 flex flex-col relative justify-center">
          {!file ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                  : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/5'
              }`}
            >
              <FileUp size={40} className={`mb-3 transition-colors duration-300 ${isDragActive ? 'text-indigo-400' : 'text-gray-500'}`} />
              <p className="text-gray-300 font-medium text-center mb-1">
                Drag & drop a file here
              </p>
              <p className="text-gray-500 text-xs text-center mb-4">
                Supports .PDF and .TXT
              </p>
              <div className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors">
                Browse Files
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-white/10 rounded-xl p-6 bg-white/5 relative group transition-all duration-300">
              <button 
                type="button" 
                onClick={handleRemoveFile}
                className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                disabled={loading}
              >
                <X size={16} />
              </button>
              <FileText size={48} className="text-indigo-400 mb-4" />
              <p className="text-gray-200 font-medium text-center w-full truncate max-w-[200px]" title={file.name}>
                {file.name}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt, .pdf, text/plain, application/pdf"
            className="hidden"
          />
          
          <button
            type="submit"
            disabled={loading || !file}
            className="mt-4 w-full py-3.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:opacity-90 disabled:from-white/10 disabled:to-white/10 disabled:text-gray-500 disabled:border-white/5 border border-transparent text-white rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Extracting & Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Add to Database
              </>
            )}
          </button>
        </form>

        {status && (
          <div className={`mt-4 p-3.5 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 ${
            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
          }`}>
            {status.type === 'success' ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
            <span className="leading-snug">{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBox;
