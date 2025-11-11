'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { VisualizationConfig } from '@/lib/llm';

export default function Home() {
  const [config, setConfig] = useState<VisualizationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadVisualization();
  }, []);

  const loadVisualization = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load existing visualization first
      let response = await fetch('/api/visualization');
      if (!response.ok) {
        // If no existing visualization, regenerate
        response = await fetch('/api/regenerate', { method: 'POST' });
        if (!response.ok) {
          throw new Error('Failed to load or generate visualization');
        }
      }
      
      const data = await response.json();
      setConfig(data.config);
    } catch (err: any) {
      setError(err.message || 'Failed to load visualization');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setError(null);
      
      const response = await fetch('/api/regenerate', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate visualization');
      }
      
      const data = await response.json();
      setConfig(data.config);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate visualization');
    } finally {
      setRegenerating(false);
    }
  };

  const renderChart = () => {
    if (!config) return null;

    const colors = config.colors || ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe'];

    switch (config.chartType) {
      case 'line':
        return (
          <LineChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={config.yAxisKey || 'value'}
              stroke={colors[0]}
              strokeWidth={2}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={config.yAxisKey || 'value'} fill={colors[0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={config.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={config.dataKey || 'value'}
            >
              {config.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey={config.yAxisKey || 'value'}
              stroke={colors[0]}
              fill={colors[0]}
            />
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxisKey || 'x'} />
            <YAxis dataKey={config.yAxisKey || 'y'} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter dataKey={config.yAxisKey || 'y'} fill={colors[0]} />
          </ScatterChart>
        );

      case 'composed':
        return (
          <ComposedChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={config.yAxisKey || 'value'} fill={colors[0]} />
            <Line
              type="monotone"
              dataKey={config.yAxisKey || 'value'}
              stroke={colors[1]}
              strokeWidth={2}
            />
          </ComposedChart>
        );

      default:
        return <div>Unsupported chart type: {config.chartType}</div>;
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
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: regenerating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              opacity: regenerating ? 0.6 : 1,
            }}
          >
            {regenerating ? 'Regenerating...' : 'Regenerate'}
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
            Error: {error}
          </div>
        )}

        {!loading && !error && config && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#333' }}>
              {config.title}
            </h2>
            {config.description && (
              <p style={{ color: '#666', marginBottom: '2rem' }}>{config.description}</p>
            )}
            <ResponsiveContainer width="100%" height={500}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        )}

        {!loading && !error && !config && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
            No visualization available. Please add markdown files to the Publish folder.
          </div>
        )}
      </div>
    </main>
  );
}

