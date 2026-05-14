import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchEnquiries, setFilters, updateEnquiry } from '../../features/enquirySlice';
import { ENQUIRY_STAGES, ENQUIRY_LEADS } from '../../constants/enquiryConstants';
import EnquiryDetailModal from './EnquiryDetailModal';
import Sidebar from '../dashboards/Sidebar';

const EnquiryListContent = () => {
  const dispatch = useDispatch();
  const { enquiries, loading, filters } = useSelector((state) => state.enquiry);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeadCategory, setSelectedLeadCategory] = useState(null);
  const [activeLeadTab, setActiveLeadTab] = useState('all'); 

  useEffect(() => {
    dispatch(fetchEnquiries());
  }, [dispatch]);

  // Handle active lead tab changes
  useEffect(() => {
    if (activeLeadTab === 'online') {
      setSelectedLeadCategory('Online');
    } else if (activeLeadTab === 'offline') {
      setSelectedLeadCategory('Offline');
    } else {
      setSelectedLeadCategory(null);
    }
    // Clear specific lead filter when switching main tabs
    dispatch(setFilters({ lead: null }));
  }, [activeLeadTab, dispatch]);

  // 2. Global Stats: Get LATEST entry per client, then count by stage
  const stats = useMemo(() => {
    // Group all enquiries by clientId, keep only the latest per client
    const latestByClient = {};
    enquiries.forEach(enquiry => {
      const clientId = enquiry.clientId;
      if (!latestByClient[clientId] || 
          new Date(enquiry.createdAt) > new Date(latestByClient[clientId].createdAt)) {
        latestByClient[clientId] = enquiry;
      }
    });

    const uniqueClients = Object.values(latestByClient);
    const enrolledCount = uniqueClients.filter(e => e.stage === 'Enrolled').length;
    const newCount = uniqueClients.filter(e => e.stage === 'New Enquiry').length;
    const contactCount = uniqueClients.filter(e => e.stage === 'Contact').length;
    const pitchingCount = uniqueClients.filter(e => e.stage === 'Pitching').length;
    
    return {
      total: uniqueClients.length,
      newEnquiries: newCount,
      inContact: contactCount,
      proposal: pitchingCount,
      enrolled: enrolledCount,
      byLead: {
        'Website': uniqueClients.filter(e => (e.leads || e.source) === 'Website').length,
        'Whatsapp': uniqueClients.filter(e => (e.leads || e.source) === 'Whatsapp').length,
        'Facebook': uniqueClients.filter(e => (e.leads || e.source) === 'Facebook').length,
        'Instagram': uniqueClients.filter(e => (e.leads || e.source) === 'Instagram').length,
        'LinkedIn': uniqueClients.filter(e => (e.leads || e.source) === 'LinkedIn').length,
        'Yellow page': uniqueClients.filter(e => (e.leads || e.source) === 'Yellow page').length,
        'Mail': uniqueClients.filter(e => (e.leads || e.source) === 'Mail').length,
        'Referral cold clients': uniqueClients.filter(e => (e.leads || e.source) === 'Referral cold clients').length,
        'Existing clients': uniqueClients.filter(e => (e.leads || e.source) === 'Existing clients').length,
        'Doctors': uniqueClients.filter(e => (e.leads || e.source) === 'Doctors').length,
        'Business partners': uniqueClients.filter(e => (e.leads || e.source) === 'Business partners').length,
      },
      averageConversionRate: uniqueClients.length > 0 
        ? Math.round((enrolledCount / uniqueClients.length) * 100) 
        : 0,
    };
  }, [enquiries]);

  // Filtered Stats based on active lead tab
  const filteredStats = useMemo(() => {
    const onlineLeadsList = ['Website', 'Whatsapp', 'Facebook', 'Instagram', 'LinkedIn', 'Yellow page', 'Mail'];
    const offlineLeadsList = ['Referral cold clients', 'Existing clients', 'Doctors', 'Business partners'];

    let filtered = enquiries;

    if (activeLeadTab === 'online') {
      filtered = enquiries.filter(e => onlineLeadsList.includes(e.lead || e.source));
    } else if (activeLeadTab === 'offline') {
      filtered = enquiries.filter(e => offlineLeadsList.includes(e.lead || e.source));
    }

    // Group by clientId, keep only the latest per client
    const latestByClient = {};
    filtered.forEach(enquiry => {
      const clientId = enquiry.clientId;
      if (!latestByClient[clientId] || 
          new Date(enquiry.createdAt) > new Date(latestByClient[clientId].createdAt)) {
        latestByClient[clientId] = enquiry;
      }
    });

    const uniqueClients = Object.values(latestByClient);
    const enrolledCount = uniqueClients.filter(e => e.stage === 'Enrolled').length;
    const newCount = uniqueClients.filter(e => e.stage === 'New Enquiry').length;
    const contactCount = uniqueClients.filter(e => e.stage === 'Contact').length;
    const pitchingCount = uniqueClients.filter(e => e.stage === 'Pitching').length;

    return {
      total: uniqueClients.length,
      newEnquiries: newCount,
      inContact: contactCount,
      proposal: pitchingCount,
      enrolled: enrolledCount,
    };
  }, [enquiries, activeLeadTab]);

  // Use clientId from database (auto-generated)
  const getClientId = useCallback((enquiry) => {
    return enquiry.clientId || 'N/A';
  }, []);

  // Calculate Online and Offline lead counts
  const onlineLeads = ['Website', 'Whatsapp', 'Facebook', 'Instagram', 'LinkedIn', 'Yellow page', 'Mail'];
  const offlineLeads = ['Referral cold clients', 'Existing clients', 'Doctors', 'Business partners'];
  
  const leadStats = useMemo(() => {
    let filtered = enquiries;
    
    // Apply date filtering
    if (filters.fromDate || filters.toDate) {
      filtered = enquiries.filter(enquiry => {
        const enquiryDate = new Date(enquiry.createdAt);
        if (filters.fromDate) {
          const fromDate = new Date(filters.fromDate);
          fromDate.setHours(0, 0, 0, 0);
          if (enquiryDate < fromDate) return false;
        }
        if (filters.toDate) {
          const toDate = new Date(filters.toDate);
          toDate.setHours(23, 59, 59, 999);
          if (enquiryDate > toDate) return false;
        }
        return true;
      });
    }

    const onlineCount = filtered.filter(e => onlineLeads.includes(e.lead || e.source)).length;
    const offlineCount = filtered.filter(e => offlineLeads.includes(e.lead || e.source)).length;
    return {
      online: onlineCount,
      offline: offlineCount,
      total: onlineCount + offlineCount
    };
  }, [enquiries, filters.fromDate, filters.toDate]);

  // Care Type categorization
  const homeCareTypes = ['Home Nursing 12/7', 'Home Nursing 24/7', 'Patient Care Attender 12/7', 'Patient Care Attender 24/7', 'Cook 12/7', 'Cook 24/7', 'Baby Sitter 12/7', 'Maid Staff 12/7', 'Maid Staff 24/7'];
  const healthCareTypes = ['Emergency Nurse 12/7', 'Emergency Nurse 24/7', 'Old Age Home', 'Doctor @ Home', 'Ambulance Service', 'Home Sample Collection', 'Diploma Nurse 24/7', 'Diploma Nurse 12/7', 'Elder Care Service 24/7'];

  // Calculate Care Type Stats with date filter
  const careTypeStats = useMemo(() => {
    let filtered = enquiries;
    
    // Apply date filtering
    if (filters.fromDate || filters.toDate) {
      filtered = enquiries.filter(enquiry => {
        const enquiryDate = new Date(enquiry.createdAt);
        if (filters.fromDate) {
          const fromDate = new Date(filters.fromDate);
          fromDate.setHours(0, 0, 0, 0);
          if (enquiryDate < fromDate) return false;
        }
        if (filters.toDate) {
          const toDate = new Date(filters.toDate);
          toDate.setHours(23, 59, 59, 999);
          if (enquiryDate > toDate) return false;
        }
        return true;
      });
    }

    const homeCareCount = filtered.filter(e => homeCareTypes.includes(e.careType)).length;
    const healthCareCount = filtered.filter(e => healthCareTypes.includes(e.careType)).length;
    
    return {
      homeCare: homeCareCount,
      healthCare: healthCareCount,
      total: homeCareCount + healthCareCount
    };
  }, [enquiries, filters.fromDate, filters.toDate]);

  // Online Care Type Stats - filtered for online leads only
  const onlineCareTypeStats = useMemo(() => {
    const onlineLeadsList = ['Website', 'Whatsapp', 'Facebook', 'Instagram', 'LinkedIn', 'Yellow page', 'Mail'];
    let filtered = enquiries.filter(e => onlineLeadsList.includes(e.lead || e.source));
    
    // Apply date filtering
    if (filters.fromDate || filters.toDate) {
      filtered = filtered.filter(enquiry => {
        const enquiryDate = new Date(enquiry.createdAt);
        if (filters.fromDate) {
          const fromDate = new Date(filters.fromDate);
          fromDate.setHours(0, 0, 0, 0);
          if (enquiryDate < fromDate) return false;
        }
        if (filters.toDate) {
          const toDate = new Date(filters.toDate);
          toDate.setHours(23, 59, 59, 999);
          if (enquiryDate > toDate) return false;
        }
        return true;
      });
    }

    const homeCareCount = filtered.filter(e => homeCareTypes.includes(e.careType)).length;
    const healthCareCount = filtered.filter(e => healthCareTypes.includes(e.careType)).length;
    
    return {
      homeCare: homeCareCount,
      healthCare: healthCareCount,
      total: homeCareCount + healthCareCount
    };
  }, [enquiries, filters.fromDate, filters.toDate]);

  // Offline Care Type Stats - filtered for offline leads only
  const offlineCareTypeStats = useMemo(() => {
    const offlineLeadsList = ['Referral cold clients', 'Existing clients', 'Doctors', 'Business partners'];
    let filtered = enquiries.filter(e => offlineLeadsList.includes(e.lead || e.source));
    
    // Apply date filtering
    if (filters.fromDate || filters.toDate) {
      filtered = filtered.filter(enquiry => {
        const enquiryDate = new Date(enquiry.createdAt);
        if (filters.fromDate) {
          const fromDate = new Date(filters.fromDate);
          fromDate.setHours(0, 0, 0, 0);
          if (enquiryDate < fromDate) return false;
        }
        if (filters.toDate) {
          const toDate = new Date(filters.toDate);
          toDate.setHours(23, 59, 59, 999);
          if (enquiryDate > toDate) return false;
        }
        return true;
      });
    }

    const homeCareCount = filtered.filter(e => homeCareTypes.includes(e.careType)).length;
    const healthCareCount = filtered.filter(e => healthCareTypes.includes(e.careType)).length;
    
    return {
      homeCare: homeCareCount,
      healthCare: healthCareCount,
      total: homeCareCount + healthCareCount
    };
  }, [enquiries, filters.fromDate, filters.toDate]);

  // Online Leads Breakdown Stats
  const onlineLeadsBreakdown = useMemo(() => {
    const onlineLeadsList = ['Website', 'Whatsapp', 'Facebook', 'Instagram', 'LinkedIn', 'Yellow page', 'Mail'];
    const breakdown = {};
    onlineLeadsList.forEach(lead => {
      breakdown[lead] = enquiries.filter(e => (e.lead || e.source) === lead).length;
    });
    return breakdown;
  }, [enquiries]);

  // Offline Leads Breakdown Stats
  const offlineLeadsBreakdown = useMemo(() => {
    const offlineLeadsList = ['Referral cold clients', 'Existing clients', 'Doctors', 'Business partners'];
    const breakdown = {};
    offlineLeadsList.forEach(lead => {
      breakdown[lead] = enquiries.filter(e => (e.lead || e.source) === lead).length;
    });
    return breakdown;
  }, [enquiries]);

  // Filtered Lead Stats: Show only selected lead or all leads
  const filteredLeadStats = useMemo(() => {
    const onlineLeads = ['Website', 'Whatsapp', 'Facebook', 'Instagram', 'LinkedIn', 'Yellow page', 'Mail', 'Tawk.to', 'Meta Campaigns', 'Google Campaigns'];
    const offlineLeads = ['Old clients', 'Existing clients', 'Doctor', 'Medical', 'Nurse', 'Compounder', 'Electrician', 'Plumber', 'Camp', 'Stall', 'Event', 'Business partners'];
    
    if (filters.lead) {
      // When a specific lead filter is selected, show only that lead
      return {
        [filters.lead]: enquiries.filter(e => (e.lead || e.source) === filters.lead).length
      };
    } else if (selectedLeadCategory === 'Online') {
      // When Online category is selected, show all online leads
      return {
        'Website': enquiries.filter(e => (e.lead || e.source) === 'Website').length,
        'Whatsapp': enquiries.filter(e => (e.lead || e.source) === 'Whatsapp').length,
        'Facebook': enquiries.filter(e => (e.lead || e.source) === 'Facebook').length,
        'Instagram': enquiries.filter(e => (e.lead || e.source) === 'Instagram').length,
        'LinkedIn': enquiries.filter(e => (e.lead || e.source) === 'LinkedIn').length,
        'Yellow page': enquiries.filter(e => (e.lead || e.source) === 'Yellow page').length,
        'Mail': enquiries.filter(e => (e.lead || e.source) === 'Mail').length,
        'Tawk.to': enquiries.filter(e => (e.lead || e.source) === 'Tawk.to').length,
        'Meta Campaigns': enquiries.filter(e => (e.lead || e.source) === 'Meta Campaigns').length,
        'Google Campaigns': enquiries.filter(e => (e.lead || e.source) === 'Google Campaigns').length,
      };
    } else if (selectedLeadCategory === 'Offline') {
      // When Offline category is selected, show all offline leads
      return {
        'Old clients': enquiries.filter(e => (e.lead || e.source) === 'Old clients').length,
        'Existing clients': enquiries.filter(e => (e.lead || e.source) === 'Existing clients').length,
        'Doctor': enquiries.filter(e => (e.lead || e.source) === 'Doctor').length,
        'Medical': enquiries.filter(e => (e.lead || e.source) === 'Medical').length,
        'Nurse': enquiries.filter(e => (e.lead || e.source) === 'Nurse').length,
        'Compounder': enquiries.filter(e => (e.lead || e.source) === 'Compounder').length,
        'Electrician': enquiries.filter(e => (e.lead || e.source) === 'Electrician').length,
        'Plumber': enquiries.filter(e => (e.lead || e.source) === 'Plumber').length,
        'Camp': enquiries.filter(e => (e.lead || e.source) === 'Camp').length,
        'Stall': enquiries.filter(e => (e.lead || e.source) === 'Stall').length,
        'Event': enquiries.filter(e => (e.lead || e.source) === 'Event').length,
        'Business partners': enquiries.filter(e => (e.lead || e.source) === 'Business partners').length,
      };
    } else {
      // When no category/lead filter, show all leads
      return stats.byLead;
    }
  }, [enquiries, filters.lead, selectedLeadCategory, stats.byLead]);

  // 3. Local Filtering: Create a filtered list specifically for the Table display
  const filteredEnquiries = useMemo(() => {
    // Define lead categories
    const onlineLeads = ['Website', 'Whatsapp', 'Facebook', 'Instagram', 'LinkedIn', 'Yellow page', 'Mail', 'Tawk.to', 'Meta Campaigns', 'Google Campaigns'];
    const offlineLeads = ['Old clients', 'Existing clients', 'Doctor', 'Medical', 'Nurse', 'Compounder', 'Electrician', 'Plumber', 'Camp', 'Stall', 'Event', 'Business partners'];
    
    // First apply filters
    let filtered = enquiries.filter(enquiry => {
      const matchStage = filters.stage ? enquiry.stage === filters.stage : true;
      
      // Lead filtering with category support
      let matchLead = true;
      if (selectedLeadCategory === 'Online') {
        const enquiryLead = enquiry.lead || enquiry.source;
        matchLead = onlineLeads.includes(enquiryLead) && (!filters.lead || enquiryLead === filters.lead);
      } else if (selectedLeadCategory === 'Offline') {
        const enquiryLead = enquiry.lead || enquiry.source;
        matchLead = offlineLeads.includes(enquiryLead) && (!filters.lead || enquiryLead === filters.lead);
      } else {
        // No category selected, just check specific lead filter
        matchLead = filters.lead ? (enquiry.lead || enquiry.source) === filters.lead : true;
      }
      
      const matchCareType = filters.careType ? enquiry.careType === filters.careType : true;
      const matchSearch = filters.searchTerm 
        ? (enquiry.clientId?.includes(filters.searchTerm.toUpperCase()) || 
           enquiry.phone?.includes(filters.searchTerm))
        : true;
      
      // Date range filtering
      let matchDateRange = true;
      if (filters.fromDate || filters.toDate) {
        const enquiryDate = new Date(enquiry.createdAt);
        if (filters.fromDate) {
          const fromDate = new Date(filters.fromDate);
          fromDate.setHours(0, 0, 0, 0);
          matchDateRange = enquiryDate >= fromDate;
        }
        if (filters.toDate) {
          const toDate = new Date(filters.toDate);
          toDate.setHours(23, 59, 59, 999);
          matchDateRange = matchDateRange && enquiryDate <= toDate;
        }
      }
      
      return matchStage && matchLead && matchSearch && matchCareType && matchDateRange;
    });

    // Filter by active lead tab
    if (activeLeadTab === 'online') {
      const onlineLeadsList = ['Website', 'Whatsapp', 'Facebook', 'Instagram', 'LinkedIn', 'Yellow page', 'Mail'];
      filtered = filtered.filter(e => onlineLeadsList.includes(e.lead || e.source));
    } else if (activeLeadTab === 'offline') {
      const offlineLeadsList = ['Referral cold clients', 'Existing clients', 'Doctors', 'Business partners'];
      filtered = filtered.filter(e => offlineLeadsList.includes(e.lead || e.source));
    }

    // Then group by clientId and keep only the LATEST (most recent) entry
    const latestByClient = {};
    filtered.forEach(enquiry => {
      const clientId = enquiry.clientId;
      if (!latestByClient[clientId] || 
          new Date(enquiry.createdAt) > new Date(latestByClient[clientId].createdAt)) {
        latestByClient[clientId] = enquiry;
      }
    });

    return Object.values(latestByClient);
  }, [enquiries, filters, selectedLeadCategory, activeLeadTab]);

  const getStageColor = (stage) => {
    const colors = {
      'New Enquiry': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'Contact': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Pitching': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Enrolled': 'bg-green-50 text-green-700 border border-green-200'
    };
    return colors[stage] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getLeadColorClass = (lead) => {
    const colors = {
      // Online
      'Website': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      'Whatsapp': 'bg-green-50 text-green-700 border border-green-200',
      'Facebook': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Instagram': 'bg-pink-50 text-pink-700 border border-pink-200',
      'LinkedIn': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
      'Yellow page': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'Mail': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Tawk.to': 'bg-rose-50 text-rose-700 border border-rose-200',
      'Meta Campaigns': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Google Campaigns': 'bg-green-50 text-green-700 border border-green-200',
      // Offline - Referral
      'Old clients': 'bg-orange-50 text-orange-700 border border-orange-200',
      'Existing clients': 'bg-teal-50 text-teal-700 border border-teal-200',
      // Offline - Professional
      'Doctor': 'bg-red-50 text-red-700 border border-red-200',
      'Medical': 'bg-rose-50 text-rose-700 border border-rose-200',
      'Nurse': 'bg-pink-50 text-pink-700 border border-pink-200',
      // Offline - Unprofessional
      'Compounder': 'bg-violet-50 text-violet-700 border border-violet-200',
      'Electrician': 'bg-slate-50 text-slate-700 border border-slate-200',
      'Plumber': 'bg-stone-50 text-stone-700 border border-stone-200',
      // Offline - Events & Stalls
      'Camp': 'bg-lime-50 text-lime-700 border border-lime-200',
      'Stall': 'bg-sky-50 text-sky-700 border border-sky-200',
      'Event': 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200',
      // Offline - Business Partners
      'Business partners': 'bg-amber-50 text-amber-700 border border-amber-200'
    };
    return colors[lead] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getLeadColor = (lead) => {
    const colors = {
      // Online
      'Website': 'indigo',
      'Whatsapp': 'green',
      'Facebook': 'blue',
      'Instagram': 'pink',
      'LinkedIn': 'cyan',
      'Yellow page': 'yellow',
      'Mail': 'purple',
      'Tawk.to': 'rose',
      'Meta Campaigns': 'blue',
      'Google Campaigns': 'green',
      // Offline - Referral
      'Old clients': 'orange',
      'Existing clients': 'teal',
      // Offline - Professional
      'Doctor': 'red',
      'Medical': 'rose',
      'Nurse': 'pink',
      // Offline - Unprofessional
      'Compounder': 'violet',
      'Electrician': 'slate',
      'Plumber': 'stone',
      // Offline - Events & Stalls
      'Camp': 'lime',
      'Stall': 'sky',
      'Event': 'fuchsia',
      // Offline - Business Partners
      'Business partners': 'amber'
    };
    return colors[lead] || 'gray';
  };

  const handleViewDetail = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowModal(true);
  };

  const handleSaveEnquiry = async (updatedEnquiry) => {
    try {
      const result = await dispatch(updateEnquiry({
        id: updatedEnquiry._id,
        data: updatedEnquiry
      })).unwrap();
      
      // Update successful
      console.log('Enquiry updated successfully:', result);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating enquiry:', error);
      alert('Failed to update enquiry. Please try again.');
    }
  };

  const StatCard = ({ title, value, icon, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const LeadDistributionChart = () => {
    const chartData = [
      { name: 'Online Leads', value: leadStats.online, fill: '#3b82f6' },
      { name: 'Offline Leads', value: leadStats.offline, fill: '#f59e0b' }
    ];

    const COLORS = ['#3b82f6', '#f59e0b'];

    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-center h-full">
        <p className="text-sm font-medium text-gray-600 mb-3 text-center">Lead Distribution</p>
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={50}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const CareTypeChart = ({ stats = careTypeStats, title = 'Care Type Distribution' }) => {
    const chartData = [
      { name: 'Home Care', value: stats.homeCare, fill: '#10b981' },
      { name: 'Health Care', value: stats.healthCare, fill: '#f59e0b' }
    ];

    const COLORS = ['#10b981', '#f59e0b'];

    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-center h-full">
        <p className="text-sm font-medium text-gray-600 mb-3 text-center">{title}</p>
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => value} />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const OnlineLeadsChart = () => {
    const chartData = Object.entries(onlineLeadsBreakdown)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    const COLORS = ['#3b82f6', '#1d4ed8', '#1e40af', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-center h-full">
        <p className="text-sm font-medium text-gray-600 mb-3 text-center">Online Leads Breakdown</p>
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value}`}
                outerRadius={50}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const OfflineLeadsChart = () => {
    const chartData = Object.entries(offlineLeadsBreakdown)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    const COLORS = ['#f59e0b', '#d97706', '#b45309', '#fbbf24', '#fcd34d'];

    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-center h-full">
        <p className="text-sm font-medium text-gray-600 mb-3 text-center">Offline Leads Breakdown</p>
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value}`}
                outerRadius={50}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* <div className="border-b border-gray-200 px-8 py-6 bg-white">
          <h1 className="text-3xl font-bold text-gray-900">Enquiry Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all customer enquiries and CRM stages</p>
        </div> */}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 ">
            <div className=" w-full mx-auto">
              {/* Lead Tabs - All, Online, Offline */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setActiveLeadTab('all')}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    activeLeadTab === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                  }`}
                >
                  All Leads
                </button>
                <button
                  onClick={() => setActiveLeadTab('online')}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    activeLeadTab === 'online'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                  }`}
                >
                  Online Leads
                </button>
                <button
                  onClick={() => setActiveLeadTab('offline')}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    activeLeadTab === 'offline'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                  }`}
                >
                  Offline Leads
                </button>
              </div>

              {/* Stats Grid - Main Overview */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {activeLeadTab === 'all' && 'All Stages Statistics'}
                  {activeLeadTab === 'online' && 'Online Leads Statistics'}
                  {activeLeadTab === 'offline' && 'Offline Leads Statistics'}
                </p>
                <div className="text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Enquiries"
                    value={filteredStats.total}
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    bgColor="bg-blue-500"
                  />
                  <StatCard
                    title="New Enquiries"
                    value={filteredStats.newEnquiries}
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                    bgColor="bg-yellow-500"
                  />
                  {/* <StatCard
                    title="In Contact"
                    value={stats.inContact}
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                    bgColor="bg-blue-600"
                  /> */}
                  <StatCard
                    title="Pitching Stage"
                    value={filteredStats.proposal}
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    bgColor="bg-purple-500"
                  />
                  <StatCard
                    title="Enrolled"
                    value={filteredStats.enrolled}
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    bgColor="bg-green-500"
                  />
                </div>
              </div>

              {/* Charts Section - Changes based on active tab */}
              <div className="mb-8 text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">
                {activeLeadTab === 'all' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LeadDistributionChart />
                    <CareTypeChart />
                  </div>
                )}
                {activeLeadTab === 'online' && (
                  <div className="max-w-2xl mx-auto">
                    <CareTypeChart stats={onlineCareTypeStats} title="Online Leads - Care Type Distribution" />
                  </div>
                )}
                {activeLeadTab === 'offline' && (
                  <div className="max-w-2xl mx-auto">
                    <CareTypeChart stats={offlineCareTypeStats} title="Offline Leads - Care Type Distribution" />
                  </div>
                )}
              </div>

              {/* Filters Section - Column Wise Design */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8 ">
                <h3 className="text-lg text-sm font-bold text-slate-700  uppercase tracking-wider mb-4">Filters</h3>
                {/* Changed grid-cols-3 to grid-cols-4 to fit the new filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Stage Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CRM Stage</label>
                    <select
                      value={filters.stage || ''}
                      onChange={(e) => dispatch(setFilters({ stage: e.target.value || null }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">All Stages</option>
                      <option value="New Enquiry">New Enquiry</option>
                      {/* <option value="Contact">Contact</option> */}
                      <option value="Pitching">Pitching</option>
                      <option value="Enrolled">Enrolled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Care Type</label>
                    <select
                      value={filters.careType || ''}
                      onChange={(e) => dispatch(setFilters({ careType: e.target.value || null }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <option value="">All Care Types</option>
                      <optgroup label="Home Care">
                        <option value="Home Nursing 12/7">Home Nursing 12/7</option>
                        <option value="Home Nursing 24/7">Home Nursing 24/7</option>
                        <option value="Patient Care Attender 12/7">Patient Care Attender 12/7</option>
                        <option value="Patient Care Attender 24/7">Patient Care Attender 24/7</option>
                        <option value="Cook 12/7">Cook 12/7</option>
                        <option value="Cook 24/7">Cook 24/7</option>
                        <option value="Baby Sitter 12/7">Baby Sitter 12/7</option>
                        <option value="Maid Staff 12/7">Maid Staff 12/7</option>
                        <option value="Maid Staff 24/7">Maid Staff 24/7</option>
                      </optgroup>
                      <optgroup label="Health Care">
                        <option value="Emergency Nurse 12/7">Emergency Nurse 12/7</option>
                        <option value="Emergency Nurse 24/7">Emergency Nurse 24/7</option>
                        <option value="Old Age Home">Old Age Home</option>
                        <option value="Doctor @ Home">Doctor @ Home</option>
                        <option value="Ambulance Service">Ambulance Service</option>
                        <option value="Home Sample Collection">Home Sample Collection</option>
                        <option value="Diploma Nurse 24/7">Diploma Nurse 24/7</option>
                        <option value="Diploma Nurse 12/7">Diploma Nurse 12/7</option>
                        <option value="Elder Care Service 24/7">Elder Care Service 24/7</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Lead Filter - Two Level */}
                  {activeLeadTab !== 'all' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-[-4px]">Leads Category</label>
                      <div className="flex gap-2 mb-3">
                        
                        {/* 2. Top la 'online' click panna 'Online' button mattum theriyum */}
                        {/* {activeLeadTab === 'online' && (
                          <button
                            onClick={() => {
                              setSelectedLeadCategory('Online');
                              dispatch(setFilters({ leads: null }));
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition bg-blue-600 text-white"
                          >
                            Online
                          </button>
                        )} */}

                        {/* 3. Top la 'offline' click panna 'Offline' button mattum theriyum */}
                        {/* {activeLeadTab === 'offline' && (
                          <button
                            onClick={() => {
                              setSelectedLeadCategory('Offline');
                              dispatch(setFilters({ leads: null }));
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition bg-blue-600 text-white"
                          >
                            Offline
                          </button>
                        )} */}
                      </div>

                      {/* Specific Lead Dropdown based on category */}
                      {selectedLeadCategory && (
                        <div>
                          {/* <label className="block text-sm font-medium text-gray-700 mb-2">Specific Lead</label> */}
                          <select
                            value={filters.lead || ''}
                            onChange={(e) => dispatch(setFilters({ lead: e.target.value || null }))}
                            className="w-full px-4 py-2 pt-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          >
                            <option value="">All {selectedLeadCategory} Leads</option>
                            {selectedLeadCategory === 'Online' && (
                              <>
                                <option value={ENQUIRY_LEADS.WEBSITE}>{ENQUIRY_LEADS.WEBSITE}</option>
                                <option value={ENQUIRY_LEADS.WHATSAPP}>{ENQUIRY_LEADS.WHATSAPP}</option>
                                <option value={ENQUIRY_LEADS.FACEBOOK}>{ENQUIRY_LEADS.FACEBOOK}</option>
                                <option value={ENQUIRY_LEADS.INSTAGRAM}>{ENQUIRY_LEADS.INSTAGRAM}</option>
                                <option value={ENQUIRY_LEADS.LINKEDIN}>{ENQUIRY_LEADS.LINKEDIN}</option>
                                <option value={ENQUIRY_LEADS.YELLOW_PAGE}>{ENQUIRY_LEADS.YELLOW_PAGE}</option>
                                <option value={ENQUIRY_LEADS.MAIL}>{ENQUIRY_LEADS.MAIL}</option>
                                <option value={ENQUIRY_LEADS.TAWK_TO}>{ENQUIRY_LEADS.TAWK_TO}</option>
                                <option value={ENQUIRY_LEADS.META_CAMPAIGNS}>{ENQUIRY_LEADS.META_CAMPAIGNS}</option>
                                <option value={ENQUIRY_LEADS.GOOGLE_CAMPAIGNS}>{ENQUIRY_LEADS.GOOGLE_CAMPAIGNS}</option>
                              </>
                            )}
                            {selectedLeadCategory === 'Offline' && (
                              <>
                                <optgroup label="Referral">
                                  <option value={ENQUIRY_LEADS.OLD_CLIENTS}>{ENQUIRY_LEADS.OLD_CLIENTS}</option>
                                  <option value={ENQUIRY_LEADS.EXISTING_CLIENTS}>{ENQUIRY_LEADS.EXISTING_CLIENTS}</option>
                                </optgroup>
                                <optgroup label="Professional">
                                  <option value={ENQUIRY_LEADS.DOCTOR}>{ENQUIRY_LEADS.DOCTOR}</option>
                                  <option value={ENQUIRY_LEADS.MEDICAL}>{ENQUIRY_LEADS.MEDICAL}</option>
                                  <option value={ENQUIRY_LEADS.NURSE}>{ENQUIRY_LEADS.NURSE}</option>
                                </optgroup>
                                <optgroup label="Unprofessional">
                                  <option value={ENQUIRY_LEADS.COMPOUNDER}>{ENQUIRY_LEADS.COMPOUNDER}</option>
                                  <option value={ENQUIRY_LEADS.ELECTRICIAN}>{ENQUIRY_LEADS.ELECTRICIAN}</option>
                                  <option value={ENQUIRY_LEADS.PLUMBER}>{ENQUIRY_LEADS.PLUMBER}</option>
                                </optgroup>
                                <optgroup label="Events & Stalls">
                                  <option value={ENQUIRY_LEADS.CAMP}>{ENQUIRY_LEADS.CAMP}</option>
                                  <option value={ENQUIRY_LEADS.STALL}>{ENQUIRY_LEADS.STALL}</option>
                                  <option value={ENQUIRY_LEADS.EVENT}>{ENQUIRY_LEADS.EVENT}</option>
                                </optgroup>
                                <optgroup label="Business Partners">
                                  <option value={ENQUIRY_LEADS.BUSINESS_PARTNERS}>{ENQUIRY_LEADS.BUSINESS_PARTNERS}</option>
                                </optgroup>
                              </>
                            )}
                          </select>
                        </div>
                      )}
                    </div>
                    )}

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search by ID or Phone</label>
                    <input
                      type="text"
                      placeholder="Client ID or phone number..."
                      onChange={(e) => dispatch(setFilters({ searchTerm: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Date Range Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={filters.fromDate || ''}
                      onChange={(e) => dispatch(setFilters({ fromDate: e.target.value || null }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={filters.toDate || ''}
                      onChange={(e) => dispatch(setFilters({ toDate: e.target.value || null }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Distribution Chart */}
              {/* {!loading && enquiries.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {filters.lead ? `${filters.lead} - Enquiry Distribution` : 'Enquiries by Lead'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(filteredLeadStats).map(([lead, count]) => {
                      const displayTotal = filters.lead ? count : stats.total;
                      return (
                        <div key={lead} className="flex flex-col items-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-2xl font-bold text-gray-900">{count}</p>
                          <p className="text-sm text-gray-600 mt-1">{lead}</p>
                          {displayTotal > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                              <div
                                className={`h-2 rounded-full`}
                                style={{ 
                                  width: `${filters.lead ? 100 : (count / stats.total) * 100}%`, 
                                  backgroundColor: getLeadColor(lead) === 'indigo' ? '#4f46e5' : getLeadColor(lead) === 'green' ? '#22c55e' : getLeadColor(lead) === 'blue' ? '#3b82f6' : getLeadColor(lead) === 'pink' ? '#ec4899' : getLeadColor(lead) === 'cyan' ? '#06b6d4' : getLeadColor(lead) === 'yellow' ? '#eab308' : getLeadColor(lead) === 'purple' ? '#a855f7' : getLeadColor(lead) === 'orange' ? '#f97316' : getLeadColor(lead) === 'teal' ? '#14b8a6' : getLeadColor(lead) === 'red' ? '#ef4444' : '#d97706'
                                }}
                              />
                            </div>
                          )}
                          {displayTotal > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              {filters.lead ? '100%' : `${Math.round((count / stats.total) * 100)}%`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )} */}

              {/* Enquiries Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading enquiries...</p>
                  </div>
                ) : filteredEnquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 text-lg mt-2">No enquiries found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Elder Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Latest Stage</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leads</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Care Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredEnquiries.map((enquiry) => (
                          <tr key={enquiry._id || enquiry.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-semibold">
                                {enquiry.clientId || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-medium text-gray-900">{enquiry.elderName}</p>
                              <p className="text-sm text-gray-500">{enquiry.familyName || '-'}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-900">{enquiry.phone}</p>
                              <p className="text-xs text-gray-500">{enquiry.email || '-'}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(enquiry.stage)}`}>
                                {enquiry.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLeadColorClass(enquiry.lead || enquiry.source)}`}>
                                {enquiry.lead || enquiry.source}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{enquiry.careType || '-'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                                {new Date(enquiry.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleViewDetail(enquiry)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          allEnquiries={enquiries}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEnquiry}
        />
      )}
    </div>
  );
};

export default EnquiryListContent;
