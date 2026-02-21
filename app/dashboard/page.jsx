'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Image from 'next/image';
import logo from '@/public/infoBrainsLogo.png';
import {
  Users,
  Mail,
  Phone,
  Github,
  Download,
  RefreshCw,
  Code,
  Shield,
  Cpu,
  Camera,
  Smartphone,
  Award,
  Menu,
  X,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, byCategory: {}, byLevel: {} });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    fetchStudents();
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students-direct');
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
        calculateStats(data.data);
      } else throw new Error(data.error || 'Failed to fetch');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const byCategory = {};
    const byLevel = {};
    data.forEach(s => {
      byCategory[s.category] = (byCategory[s.category] || 0) + 1;
      byLevel[s.level] = (byLevel[s.level] || 0) + 1;
    });
    setStats({ total: data.length, byCategory, byLevel });
  };

  const PASTEL = ['#A8C5DA','#A8D5B5','#E8C5A0','#D4A8C5','#A8B8D8','#C5D4A8'];

  const categoryChartData = {
    labels: Object.keys(stats.byCategory).map(k => k.toUpperCase()),
    datasets: [{
      data: Object.values(stats.byCategory),
      backgroundColor: PASTEL,
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const levelChartData = {
    labels: Object.keys(stats.byLevel).map(k => k.toUpperCase()),
    datasets: [{
      label: 'Students',
      data: Object.values(stats.byLevel),
      backgroundColor: '#A8C5DA',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  // Responsive breakpoints
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Chart dimensions based on screen size
  const getChartHeight = () => {
    if (isMobile) return 200;
    if (isTablet) return 220;
    return 240;
  };

  // Donut chart options with responsive legend
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: isMobile ? '65%' : '60%',
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        align: 'center',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: isMobile ? 8 : 12,
          font: { 
            size: isMobile ? 10 : isTablet ? 11 : 12, 
            family: "'Inter', sans-serif" 
          },
          color: '#4B5563',
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: { 
        callbacks: { 
          label: ctx => ` ${ctx.label}: ${ctx.parsed}` 
        } 
      },
    },
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        callbacks: { 
          label: ctx => ` ${ctx.parsed.y} students` 
        } 
      } 
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: '#F3F4F6' }, 
        ticks: { 
          stepSize: 1, 
          font: { size: isMobile ? 9 : isTablet ? 10 : 11 }, 
          color: '#9CA3AF',
          maxTicksLimit: 5,
          callback: function(value) {
            return Number.isInteger(value) ? value : null;
          }
        }, 
        border: { display: false } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { 
          font: { size: isMobile ? 9 : isTablet ? 10 : 11, weight: '500' }, 
          color: '#6B7280',
          maxRotation: isMobile ? 30 : 0,
        }, 
        border: { display: false } 
      },
    },
  };

  const getCategoryIcon = (cat) => {
    const size = isMobile ? 10 : 12;
    const map = { 
      web: <Code size={size} />, 
      mobile: <Smartphone size={size} />, 
      ai: <Cpu size={size} />, 
      iot: <Cpu size={size} />, 
      security: <Shield size={size} />, 
      media: <Camera size={size} /> 
    };
    return map[cat] || <Award size={size} />;
  };

  const getLevelStyle = (level) => {
    const m = { 
      L1: { bg: '#D1FAE5', text: '#065F46' },
      L2: { bg: '#DBEAFE', text: '#1E40AF' },
      L3: { bg: '#F3E8FF', text: '#6B21A8' },
      M1: { bg: '#FEF3C7', text: '#92400E' },
      M2: { bg: '#FEE2E2', text: '#991B1B' }
    };
    return m[level] || { bg: '#F3F4F6', text: '#374151' };
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  const exportToCSV = () => {
    const headers = ['Full Name','Email','Phone','Matricule','Level','Category','Specialization','GitHub','Registered At'];
    const rows = students.map(s => [s.fullName,s.email,s.phone,s.matricule,s.level,s.category,s.specialization||'N/A',s.github||'N/A',formatDate(s.registeredAt)]);
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F9FAFB' }}>
      <div style={{ textAlign:'center' }}>
        <RefreshCw className='animate-spin' style={{ width: 28, height: 28, color: '#9CA3AF', margin:'0 auto 12px', animation:'spin 1s linear infinite' }} />
        <p style={{ color:'#6B7280', fontSize:13 }}>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9FAFB',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .row-hover:hover { background: #F9FAFB !important; }
        .btn-hover:hover { opacity: 0.8; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #F1F1F1; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
      `}</style>

      {/* Navbar */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: isMobile ? '0 16px' : '0 24px',
        height: isMobile ? 60 : 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 12 : 20 }}>
        <img src={logo.src} alt="Infobrains" style={{ height: isMobile ? 32 : 42, width: 'auto' }} />
      
            {!isMobile && <div style={{ width: 1, height: 32, background: '#E5E7EB' }} />}
          {!isMobile && (
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                Competition Dashboard
              </h1>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                Student Registration Management
              </p>
            </div>
          )}
          {isMobile && (
            <h1 style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
              Dashboard
            </h1>
          )}
        </div>

        {!isMobile && (
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <div style={{
              background: '#F3F4F6',
              borderRadius: 40,
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid #E5E7EB'
            }}>
              <Users size={15} color="#4B5563" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                {stats.total} Students
              </span>
            </div>

            <button onClick={fetchStudents} className="btn-hover" style={{ 
              padding: '8px', 
              background: '#FFFFFF', 
              border: '1px solid #E5E7EB', 
              borderRadius: 40, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38
            }}>
              <RefreshCw size={15} color="#4B5563" />
            </button>
            
            <button onClick={exportToCSV} className="btn-hover" style={{ 
              padding: '8px 18px', 
              background: '#111827', 
              border: 'none', 
              borderRadius: 40, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              color: '#fff', 
              fontSize: 13, 
              fontWeight: 500,
              height: 38
            }}>
              <Download size={14} />
              Export CSV
            </button>
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: 8,
              background: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: 40,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={18} color="#4B5563" /> : <Menu size={18} color="#4B5563" />}
          </button>
        )}
      </header>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{
            background: '#F3F4F6',
            borderRadius: 40,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid #E5E7EB'
          }}>
            <Users size={15} color="#4B5563" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
              {stats.total} Students
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={fetchStudents} className="btn-hover" style={{ 
              padding: '10px', 
              background: '#FFFFFF', 
              border: '1px solid #E5E7EB', 
              borderRadius: 40, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}>
              <RefreshCw size={15} color="#4B5563" />
              <span style={{ marginLeft: 6, fontSize: 12 }}>Refresh</span>
            </button>
            
            <button onClick={exportToCSV} className="btn-hover" style={{ 
              padding: '10px', 
              background: '#111827', 
              border: 'none', 
              borderRadius: 40, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 6, 
              color: '#fff', 
              fontSize: 12, 
              fontWeight: 500,
              flex: 1,
            }}>
              <Download size={14} />
              Export
            </button>
          </div>
        </div>
      )}

      <main style={{ 
        padding: isMobile ? '16px' : isTablet ? '20px' : '24px', 
        maxWidth: '1440px', 
        margin: '0 auto',
        width: '100%'
      }}>

        {/* Charts Row - Responsive grid with fixed aspect ratio containers */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: isMobile ? 16 : 20, 
          marginBottom: isMobile ? 20 : 24,
          width: '100%'
        }}>
          
          {/* Category Chart Container */}
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: 20, 
            padding: isMobile ? '16px' : '20px', 
            border: '1px solid #F0F0F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ marginBottom: isMobile ? 12 : 16 }}>
              <p style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: '#374151' }}>
                Distribution by Category
              </p>
              <p style={{ fontSize: isMobile ? 11 : 12, color: '#9CA3AF', marginTop: 2 }}>
                Students per competition category
              </p>
            </div>
            
            {/* Chart container with fixed height based on screen size */}
            <div style={{ 
              height: getChartHeight(), 
              width: '100%',
              position: 'relative',
            }}>
              <Doughnut 
                data={categoryChartData} 
                options={donutOptions} 
                redraw={true}
              />
            </div>
          </div>

          {/* Level Chart Container */}
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: 20, 
            padding: isMobile ? '16px' : '20px', 
            border: '1px solid #F0F0F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ marginBottom: isMobile ? 12 : 16 }}>
              <p style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: '#374151' }}>
                Distribution by Level
              </p>
              <p style={{ fontSize: isMobile ? 11 : 12, color: '#9CA3AF', marginTop: 2 }}>
                Students by academic level
              </p>
            </div>
            
            {/* Chart container with fixed height based on screen size */}
            <div style={{ 
              height: getChartHeight(), 
              width: '100%',
              position: 'relative',
            }}>
              <Bar 
                data={levelChartData} 
                options={barOptions} 
                redraw={true}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: 20, 
          border: '1px solid #F0F0F0', 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          width: '100%'
        }}>
          
          <div style={{ 
            padding: isMobile ? '12px 16px' : '16px 20px', 
            borderBottom: '1px solid #F3F4F6', 
          }}>
            <h2 style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#111827' }}>
              Registered Students
            </h2>
            <p style={{ fontSize: isMobile ? 11 : 12, color: '#6B7280', marginTop: 2 }}>
              {students.length} total registrations
            </p>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              minWidth: isMobile ? '900px' : '1000px'
            }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {[
                    { label: 'Student' },
                    { label: 'Contact' },
                    { label: 'Level' },
                    { label: 'Category' },
                    { label: 'Specialization' },
                    { label: 'GitHub' },
                    { label: 'Registered' },
                  ].map(h => (
                    <th 
                      key={h.label} 
                      style={{ 
                        padding: isMobile ? '10px 12px' : '12px 16px', 
                        textAlign: 'left', 
                        fontSize: isMobile ? 10 : 11, 
                        fontWeight: 600, 
                        color: '#6B7280', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                      }}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr 
                    key={student._id} 
                    className="row-hover" 
                    style={{ 
                      borderTop: '1px solid #F3F4F6', 
                      background: '#FFFFFF'
                    }}
                  >
                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
                        <div style={{
                          width: isMobile ? 28 : 32, 
                          height: isMobile ? 28 : 32, 
                          borderRadius: 8,
                          background: `linear-gradient(135deg, ${PASTEL[i % PASTEL.length]}, ${PASTEL[(i+2) % PASTEL.length]})`,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: isMobile ? 11 : 12, 
                          fontWeight: 600, 
                          color: '#374151', 
                          flexShrink: 0,
                        }}>
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: isMobile ? 12 : 13, fontWeight: 500, color: '#111827' }}>
                            {student.fullName}
                          </p>
                          <p style={{ fontSize: isMobile ? 10 : 11, color: '#9CA3AF', marginTop: 2 }}>
                            {student.matricule}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Mail size={isMobile ? 10 : 11} color="#9CA3AF" />
                          <span style={{ fontSize: isMobile ? 11 : 12, color: '#4B5563' }}>
                            {student.email}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Phone size={isMobile ? 10 : 11} color="#9CA3AF" />
                          <span style={{ fontSize: isMobile ? 11 : 12, color: '#4B5563' }}>
                            {student.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                      <span style={{
                        backgroundColor: getLevelStyle(student.level).bg,
                        color: getLevelStyle(student.level).text,
                        fontSize: isMobile ? 10 : 11,
                        fontWeight: 600,
                        padding: isMobile ? '3px 6px' : '4px 8px',
                        borderRadius: 6,
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                      }}>
                        {student.level}
                      </span>
                    </td>

                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: '#6B7280' }}>
                          {getCategoryIcon(student.category)}
                        </span>
                        <span style={{ 
                          fontSize: isMobile ? 11 : 12, 
                          color: '#374151', 
                          textTransform: 'capitalize', 
                          fontWeight: 500 
                        }}>
                          {student.category}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                      <span style={{ 
                        fontSize: isMobile ? 11 : 12, 
                        color: student.specialization ? '#4B5563' : '#9CA3AF',
                        textTransform: 'capitalize',
                      }}>
                        {student.specialization || '—'}
                      </span>
                    </td>

                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                      {student.github ? (
                        <a 
                          href={student.github} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 5, 
                            fontSize: isMobile ? 11 : 12, 
                            color: '#2563EB', 
                            textDecoration: 'none', 
                            fontWeight: 500 
                          }}
                        >
                          <Github size={isMobile ? 10 : 12} />
                          View
                        </a>
                      ) : (
                        <span style={{ fontSize: isMobile ? 11 : 12, color: '#D1D5DB' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
                      <span style={{ fontSize: isMobile ? 11 : 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {formatDate(student.registeredAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {students.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9CA3AF' }}>
                <Users style={{ margin: '0 auto 16px', opacity: 0.3 }} size={40} />
                <p style={{ fontSize: 14 }}>No students registered yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}