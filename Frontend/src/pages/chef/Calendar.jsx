import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Link2, 
  Unlink, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Clock,
  DollarSign,
  RefreshCw,
  ExternalLink,
  Trash2
} from 'lucide-react';
import api from '../../services/api';
import quotationService from '../../services/quotation';
import calendarService from '../../services/calendar';
import Toast from '../../components/ui/Toast';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { Modal } from '../../components/ui/Modal';

const Calendar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [googleStatus, setGoogleStatus] = useState({
    isLinked: false,
    email: null,
    hasValidToken: false,
    loading: true
  });
  const [quotations, setQuotations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, action: null, payload: null, loading: false });

  useEffect(() => {
    checkGoogleStatus();
    handleUrlParams();
    loadQuotations();
    loadPendingRequests();
  }, []);

  const handleUrlParams = () => {
    const googleParam = searchParams.get('google');
    const messageParam = searchParams.get('message');

    if (googleParam === 'linked') {
      showToast('Google Calendar vinculado exitosamente', 'success');
      checkGoogleStatus(); // Recargar estado
    } else if (googleParam === 'error') {
      const errorMsg = messageParam ? decodeURIComponent(messageParam) : 'Error al vincular Google Calendar';
      showToast(errorMsg, 'error');
    }

    // Limpiar parámetros de la URL
    if (googleParam) {
      setSearchParams({});
    }
  };

  const checkGoogleStatus = async () => {
    try {
      const status = await api.auth.checkGoogleCalendarStatus();
      setGoogleStatus({
        ...status,
        loading: false
      });
    } catch (error) {
      console.error('Error checking Google status:', error);
      setGoogleStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getForCalendar();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading quotations:', error);
      showToast('Error al cargar cotizaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const data = await quotationService.getAll({ 
        status: 'pending', 
        quotationType: 'client_request' 
      });
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setConfirm({
      open: true,
      action: 'accept',
      payload: requestId,
      loading: false
    });
  };

  const handleRejectRequest = async (requestId) => {
    setConfirm({
      open: true,
      action: 'reject',
      payload: requestId,
      loading: false
    });
  };

  const confirmAction = async () => {
    const { action, payload } = confirm;
    setConfirm(prev => ({ ...prev, loading: true }));

    try {
      if (action === 'accept') {
        await quotationService.approveAndSchedule(payload);
        showToast('Solicitud aceptada y evento creado', 'success');
        loadPendingRequests();
        loadQuotations();
      } else if (action === 'reject') {
        await quotationService.updateStatus(payload, 'cancelled');
        showToast('Solicitud rechazada', 'success');
        loadPendingRequests();
      }
      setConfirm({ open: false, action: null, payload: null, loading: false });
    } catch (error) {
      console.error('Error processing request:', error);
      showToast(error?.message || 'Error al procesar la solicitud', 'error');
      setConfirm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLinkGoogle = () => {
    api.auth.googleCalendarLink();
  };

  const handleUnlinkGoogle = async () => {
    setConfirm({
      open: true,
      action: 'unlink',
      loading: false
    });
  };

  const confirmUnlink = async () => {
    try {
      setConfirm(prev => ({ ...prev, loading: true }));
      await api.auth.unlinkGoogleCalendar();
      setGoogleStatus({
        isLinked: false,
        email: null,
        hasValidToken: false,
        loading: false
      });
      showToast('Google Calendar desvinculado exitosamente', 'success');
      setConfirm({ open: false, action: null, loading: false });
    } catch (error) {
      console.error('Error unlinking Google:', error);
      showToast(error.message || 'Error al desvincular Google Calendar', 'error');
      setConfirm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmAction = () => {
    const { action } = confirm;
    if (action === 'unlink') {
      confirmUnlink();
    } else if (action === 'sync') {
      handleSyncWithGoogle(confirm.payload);
    } else if (action === 'accept' || action === 'reject') {
      confirmAction();
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      wedding: 'Boda',
      birthday: 'Cumpleaños',
      corporate: 'Corporativo',
      private: 'Privado',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  // Funciones para navegar el calendario
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getQuotationsForDay = (day) => {
    const { year, month } = getDaysInMonth(currentDate);
    return quotations.filter(q => {
      // Parsear fecha sin conversión de zona horaria
      const eventDateStr = q.eventInfo.eventDate.split('T')[0]; // "2026-02-15"
      const [eventYear, eventMonth, eventDay] = eventDateStr.split('-').map(Number);
      
      return eventYear === year &&
             (eventMonth - 1) === month && // Month es 0-indexed en JS
             eventDay === day;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      approved: '#4CAF50',
      completed: '#2196F3',
      cancelled: '#F44336'
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const handleSyncWithGoogle = async (quotationId) => {
    try {
      setConfirm(prev => ({ ...prev, loading: true }));
      // Buscar el evento asociado a esta cotización
      const events = await calendarService.getByQuotation(quotationId);
      if (events && events.length > 0) {
        await calendarService.syncWithGoogle(events[0]._id);
        showToast('Evento sincronizado con Google Calendar', 'success');
        loadQuotations();
      } else {
        showToast('No se encontró evento para esta cotización', 'error');
      }
      setConfirm({ open: false, action: null, payload: null, loading: false });
    } catch (error) {
      console.error('Error syncing with Google:', error);
      showToast(error.message || 'Error al sincronizar con Google Calendar', 'error');
      setConfirm(prev => ({ ...prev, loading: false }));
    }
  };

  if (googleStatus.loading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#9FB9B3' }}></div>
          <p style={{ color: '#9FB9B3' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#E8D5C7' }}>
              <CalendarIcon size={32} style={{ color: '#9FB9B3' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#9FB9B3' }}>
                Calendario de Cotizaciones
              </h1>
              <p className="text-sm mt-1" style={{ color: '#B8C9D0' }}>
                Gestiona tus eventos y cotizaciones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Calendar Integration Card */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#9FB9B3' }}>
            Integración con Google Calendar
          </h2>

          {!googleStatus.isLinked ? (
            // No vinculado
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: '#FFF3E0' }}>
                <AlertCircle size={24} style={{ color: '#FF9800' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2" style={{ color: '#9FB9B3' }}>
                  Conecta tu cuenta de Google
                </h3>
                <p className="text-sm mb-4" style={{ color: '#B8C9D0' }}>
                  Vincula tu cuenta de Google para sincronizar automáticamente tus cotizaciones con Google Calendar. 
                  Esto te permitirá ver y gestionar tus eventos desde cualquier dispositivo.
                </p>
                <button
                  onClick={handleLinkGoogle}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm"
                  style={{ backgroundColor: '#9FB9B3', color: '#ffffff' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B8C9D0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9FB9B3'}
                >
                  <Link2 size={18} />
                  Vincular Google Calendar
                </button>
              </div>
            </div>
          ) : (
            // Vinculado
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: '#E8F5E9' }}>
                <CheckCircle size={24} style={{ color: '#4CAF50' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2" style={{ color: '#9FB9B3' }}>
                  Google Calendar Conectado
                </h3>
                <p className="text-sm mb-2" style={{ color: '#B8C9D0' }}>
                  Tu cuenta <span className="font-semibold">{googleStatus.email}</span> está vinculada correctamente.
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${googleStatus.hasValidToken ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs" style={{ color: '#B8C9D0' }}>
                    {googleStatus.hasValidToken ? 'Token válido' : 'Token expirado (se renovará automáticamente)'}
                  </span>
                </div>
                <button
                  onClick={handleUnlinkGoogle}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm border-2"
                  style={{ borderColor: '#E8D5C7', color: '#9FB9B3', backgroundColor: '#ffffff' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEE';
                    e.currentTarget.style.borderColor = '#E57373';
                    e.currentTarget.style.color = '#E57373';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#E8D5C7';
                    e.currentTarget.style.color = '#9FB9B3';
                  }}
                >
                  <Unlink size={18} />
                  Desvincular Google Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Solicitudes Pendientes */}
      {pendingRequests.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#9FB9B3' }}>
              <Users size={24} />
              Solicitudes Pendientes de Cotización ({pendingRequests.length})
            </h2>
            <p className="text-sm mb-4" style={{ color: '#B8C9D0' }}>
              Clientes que han solicitado cotizaciones y esperan tu respuesta
            </p>
            
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="border rounded-lg p-4 transition-all hover:shadow-md"
                  style={{ borderColor: '#E8D5C7', backgroundColor: '#FAFAFA' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg" style={{ backgroundColor: '#FFF3E0' }}>
                          <Users size={20} style={{ color: '#FF9800' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg" style={{ color: '#9FB9B3' }}>
                            {request.clientInfo.name}
                          </h3>
                          <div className="text-sm space-y-1 mt-1" style={{ color: '#666' }}>
                            <p className="flex items-center gap-2">
                              <span className="font-semibold">📧</span> {request.clientInfo.email}
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="font-semibold">📱</span> {request.clientInfo.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={16} style={{ color: '#9FB9B3' }} />
                          <span className="font-semibold">Tipo:</span>
                          <span>{getEventTypeLabel(request.eventInfo.eventType)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} style={{ color: '#9FB9B3' }} />
                          <span className="font-semibold">Invitados:</span>
                          <span>{request.eventInfo.numberOfGuests}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} style={{ color: '#9FB9B3' }} />
                          <span className="font-semibold">Fecha:</span>
                          <span>{new Date(request.eventInfo.eventDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>

                      {request.eventInfo.additionalNotes && (
                        <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#F5F2EB' }}>
                          <p className="text-xs font-semibold" style={{ color: '#9FB9B3' }}>Notas:</p>
                          <p className="text-sm" style={{ color: '#666' }}>{request.eventInfo.additionalNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm flex-1 md:flex-initial"
                        style={{ backgroundColor: '#4CAF50', color: '#ffffff' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                      >
                        <CheckCircle size={18} />
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm border-2 flex-1 md:flex-initial"
                        style={{ borderColor: '#E57373', color: '#E57373', backgroundColor: '#ffffff' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFEBEE';
                          e.currentTarget.style.borderColor = '#EF5350';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#E57373';
                        }}
                      >
                        <Trash2 size={18} />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={24} style={{ color: '#9FB9B3' }} />
            </button>
            
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold capitalize" style={{ color: '#9FB9B3' }}>
                {formatMonthYear()}
              </h2>
              <button
                onClick={goToToday}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: '#E8D5C7', color: '#9FB9B3' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D4C1B3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E8D5C7'}
              >
                Hoy
              </button>
            </div>
            
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={24} style={{ color: '#9FB9B3' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center font-semibold py-2"
                style={{ color: '#9FB9B3' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {daysArray.map(day => {
              const quotationsOnDay = getQuotationsForDay(day);
              const isToday = new Date().getDate() === day && 
                             new Date().getMonth() === month && 
                             new Date().getFullYear() === year;

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                    isToday ? 'ring-2' : ''
                  }`}
                  style={{
                    borderColor: isToday ? '#9FB9B3' : '#E8D5C7',
                    backgroundColor: quotationsOnDay.length > 0 ? '#F8F9FA' : '#ffffff'
                  }}
                  onClick={() => quotationsOnDay.length > 0 && setSelectedQuotation(quotationsOnDay[0])}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'font-bold' : ''}`} style={{ color: '#9FB9B3' }}>
                    {day}
                  </div>
                  {quotationsOnDay.length > 0 && (
                    <div className="space-y-1">
                      {quotationsOnDay.slice(0, 2).map(quotation => (
                        <div
                          key={quotation._id}
                          className="text-xs p-1 rounded truncate"
                          style={{
                            backgroundColor: getStatusColor(quotation.status) + '20',
                            color: getStatusColor(quotation.status),
                            borderLeft: `3px solid ${getStatusColor(quotation.status)}`
                          }}
                        >
                          {quotation.clientInfo.name}
                        </div>
                      ))}
                      {quotationsOnDay.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{quotationsOnDay.length - 2} más
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quotation Detail Modal */}
      {selectedQuotation && (
        <Modal isOpen={!!selectedQuotation} onClose={() => setSelectedQuotation(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: '#9FB9B3' }}>
                Detalle de Cotización
              </h2>
              <div
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: getStatusColor(selectedQuotation.status) + '20',
                  color: getStatusColor(selectedQuotation.status)
                }}
              >
                {getStatusLabel(selectedQuotation.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Info */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: '#9FB9B3' }}>
                  <Users size={18} />
                  Información del Cliente
                </h3>
                <div className="space-y-1 text-sm" style={{ color: '#666' }}>
                  <p><span className="font-semibold">Nombre:</span> {selectedQuotation.clientInfo.name}</p>
                  <p><span className="font-semibold">Email:</span> {selectedQuotation.clientInfo.email}</p>
                  <p><span className="font-semibold">Teléfono:</span> {selectedQuotation.clientInfo.phone}</p>
                </div>
              </div>

              {/* Event Info */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: '#9FB9B3' }}>
                  <CalendarIcon size={18} />
                  Información del Evento
                </h3>
                <div className="space-y-1 text-sm" style={{ color: '#666' }}>
                  <p><span className="font-semibold">Tipo:</span> {getEventTypeLabel(selectedQuotation.eventInfo.eventType)}</p>
                  <p><span className="font-semibold">Fecha:</span> {new Date(selectedQuotation.eventInfo.eventDate).toLocaleDateString('es-ES')}</p>
                  <p><span className="font-semibold">Hora:</span> {selectedQuotation.eventInfo.eventTime}</p>
                  <p><span className="font-semibold">Invitados:</span> {selectedQuotation.eventInfo.numberOfGuests}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2" style={{ color: '#9FB9B3' }}>
                <MapPin size={18} />
                Ubicación
              </h3>
              <div className="text-sm" style={{ color: '#666' }}>
                <p>{selectedQuotation.eventInfo.location.address}</p>
                {selectedQuotation.eventInfo.location.venueName && (
                  <p className="font-semibold">{selectedQuotation.eventInfo.location.venueName}</p>
                )}
              </div>
            </div>

            {/* Cost */}
            {selectedQuotation.totalAmount && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: '#9FB9B3' }}>
                  <DollarSign size={18} />
                  Costo Total
                </h3>
                <p className="text-2xl font-bold" style={{ color: '#9FB9B3' }}>
                  ${selectedQuotation.totalAmount.toFixed(2)}
                </p>
              </div>
            )}

            {/* Notes */}
            {selectedQuotation.eventInfo.additionalNotes && (
              <div className="space-y-2">
                <h3 className="font-semibold" style={{ color: '#9FB9B3' }}>
                  Notas Adicionales
                </h3>
                <p className="text-sm" style={{ color: '#666' }}>
                  {selectedQuotation.eventInfo.additionalNotes}
                </p>
              </div>
            )}

            {/* Actions */}
            {googleStatus.isLinked && selectedQuotation.status === 'approved' && (
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    setConfirm({
                      open: true,
                      action: 'sync',
                      payload: selectedQuotation._id,
                      loading: false
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm"
                  style={{ backgroundColor: '#4CAF50', color: '#ffffff' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                >
                  <RefreshCw size={18} />
                  Sincronizar con Google
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          toast={toast}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => !confirm.loading && setConfirm({ open: false, action: null, payload: null, loading: false })}
        onConfirm={handleConfirmAction}
        title={
          confirm.action === 'unlink' ? 'Desvincular Google Calendar' :
          confirm.action === 'sync' ? 'Sincronizar con Google Calendar' :
          confirm.action === 'accept' ? 'Aceptar Solicitud' :
          confirm.action === 'reject' ? 'Rechazar Solicitud' : ''
        }
        message={
          confirm.action === 'unlink' 
            ? '¿Estás seguro de que deseas desvincular tu cuenta de Google Calendar? Perderás la sincronización automática de eventos.'
            : confirm.action === 'sync'
            ? '¿Deseas sincronizar este evento con tu Google Calendar? Aparecerá en tu calendario personal.'
            : confirm.action === 'accept'
            ? '¿Deseas aceptar esta solicitud? Se creará una cotización aprobada y el evento se programará en tu calendario.'
            : confirm.action === 'reject'
            ? '¿Estás seguro de que deseas rechazar esta solicitud? El cliente será notificado de tu decisión.'
            : ''
        }
        confirmText={
          confirm.action === 'unlink' ? 'Desvincular' :
          confirm.action === 'sync' ? 'Sincronizar' :
          confirm.action === 'accept' ? 'Aceptar' :
          confirm.action === 'reject' ? 'Rechazar' : 'Confirmar'
        }
        cancelText="Cancelar"
        loading={confirm.loading}
      />
    </div>
  );
};

export default Calendar;