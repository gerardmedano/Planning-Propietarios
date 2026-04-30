import React, { useState } from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ApartmentCalendarModal = ({ apartment, reservations, onClose, onSelectReservation }) => {
  const [currentDate, setCurrentDate] = useState(moment().startOf('month'));

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'month'));
  };

  // Generate grid cells
  const startOfMonth = moment(currentDate).startOf('month');
  const endOfMonth = moment(currentDate).endOf('month');
  
  // Encontrar el lunes anterior al inicio del mes (o el mismo día si es lunes)
  const startDate = moment(startOfMonth).startOf('isoWeek');
  // Encontrar el domingo posterior al fin del mes (o el mismo día si es domingo)
  const endDate = moment(endOfMonth).endOf('isoWeek');

  const days = [];
  let day = moment(startDate);
  while (day.isSameOrBefore(endDate, 'day')) {
    days.push(moment(day));
    day.add(1, 'day');
  }

  // Filtrar reservas que caen en la vista actual
  const visibleReservations = reservations.filter(res => {
    return moment(res.start_time).isSameOrBefore(endDate) && 
           moment(res.end_time).isSameOrAfter(startDate);
  });

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '1rem'
    }} onClick={onClose}>
      
      <div className="glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%', maxWidth: '800px', padding: '1.5rem', 
          position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem',
          maxHeight: '90vh', overflowY: 'auto'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={24} />
        </button>

        <h2 className="title-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>
          {apartment.title}
        </h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button onClick={handlePrevMonth} style={{ background: 'rgba(0,120,215,0.1)', border: '1px solid rgba(0,120,215,0.2)', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer' }}>
            <ChevronLeft size={20} color="var(--primary)" />
          </button>
          <h3 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'capitalize' }}>
            {currentDate.format('MMMM YYYY')}
          </h3>
          <button onClick={handleNextMonth} style={{ background: 'rgba(0,120,215,0.1)', border: '1px solid rgba(0,120,215,0.2)', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer' }}>
            <ChevronRight size={20} color="var(--primary)" />
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '1px', 
          background: 'var(--glass-border)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header Row */}
          {weekDays.map(wd => (
            <div key={wd} style={{ background: 'rgba(255,255,255,0.5)', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {wd}
            </div>
          ))}

          {/* Days Grid */}
          {days.map((d, index) => {
            const isCurrentMonth = d.month() === currentDate.month();
            const isToday = d.isSame(moment(), 'day');

            // Find reservations active on this day
            const dayReservations = visibleReservations.filter(res => {
              const start = moment(res.start_time).startOf('day');
              const end = moment(res.end_time).startOf('day');
              return d.isBetween(start, end, 'day', '[]'); // Inclusive
            });

            return (
              <div key={d.format('YYYY-MM-DD')} style={{ 
                background: isCurrentMonth ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', 
                minHeight: '100px',
                padding: '0.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                position: 'relative'
              }}>
                <div style={{ 
                  textAlign: 'right', 
                  fontSize: '0.875rem', 
                  color: isCurrentMonth ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: isToday ? 'bold' : 'normal',
                  marginBottom: '4px'
                }}>
                  <span style={isToday ? { background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '50%' } : {}}>
                    {d.date()}
                  </span>
                </div>

                {/* Render Reservation Bars */}
                {dayReservations.map(res => {
                  const isStart = moment(d).isSame(moment(res.start_time), 'day');
                  const isEnd = moment(d).isSame(moment(res.end_time), 'day');
                  const showTitle = isStart || d.day() === 1; // Show title on start or Monday

                  return (
                    <div 
                      key={res.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectReservation(res.id);
                      }}
                      style={{
                        background: res.itemProps.style.background,
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '2px 4px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        marginLeft: isStart ? '4px' : '-0.25rem',
                        marginRight: isEnd ? '4px' : '-0.25rem',
                        borderTopLeftRadius: isStart ? '4px' : '0',
                        borderBottomLeftRadius: isStart ? '4px' : '0',
                        borderTopRightRadius: isEnd ? '4px' : '0',
                        borderBottomRightRadius: isEnd ? '4px' : '0',
                        zIndex: 10,
                        position: 'relative'
                      }}
                      title={res.title}
                    >
                      {showTitle && <span style={{ paddingLeft: isStart ? '0' : '4px' }}>{res.details?.estado || 'RESERVA'}</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApartmentCalendarModal;
