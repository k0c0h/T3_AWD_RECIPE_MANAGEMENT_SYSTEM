const CalendarEvent = require('../models/calendarEvent');
const Quotation = require('../models/quotation');
const User = require('../models/user');
const { google } = require('googleapis');

// ============================================
// GOOGLE CALENDAR HELPERS
// ============================================

// Función helper para formato local (sin UTC)
function toLocalDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Helper para obtener cliente de Google Calendar autenticado
async function getGoogleCalendarClient(userId) {
    const user = await User.findById(userId);
    
    if (!user || !user.googleCalendar?.isLinked || !user.googleCalendar?.refreshToken) {
        return null; // Usuario no tiene Google Calendar vinculado
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        access_token: user.googleCalendar.accessToken,
        refresh_token: user.googleCalendar.refreshToken
    });

    // Manejar refresh automático del token
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            user.googleCalendar.accessToken = tokens.access_token;
            user.googleCalendar.tokenExpiry = new Date(Date.now() + 3600 * 1000);
            await user.save();
        }
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Crear evento en Google Calendar
async function createGoogleCalendarEvent(calendar, eventData) {
    try {
        const endDate = eventData.endDate || new Date(eventData.startDate.getTime() + 4 * 60 * 60 * 1000);
        
        const event = {
            summary: eventData.title,
            description: eventData.description || '',
            location: eventData.location || '',
            start: {
                dateTime: toLocalDateTime(eventData.startDate),
                timeZone: 'America/Guayaquil',
            },
            end: {
                dateTime: toLocalDateTime(endDate),
                timeZone: 'America/Guayaquil',
            },
            colorId: '2', // Verde para eventos de trabajo
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        return response.data.id; // Retorna el ID del evento de Google
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw error;
    }
}

// Actualizar evento en Google Calendar
async function updateGoogleCalendarEvent(calendar, googleEventId, eventData) {
    try {
        const endDate = eventData.endDate || new Date(eventData.startDate.getTime() + 4 * 60 * 60 * 1000);
        
        const event = {
            summary: eventData.title,
            description: eventData.description || '',
            location: eventData.location || '',
            start: {
                dateTime: toLocalDateTime(eventData.startDate),
                timeZone: 'America/Guayaquil',
            },
            end: {
                dateTime: toLocalDateTime(endDate),
                timeZone: 'America/Guayaquil',
            },
        };

        await calendar.events.update({
            calendarId: 'primary',
            eventId: googleEventId,
            resource: event,
        });

        return true;
    } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        throw error;
    }
}

// Eliminar evento de Google Calendar
async function deleteGoogleCalendarEvent(calendar, googleEventId) {
    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: googleEventId,
        });
        return true;
    } catch (error) {
        console.error('Error deleting Google Calendar event:', error);
        throw error;
    }
}

// ============================================
// EVENT HELPERS
// ============================================


async function eventExists({ type, quotationId, startDate }) {
    return await CalendarEvent.findOne({ type, quotationId, startDate });
}


async function createCalendarEventForQuotation(quotation) {
    // Crear evento local con zona horaria correcta
    // Extraer solo la fecha (sin hora) del eventDate
    const eventDateStr = quotation.eventInfo.eventDate.toString();
    const eventDateOnly = eventDateStr.split('T')[0]; // "2026-02-15"
    const [hours, minutes] = quotation.eventInfo.eventTime.split(':'); // ["18", "00"]
    
    // Crear fecha en zona horaria local combinando fecha + hora
    const eventStartDate = new Date(`${eventDateOnly}T${hours}:${minutes}:00`);

    const exists = await eventExists({
        type: 'delivery',
        quotationId: quotation._id,
        startDate: eventStartDate
    });

    if (exists) return exists;

    // Preparar datos del evento
    const eventData = {
        title: `Evento: ${quotation.clientInfo.name} - ${quotation.eventInfo.eventType}`,
        type: 'delivery',
        startDate: eventStartDate,
        endDate: new Date(eventStartDate.getTime() + 4 * 60 * 60 * 1000), // +4 horas
        description: `
Evento para ${quotation.clientInfo.name}
Tipo: ${quotation.eventInfo.eventType}
Invitados: ${quotation.eventInfo.numberOfGuests}
Teléfono: ${quotation.clientInfo.phone}
Email: ${quotation.clientInfo.email}
${quotation.eventInfo.additionalNotes ? `Notas: ${quotation.eventInfo.additionalNotes}` : ''}
        `.trim(),
        location: `${quotation.eventInfo.location.address}${quotation.eventInfo.location.venueName ? ` - ${quotation.eventInfo.location.venueName}` : ''}`,
        quotationId: quotation._id,
        color: '#1cc88a',
        icon: 'truck'
    };

    const localEvent = await CalendarEvent.create(eventData);

    // Sincronizar con Google Calendar si el chef tiene vinculación
    if (quotation.chefId) {
        try {
            const calendar = await getGoogleCalendarClient(quotation.chefId);
            
            if (calendar) {
                const googleEventId = await createGoogleCalendarEvent(calendar, eventData);
                
                // Actualizar evento local con ID de Google
                localEvent.googleCalendar = {
                    eventId: googleEventId,
                    isSynced: true,
                    lastSyncedAt: new Date(),
                    syncError: null
                };
                await localEvent.save();
                
                console.log('✅ Evento sincronizado con Google Calendar:', googleEventId);
            }
        } catch (error) {
            console.error('❌ Error sincronizando con Google Calendar:', error);
            localEvent.googleCalendar = {
                eventId: null,
                isSynced: false,
                lastSyncedAt: new Date(),
                syncError: error.message
            };
            await localEvent.save();
        }
    }

    return localEvent;
}

async function createClientMeetingEvent(quotation, meetingDate) {
    const exists = await eventExists({
        type: 'meeting',
        quotationId: quotation._id,
        startDate: meetingDate
    });

    if (exists) return exists;

    return await CalendarEvent.create({
        title: `Reunión con ${quotation.clientName}`,
        type: 'meeting',
        startDate: meetingDate,
        quotationId: quotation._id,
        color: '#36b9cc',
        icon: 'calendar'
    });
}

async function createCustomCalendarEvent(data) {
    return await CalendarEvent.create(data);
}

exports.completeEvent = async (req, res) => {
    try {
        const updated = await CalendarEvent.findByIdAndUpdate(
            req.params.id,
            { status: 'completed' },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Event not found" });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error completing event", error: error.message });
    }
};

exports.createEventFromQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        const meetingDate = req.body.meetingDate || new Date();

        const event = await createClientMeetingEvent(quotation, meetingDate);

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: "Error creating event", error: error.message });
    }
};

module.exports.createCalendarEventForQuotation = createCalendarEventForQuotation;
module.exports.createClientMeetingEvent = createClientMeetingEvent;
module.exports.createCustomCalendarEvent = createCustomCalendarEvent;

// Exportar funciones de Google Calendar
module.exports.getGoogleCalendarClient = getGoogleCalendarClient;
module.exports.createGoogleCalendarEvent = createGoogleCalendarEvent;
module.exports.updateGoogleCalendarEvent = updateGoogleCalendarEvent;
module.exports.deleteGoogleCalendarEvent = deleteGoogleCalendarEvent;
