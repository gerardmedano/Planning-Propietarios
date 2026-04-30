import React, { useState, useEffect } from 'react';
import Timeline from 'react-calendar-timeline';
// Make sure you include the timeline stylesheet or the css
import 'react-calendar-timeline/dist/style.css';
import moment from 'moment';
import { getMockData, fetchReservations } from '../services/googleSheets';
import { Calendar, RefreshCw, AlertCircle, ZoomIn, ZoomOut, X, Info, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { TimelineHeaders, SidebarHeader, DateHeader } from 'react-calendar-timeline';
import ApartmentCalendarModal from './ApartmentCalendarModal';

const TimelineView = ({ user }) => {
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [visibleTimeStart, setVisibleTimeStart] = useState(moment().startOf('month').subtract(15, 'days').valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(moment().endOf('month').add(45, 'days').valueOf());
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(window.innerWidth < 768 ? 110 : 200);

  useEffect(() => {
    const handleResize = () => {
      setSidebarWidth(window.innerWidth < 768 ? 110 : 200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargamos los datos reales desde el CSV de Google Sheets, filtrando por los apartamentos permitidos
      const data = await fetchReservations(user?.allowedApts || []);
      
      setGroups(data.groups);
      setItems(data.items);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos de Google Sheets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
    setVisibleTimeStart(visibleTimeStart);
    setVisibleTimeEnd(visibleTimeEnd);
    updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
  };

  const handleZoomIn = () => {
    const currentDiff = visibleTimeEnd - visibleTimeStart;
    const minZoomLimit = 7 * 24 * 60 * 60 * 1000; // 7 días mínimo
    let newDiff = currentDiff * 0.6; // Reducir la vista (acercar)
    
    if (newDiff < minZoomLimit) {
      newDiff = minZoomLimit;
    }
    
    const center = visibleTimeStart + currentDiff / 2;
    setVisibleTimeStart(center - newDiff / 2);
    setVisibleTimeEnd(center + newDiff / 2);
  };

  const handleZoomOut = () => {
    const currentDiff = visibleTimeEnd - visibleTimeStart;
    const newDiff = currentDiff * 1.6; // Ampliar la vista (alejar)
    const center = visibleTimeStart + currentDiff / 2;
    setVisibleTimeStart(center - newDiff / 2);
    setVisibleTimeEnd(center + newDiff / 2);
  };

  const handleNavigateLeft = () => {
    const currentDiff = visibleTimeEnd - visibleTimeStart;
    const shift = currentDiff * 0.5; // Desplazar media pantalla
    setVisibleTimeStart(visibleTimeStart - shift);
    setVisibleTimeEnd(visibleTimeEnd - shift);
  };

  const handleNavigateRight = () => {
    const currentDiff = visibleTimeEnd - visibleTimeStart;
    const shift = currentDiff * 0.5; // Desplazar media pantalla
    setVisibleTimeStart(visibleTimeStart + shift);
    setVisibleTimeEnd(visibleTimeEnd + shift);
  };

  const handleItemSelect = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item && item.details) {
      setSelectedItem(item);
    }
  };

  const handleGroupClick = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setSelectedApartment(group);
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="title-gradient" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={28} color="var(--primary)" />
          Ocupación de Apartamentos
        </h2>
        
        <button 
          onClick={loadData}
          disabled={loading}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            opacity: loading ? 0.7 : 1,
            transition: 'background 0.2s',
          }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '1rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {!loading && groups.length > 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleNavigateLeft} style={{ background: 'rgba(0,120,215,0.1)', border: '1px solid rgba(0,120,215,0.2)', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={18} color="var(--primary)" />
              </button>
              <button onClick={handleNavigateRight} style={{ background: 'rgba(0,120,215,0.1)', border: '1px solid rgba(0,120,215,0.2)', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={18} color="var(--primary)" />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleZoomOut} style={{ background: 'rgba(0,120,215,0.1)', border: '1px solid rgba(0,120,215,0.2)', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ZoomOut size={18} color="var(--primary)" />
              </button>
              <button onClick={handleZoomIn} style={{ background: 'rgba(0,120,215,0.1)', border: '1px solid rgba(0,120,215,0.2)', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ZoomIn size={18} color="var(--primary)" />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <Timeline
              groups={groups}
              items={items}
              visibleTimeStart={visibleTimeStart}
              visibleTimeEnd={visibleTimeEnd}
              onTimeChange={handleTimeChange}
              onItemSelect={handleItemSelect}
              onItemClick={handleItemSelect}
              canMove={false}
              canResize={false}
              itemTouchSendsClick={true}
              stackItems={true}
              minZoom={7 * 24 * 60 * 60 * 1000} // Limitar a 7 días para no mostrar horas
              sidebarWidth={sidebarWidth}
              lineHeight={50}
              itemHeightRatio={0.75}
              groupRenderer={({ group }) => {
                return (
                  <div 
                    onClick={() => handleGroupClick(group.id)}
                    style={{ cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center', width: '100%' }}
                    title={`Ver calendario de ${group.title}`}
                  >
                    <span style={{ paddingLeft: '0.5rem', fontWeight: '500', color: 'var(--primary)', textDecoration: 'underline' }}>
                      {group.title}
                    </span>
                  </div>
                );
              }}
            >
              <TimelineHeaders>
                <SidebarHeader>
                  {({ getRootProps }) => {
                    return <div {...getRootProps()} className="rct-sidebar-header">Apartamentos</div>
                  }}
                </SidebarHeader>
                <DateHeader unit="primaryHeader">
                  {({ getIntervalProps, intervalContext, date }) => {
                    return (
                      <div {...getIntervalProps()} className="rct-dateHeader rct-dateHeader-primary">
                        <div style={{ position: 'sticky', left: '1rem', display: 'inline-block', fontWeight: 'bold', padding: '0 1rem' }}>
                          {intervalContext.intervalText}
                        </div>
                      </div>
                    );
                  }}
                </DateHeader>
                <DateHeader
                  labelFormat={([startTime], unit) => {
                    const t = moment(startTime.valueOf());
                    if (unit === 'day') return t.format('D');
                    if (unit === 'week') return `Sem ${t.format('W')}`;
                    if (unit === 'month') return t.format('MMM');
                    return t.format('YYYY');
                  }}
                />
              </TimelineHeaders>
            </Timeline>
          </div>
        </div>
      ) : (
        loading ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p>Sincronizando con Google Sheets...</p>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
            No hay datos disponibles.
          </div>
        )
      )}
      
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(to top, #3b82f6 4px, #94a3b8 4px)', boxSizing: 'border-box' }}></span> ✨🧹 Limpia
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#94a3b8', boxSizing: 'border-box' }}></span> 🆕 Nuevo (Plana)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(to top, #f59e0b 4px, #94a3b8 4px)', boxSizing: 'border-box' }}></span> ✏️ Modif.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(to top, #ef4444 4px, #94a3b8 4px)', boxSizing: 'border-box' }}></span> ❌ Canc.
        </div>
      </div>

      {/* Modal de Detalles de Reserva */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setSelectedItem(null)}>
          <div className="glass-panel" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '90%', maxWidth: '400px', padding: '0', 
              position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: `4px solid ${selectedItem.details.stripeColor !== 'transparent' ? selectedItem.details.stripeColor : '#94a3b8'}`
            }}>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
              
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.5rem', marginTop: 0 }}>
                <Info size={24} /> {selectedItem.details.codigo}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={18} color="var(--text-muted)" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>FECHAS</span>
                    <strong>{selectedItem.details.entrada} - {selectedItem.details.salida}</strong>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Clock size={18} color="var(--text-muted)" />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>DÍAS</span>
                      <strong>{selectedItem.details.dias || '-'}</strong>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={18} color="var(--text-muted)" />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>PERSONAS</span>
                      <strong>{selectedItem.details.personas || '-'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,120,215,0.05)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ESTADO</span>
                  <strong style={{ color: selectedItem.details.stripeColor !== 'transparent' ? selectedItem.details.stripeColor : 'var(--text-main)' }}>
                    {selectedItem.details.estado || 'NUEVO'}
                  </strong>
                </div>

                {selectedItem.details.notas && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>NOTAS</span>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-main)' }}>"{selectedItem.details.notas}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Calendario Mensual del Apartamento */}
      {selectedApartment && (
        <ApartmentCalendarModal
          apartment={selectedApartment}
          reservations={items.filter(item => item.group === selectedApartment.id)}
          onClose={() => setSelectedApartment(null)}
          onSelectReservation={(itemId) => {
            setSelectedApartment(null); // Cerrar calendario
            handleItemSelect(itemId); // Abrir detalles
          }}
        />
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
};

export default TimelineView;
