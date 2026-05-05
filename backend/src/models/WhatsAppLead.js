import mongoose from 'mongoose';

const whatsAppLeadSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    elderName: { type: String, default: 'Pending...' },
    careType: { type: String, default: '' },
    contact: { type: String, default: '' },
    notes: { type: String, default: '' },
    timeline: { type: [mongoose.Schema.Types.Mixed], default: [] },
    source: { type: String, default: 'WhatsApp' },
  },
  { timestamps: true, collection: 'whatsappleads' }
);

const WhatsAppLead = mongoose.model('WhatsAppLead', whatsAppLeadSchema);
export default WhatsAppLead;
