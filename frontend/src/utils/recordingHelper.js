/**
 * Local recording helper using in-browser MediaRecorder API.
 * Streams are recorded locally to RAM and exported directly to user disk as .webm.
 * Zero server-side storage or privacy risk.
 */
export class LocalRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = null;
  }

  /**
   * Starts recording a media stream
   * @param {MediaStream} stream 
   * @param {string} meetingCode 
   */
  start(stream, meetingCode = 'meeting') {
    if (this.isRecording) return;
    this.recordedChunks = [];

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.saveToFile(meetingCode);
      };

      this.mediaRecorder.start(1000); // 1-second chunks
      this.isRecording = true;
      this.startTime = Date.now();
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      throw err;
    }
  }

  stop() {
    if (!this.isRecording || !this.mediaRecorder) return;
    try {
      this.mediaRecorder.stop();
    } catch (e) {}
    this.isRecording = false;
  }

  saveToFile(meetingCode) {
    if (this.recordedChunks.length === 0) return;

    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `Streamly-Recording-${meetingCode}-${dateStr}.webm`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);

    this.recordedChunks = [];
  }
}

