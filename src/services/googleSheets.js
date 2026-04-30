import Papa from 'papaparse';
import moment from 'moment';

// ID de ejemplo. El usuario debe reemplazarlo con su ID de Google Sheets.
// La hoja debe ser pública y tener las siguientes columnas:
// Apartamento, Inquilino, Fecha Inicio, Fecha Fin, Estado (Confirmado/Pendiente)
const DEFAULT_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJzVxIXAyv4fxDIYFYbShRm4J6_Kzi4M5XGulvMvZI-VLXBgEw3BmVo0HW6bA-6uBlrV_jyxIv0nBc/pub?gid=750425476&single=true&output=csv';

const PERMISSIONS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJzVxIXAyv4fxDIYFYbShRm4J6_Kzi4M5XGulvMvZI-VLXBgEw3BmVo0HW6bA-6uBlrV_jyxIv0nBc/pub?gid=501162826&single=true&output=csv';

const baseColor = '#94a3b8'; // Gris oscuro para la base (slate-400)

const stripeColors = {
  'LIMPIA': '#3b82f6', // Azul claro
  'NUEVO': 'transparent', // Sin franja
  'MODIF.': '#f59e0b', // Naranja
  'CANC.': '#ef4444',  // Rojo
};

const emojis = {
  'LIMPIA': '✨🧹',
  'NUEVO': '🆕',
  'MODIF.': '✏️',
  'CANC.': '❌',
};

export const fetchPermissions = async (url = PERMISSIONS_CSV_URL) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          console.error("Error parsing permissions sheet:", error);
          reject(error);
        }
      });
    });
  } catch (err) {
    console.error("Error fetching permissions URL:", err);
    throw err;
  }
};

export const fetchReservations = async (allowedApts = ['ALL'], url = DEFAULT_SHEET_CSV_URL) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data;
          console.log("Datos obtenidos de PapaParse:", data);
          if (data.length > 0) {
            console.log("Primera fila (ejemplo):", data[0]);
          }

          // Extraer apartamentos únicos para los grupos (filas)
        const apartmentsSet = new Set();
        data.forEach(row => {
          const aptCode = row['Código Apto']?.trim();
          if (aptCode) {
            if (allowedApts.includes('ALL') || allowedApts.includes(aptCode)) {
              apartmentsSet.add(aptCode);
            }
          }
        });

        const groups = Array.from(apartmentsSet).map((apt, index) => ({
          id: index + 1,
          title: apt
        }));

        // Mapear reservas a items de la línea de tiempo
        const items = data.map((row, index) => {
          const aptCode = row['Código Apto']?.trim();
          if (!aptCode) return null;
          if (!allowedApts.includes('ALL') && !allowedApts.includes(aptCode)) return null;

          const groupMatch = groups.find(g => g.title === aptCode);
          if (!groupMatch) return null;

          // Parse dates using moment
          // Asumimos formato DD/MM/YYYY o YYYY-MM-DD
          const start = moment(row.Entrada, ['DD/MM/YYYY', 'YYYY-MM-DD']);
          const end = moment(row.Salida, ['DD/MM/YYYY', 'YYYY-MM-DD']);

          const estado = row['Estado Reserva']?.trim() || 'NUEVO';
          const estadoUpper = estado.toUpperCase();
          const stripeColor = stripeColors[estadoUpper] || stripeColors['NUEVO'];
          const emoji = emojis[estadoUpper] || '🆕';

          const pax = row.Personas ? ` (${row.Personas} pax)` : '';
          
          const backgroundStyle = stripeColor !== 'transparent' 
            ? `linear-gradient(to top, ${stripeColor} 4px, ${baseColor} 4px)` 
            : baseColor;

          return {
            id: index + 1,
            group: groupMatch.id,
            title: `${emoji} ${row['Código Apto']}${pax}`,
            start_time: start.valueOf(),
            end_time: end.valueOf(),
            details: {
              codigo: row['Código Apto']?.trim(),
              entrada: row.Entrada,
              salida: row.Salida,
              dias: row['nº Días'],
              personas: row.Personas,
              estado: row['Estado Reserva']?.trim(),
              notas: row.Notas,
              stripeColor: stripeColor,
            },
            itemProps: {
              style: {
                background: backgroundStyle,
                borderRadius: '4px',
                border: 'none',
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }
            }
          };
        }).filter(Boolean).sort((a, b) => {
          const isACanc = a.details.estado && a.details.estado.toUpperCase() === 'CANC.' ? 1 : 0;
          const isBCanc = b.details.estado && b.details.estado.toUpperCase() === 'CANC.' ? 1 : 0;
          return isACanc - isBCanc;
        });

        console.log("Grupos generados:", groups);
        console.log("Items generados:", items);

        resolve({ groups, items });
      },
      error: (error) => {
        console.error("Error parsing sheet:", error);
        reject(error);
      }
    });
  });
  } catch (err) {
    console.error("Error fetching URL:", err);
    throw err;
  }
};

// Datos de ejemplo en caso de que falle la carga o para visualizar la UI inicialmente
export const getMockData = () => {
  const groups = [
    { id: 1, title: 'Apartamento Playa 1' },
    { id: 2, title: 'Apartamento Playa 2' },
    { id: 3, title: 'Ático Centro' },
    { id: 4, title: 'Villa Montaña' }
  ];

  const now = moment().startOf('day');

  const colors = {
    Confirmado: '#3b82f6', // Azul claro
    Pendiente: '#f59e0b', // Naranja
    Mantenimiento: '#94a3b8', // Gris
    Bloqueado: '#ef4444', // Rojo
  };

  const items = [
    {
      id: 1,
      group: 1,
      title: 'Familia García',
      start_time: now.clone().subtract(2, 'days').valueOf(),
      end_time: now.clone().add(5, 'days').valueOf(),
      itemProps: { style: { background: colors.Confirmado } }
    },
    {
      id: 2,
      group: 2,
      title: 'Pendiente - John Doe',
      start_time: now.clone().add(1, 'days').valueOf(),
      end_time: now.clone().add(7, 'days').valueOf(),
      itemProps: { style: { background: colors.Pendiente } }
    },
    {
      id: 3,
      group: 3,
      title: 'Mantenimiento',
      start_time: now.clone().subtract(1, 'days').valueOf(),
      end_time: now.clone().add(2, 'days').valueOf(),
      itemProps: { style: { background: colors.Mantenimiento } }
    },
    {
      id: 4,
      group: 4,
      title: 'Bloqueado',
      start_time: now.clone().add(10, 'days').valueOf(),
      end_time: now.clone().add(15, 'days').valueOf(),
      itemProps: { style: { background: colors.Bloqueado } }
    }
  ];

  return { groups, items };
};
