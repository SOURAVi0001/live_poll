import React, { useState, useEffect } from 'react';

const QRCodeDisplay = ({ sessionId }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRCode();
  }, [sessionId]);

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`/api/qrcode/${sessionId}`);
      const data = await response.json();
      setQrData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Generating QR Code...</div>;
  }

  if (!qrData) {
    return <div className="error">Failed to generate QR Code</div>;
  }

  return (
    <div className="qr-code-display">
      <h3>Share This Poll</h3>
      <p>Scan the QR code or share the link below:</p>
      
      <div className="qr-code-container">
        <img src={qrData.qrCode} alt="QR Code" className="qr-code-image" />
      </div>
      
      <div className="join-url">
        <strong>Join URL:</strong>
        <div className="url-text">{qrData.url}</div>
      </div>
      
      <button 
        className="btn-primary"
        onClick={() => navigator.clipboard.writeText(qrData.url)}
      >
        Copy Link
      </button>
    </div>
  );
};

export default QRCodeDisplay;
