'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkVisualization();
  }, []);

  const checkVisualization = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/visualization/image');
      if (response.ok) {
        setImageUrl(`/api/visualization/image?t=${Date.now()}`);
      } else {
        await regenerateVisualization();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load visualization');
    } finally {
      setLoading(false);
    }
  };

  const regenerateVisualization = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/visualization', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate');
      }
      setImageUrl(`/api/visualization/image?t=${Date.now()}`);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
            Markdown Visualization Dashboard
          </h1>
          <button
            onClick={regenerateVisualization}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : 'Regenerate'}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
            Loading visualization...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '0.5rem',
              color: '#c33',
              marginBottom: '2rem',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && imageUrl && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <img 
              src={imageUrl} 
              alt="Generated Visualization" 
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
            />
          </div>
        )}

        {!loading && !error && !imageUrl && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
            No visualization available. Please add markdown files to the documents folder and generate the visualization.
          </div>
        )}
      </div>
    </main>
  );
}
