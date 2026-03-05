'use client';

import { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Results State
  const [insights, setInsights] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert('Please upload a valid CSV file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Route Error Data:", errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to process data');
      }

      const data = await response.json();
      setInsights(data.insights);
      setPosts(data.posts || []);
    } catch (error) {
      console.error(error);
      alert('An error occurred during analysis. Make sure GEMINI_API_KEY is set.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem 0' }}>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem', display: insights ? 'none' : 'block' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>Powered by Gemini AI</span>
        </div>

        <h1 className="heading-xl" style={{ color: 'var(--text-main)' }}>
          Turn Analytics into <span className="text-gradient">Viral Content</span>
        </h1>

        <p className="text-body" style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-muted)' }}>
          Upload your Instagram performance data (CSV). Our AI agent analyzes what works for your audience and generates optimized captions, hashtags, and format suggestions for your next posts.
        </p>
      </div>

      {/* Upload Section */}
      {!insights && (
        <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '3rem' }}>

          {!file ? (
            <div
              className={`upload-zone ${isHovering ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileUpload')?.click()}
            >
              <input
                id="fileUpload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <UploadCloud size={48} color={isHovering ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '1rem', transition: 'all 0.3s' }} />
              <h3 className="heading-lg" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Upload your metrics</h3>
              <p className="text-body" style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                Drag and drop your Instagram insights CSV here, or click to browse.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-surface)', marginBottom: '1.5rem', border: '1px solid var(--border-focus)' }}>
                <FileSpreadsheet size={40} color="var(--primary)" />
              </div>
              <h3 className="heading-lg" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{file.name}</h3>
              <p className="text-body" style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Ready to analyze your performance data.</p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={() => setFile(null)} disabled={isProcessing}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleProcessFile} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Analyzing Data...
                    </>
                  ) : (
                    <>
                      Generate Content
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Results Dashboard */}
      {insights && (
        <div className="animate-in" style={{ width: '100%', maxWidth: '1000px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="heading-lg" style={{ margin: 0, color: 'var(--text-main)' }}>Strategy Dashboard</h2>
            <button className="btn-secondary" onClick={() => { setInsights(null); setFile(null); }}>
              New Analysis
            </button>
          </div>

          <div className="glass-panel" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>
              <Sparkles size={20} /> Data Insights
            </h3>
            <p className="text-body" style={{ color: 'var(--text-main)' }}>{insights}</p>
          </div>

          <h3 className="heading-lg" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>AI Generated Content</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {posts.map((post, index) => (
              <div key={index} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'inline-block', alignSelf: 'flex-start', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {post.format}
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', lineHeight: 1.4, color: 'var(--text-main)' }}>{post.concept}</h4>
                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', flex: 1, border: '1px solid var(--border)' }}>
                  <p className="text-body" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{post.caption}</p>
                </div>
                <p style={{ color: 'var(--accent-2)', fontSize: '0.85rem' }}>{post.hashtags}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
