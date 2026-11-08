/**
 * Generates and downloads a standard RFC 5545 iCalendar (.ics) file
 */
export const downloadIcsFile = ({ title, description, meetingCode, scheduledFor, durationMinutes = 45 }) => {
  const startDate = scheduledFor ? new Date(scheduledFor) : new Date();
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const meetingUrl = `${window.location.origin}/${meetingCode}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Streamly//Video Meeting//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${meetingCode}-${startDate.getTime()}@streamly.app`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:Streamly Meeting: ${title || meetingCode}`,
    `DESCRIPTION:${description ? description + '\\n\\n' : ''}Join URL: ${meetingUrl}`,
    `URL:${meetingUrl}`,
    `LOCATION:${meetingUrl}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Streamly-${meetingCode}.ics`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
};

