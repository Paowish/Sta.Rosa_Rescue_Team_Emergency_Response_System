import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { incidentService, notificationService } from "../../services/api";
import io from 'socket.io-client';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on severity
const getMarkerIcon = (severity) => {
  const colors = {
    Critical: 'red',
    High: 'orange',
    Medium: 'yellow',
    Low: 'blue'
  };
  const color = colors[severity] || 'blue';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px;">📍</div>`,
    iconSize: [24, 24],
    popupAnchor: [0, -12]
  });
};

// Component to center map on marker
function MapCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
}

export default function Dashboard({ onIncidentClick }) {
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, resolved: 0 });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showIncidentPopup, setShowIncidentPopup] = useState(false);
  const [latestIncidentAlert, setLatestIncidentAlert] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mapCenter, setMapCenter] = useState([15.3613, 120.9365]);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadData();
    loadNotifications();
    setupSocketConnection();

    audioRef.current = new Audio('/notification-sound.mp3');

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setUnreadCount(response.unreadCount);
        localStorage.setItem('unreadCount', response.unreadCount.toString());
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const setupSocketConnection = () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (token && user._id) {
        socketRef.current = io('http://localhost:5000', {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        socketRef.current.on('connect', () => {
          console.log('✅ Rescue Team socket connected');
          socketRef.current.emit('join', user._id);
          socketRef.current.emit('join-room', 'rescue-team');
        });

        // ✅ FIX: Move the ref inside this function so it sees loadData properly
        const loadDataRef = loadData;

        socketRef.current.on('new_incident', (notification) => {
          showIncidentAlert(notification);
          loadDataRef(); // Forces the update!
          loadNotifications();
        });

        // ✅ VOLUNTEER: Updates notification count, BUT DOES NOT REFRESH STATS
        socketRef.current.on('new_notification', (notification) => {
          if (notification.type === 'volunteer_status') {
            console.log('📝 Volunteer application received - Ignoring to preserve dashboard stats.');
            return;
          }
          loadNotifications();
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });
      }
    } catch (error) {
      console.error("Failed to setup socket:", error);
    }
  };

  const showIncidentAlert = (notification) => {
    setLatestIncidentAlert(notification);
    setShowIncidentPopup(true);

    setUnreadCount(prev => {
      const newCount = prev + 1;
      localStorage.setItem('unreadCount', newCount.toString());
      return newCount;
    });

    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    setTimeout(() => {
      setShowIncidentPopup(false);
    }, 5000);
  };

  const loadData = async () => {
    try {
      const incidentResponse = await incidentService.getAllIncidents();
      if (incidentResponse.success) {
        setIncidents(incidentResponse.data);
        const total = incidentResponse.data.length;

        // ✅ FIX: Count any incident that is NOT 'Resolved' as active
        const active = incidentResponse.data.filter(i =>
          i.status === 'Active' || i.status === 'Pending' || i.status === 'Acknowledged' || i.status === 'Dispatched'
        ).length;

        const pending = incidentResponse.data.filter(i => i.status === 'Pending').length;
        const resolved = incidentResponse.data.filter(i => i.status === 'Resolved').length;

        setStats({ total, active, pending, resolved });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentClick = (incident) => {
    if (typeof onIncidentClick === 'function') {
      onIncidentClick(incident);
    }
    setSelectedIncident(incident);

    const lat = incident.location?.coordinates?.latitude || incident.location?.coordinates?.lat;
    const lng = incident.location?.coordinates?.longitude || incident.location?.coordinates?.lng;

    if (lat && lng) {
      setMapCenter([parseFloat(lat), parseFloat(lng)]);
    }
  };

  const filteredIncidents = incidents.filter(incident =>
    incident.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'border-red-500';
      case 'High': return 'border-orange-500';
      case 'Medium': return 'border-yellow-500';
      default: return 'border-green-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ RED INCIDENT POPUP - ONLY TRIGGERS FOR NEW INCIDENTS */}
      {showIncidentPopup && latestIncidentAlert && (
        <div className="fixed top-20 right-4 z-[999] animate-slide-in">
          <div className="bg-red-500 text-white rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚨</div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{latestIncidentAlert.title || "New Incident Reported"}</h4>
                <p className="text-xs opacity-90 mt-1">{latestIncidentAlert.message}</p>
                <p className="text-xs opacity-75 mt-1">Just now</p>
              </div>
              <button
                onClick={() => setShowIncidentPopup(false)}
                className="text-white opacity-75 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
          <p className="text-sm text-gray-500">All Incidents</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          <p className="text-sm text-gray-500">Resolved</p>
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">🔔</span>
            <span className="text-sm text-blue-700">You have {unreadCount} new notification{unreadCount > 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-3 gap-6">
        {/* RECENT INCIDENTS */}
        <div className="bg-white rounded-lg shadow col-span-1">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[#262D31]">Active Incidents</h3>
              <div className="flex gap-2">
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">{stats.active}</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <input
              type="text"
              placeholder="Search type, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-md p-2 mb-3 text-sm placeholder-[#5D7285] focus:outline-none focus:border-[#0C7FDA]"
            />
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredIncidents.slice(0, 5).map((incident) => (
                <div
                  key={incident._id}
                  onClick={() => handleIncidentClick(incident)}
                  className={`border-l-4 p-3 bg-gray-50 rounded-r cursor-pointer hover:bg-gray-100 transition ${getSeverityColor(incident.severity)}`}
                >
                  <span className="text-xs px-2 py-1 rounded bg-gray-200">
                    {incident.type}
                  </span>
                  <p className="text-[#262D31] font-medium text-sm mt-2">
                    {incident.location?.address || "Unknown location"}
                  </p>
                  <p className="text-[#656363] text-xs mt-1">
                    {new Date(incident.reportedAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {filteredIncidents.length === 0 && (
                <p className="text-gray-500 text-center py-4">No incidents found</p>
              )}
            </div>
          </div>
        </div>

        {/* MAP with Leaflet */}
        <div className="col-span-2 bg-white rounded-lg shadow overflow-hidden relative" style={{ zIndex: 1 }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "500px", width: "100%" }}
            key={mapCenter.toString()}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenter position={mapCenter} />

            {filteredIncidents.slice(0, 10).map((incident) => {
              const lat = incident.location?.coordinates?.latitude || incident.location?.coordinates?.lat;
              const lng = incident.location?.coordinates?.longitude || incident.location?.coordinates?.lng;

              if (lat && lng) {
                return (
                  <Marker
                    key={incident._id}
                    position={[parseFloat(lat), parseFloat(lng)]}
                    icon={getMarkerIcon(incident.severity)}
                  >
                    <Popup>
                      <div>
                        <strong>{incident.type}</strong><br />
                        {incident.location?.address}<br />
                        <span className="text-xs">Status: {incident.status}</span><br />
                        <span className="text-xs">ID: {incident.incidentId}</span>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
          {selectedIncident && (
            <div className="p-2 text-center text-xs text-gray-400 border-t">
              📍 Showing location for: {selectedIncident.type}
            </div>
          )}
        </div>
      </div>
    </>
  );
}