import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function WhatsAppPrefillModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        elderName: name || 'WhatsApp Lead',
        phone: phone.replace(/\D/g, ''),
        notes: message || 'WhatsApp lead',
        lead: 'WhatsApp',
        stage: 'New Enquiry',
        timeline: [{ event: 'Captured via WhatsApp prefill', date: new Date().toISOString() }]
      };

      const res = await fetch(`${API_URL}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();

      // open WhatsApp chat after saving
      // Prefer opening chat to your business number (Twilio/WhatsApp Business).
      // Set VITE_WHATSAPP_BUSINESS in your client env (E.164 without +, e.g. 9198xxxxxxx)
      const BUSINESS = import.meta.env.VITE_WHATSAPP_BUSINESS || payload.phone;
      const prefill = `${payload.elderName} - ${payload.phone} - ${payload.notes}`;

      // Try to trigger outbound invite via backend Twilio endpoint so the conversation starts automatically.
      try {
        await fetch(`${API_URL}/api/twilio/send-invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ phone: BUSINESS, message: prefill }),
        });
      } catch (e) {
        console.warn('send-invite failed', e);
      }

      const waUrl = `https://wa.me/${BUSINESS}?text=${encodeURIComponent(prefill)}`;
      window.open(waUrl, '_blank');

      onClose(true);
    } catch (err) {
      console.error('WhatsApp prefill save error', err);
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">Send via WhatsApp & save lead</h3>
        <div className="space-y-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full px-3 py-2 border rounded" />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone (digits only)" className="w-full px-3 py-2 border rounded" />
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message (optional)" className="w-full px-3 py-2 border rounded h-24" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => onClose(false)} className="px-4 py-2">Cancel</button>
          <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">{loading? 'Saving...':'Save & Open WhatsApp'}</button>
        </div>
      </form>
    </div>
  );
}
