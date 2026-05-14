import { useEffect, useState, useMemo } from 'react';
import API from '../services/api';
import Sidebar from "../components/dashboards/Sidebar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#7B42BC', '#4299E1', '#10B981', '#F59E0B', '#EF4444', '#A78BFA'];

export default function Trends() {
  const [tab, setTab] = useState('business');
  const [range, setRange] = useState('7');
  // date filters for Users trends (YYYY-MM-DD)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6); // last 7 days default
    return d.toISOString().slice(0,10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0,10));
  const [showDatePickers, setShowDatePickers] = useState(false);
  // single-date mode: selectedDate is treated as the 'To' date; Start is computed from range
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10));

  const formatDisplayDate = (d) => {
    if (!d) return '';
    // input expected YYYY-MM-DD or Date
    const date = (typeof d === 'string') ? new Date(d) : d;
    if (isNaN(date.getTime())) return '';
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth()+1).padStart(2,'0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [agentsList, setAgentsList] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(''); // '' means Total (all agents)
  const fetchData = async () => {
    setLoading(true);
    try {
      // prefer selectedDate (single-date mode) -> compute start/end from it; else use explicit startDate/endDate; otherwise compute from range
      let s; let e;
      if (selectedDate) {
        e = new Date(selectedDate);
        s = new Date(selectedDate);
        s.setDate(s.getDate() - (parseInt(range, 10) - 1));
      } else if (startDate && endDate) {
        s = new Date(startDate);
        e = new Date(endDate);
      } else {
        e = new Date();
        s = new Date();
        s.setDate(e.getDate() - (parseInt(range, 10) - 1));
      }
      // ensure start <= end
      if (s > e) {
        const tmp = s; s = e; e = tmp;
      }
      // include end of day
      e.setHours(23,59,59,999);

      const params = { start: s.toISOString().slice(0,10), end: e.toISOString().slice(0,10) };
      const url = tab === 'business' ? '/trends/business' : '/trends/users';
      // if viewing users and an agent is selected (non-empty), pass agents param to backend
      if (tab === 'users' && selectedAgent) {
        params.agents = selectedAgent;
      }
      const resp = await API.get(url, { params });
      setData(resp.data);
    } catch (err) {
      console.error('Failed to fetch trends', err);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    // initial fetch and polling for near-real-time updates
    let mounted = true;
    const doFetch = async () => { if (!mounted) return; await fetchData(); };
    doFetch();

    // start polling every 10s only when autoRefresh is enabled and no specific agent is selected
    let intervalId = null;
    // if (autoRefresh && !selectedAgent) {
    //   intervalId = setInterval(() => {
    //     fetchData();
    //   }, 10000);
    // }

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [tab, range, selectedAgent, autoRefresh, startDate, endDate, selectedDate]);

  // when selectedDate or range changes, keep startDate/endDate in sync (selectedDate is 'to')
  useEffect(() => {
    if (!selectedDate) return;
    const to = new Date(selectedDate);
    const from = new Date(to);
    from.setDate(to.getDate() - (parseInt(range,10) - 1));
    setStartDate(from.toISOString().slice(0,10));
    setEndDate(to.toISOString().slice(0,10));
  }, [selectedDate, range]);

  // when the user changes the `range` dropdown and no single `selectedDate` is active,
  // recompute start/end relative to today so charts update correctly.
  useEffect(() => {
    if (selectedDate) return; // already handled by other effect
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (parseInt(range,10) - 1));
    const fromStr = from.toISOString().slice(0,10);
    const toStr = to.toISOString().slice(0,10);
    // only update if values actually changed to avoid extra fetches
    setStartDate(prev => (prev !== fromStr ? fromStr : prev));
    setEndDate(prev => (prev !== toStr ? toStr : prev));
  }, [range, selectedDate]);

  // fetch agents list when component mounts (for users filter)
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const resp = await API.get('/agents');
        const list = resp.data?.data || resp.data || [];
        setAgentsList(list.map(a => ({ id: a._id || a.id, name: a.name || a.empId || 'Unknown' })));
      } catch (err) {
        console.error('Failed to load agents', err);
      }
    };
    loadAgents();
  }, []);

  // Transform series for business charts
  const businessSeries = useMemo(() => {
    if (!data) return { byDate: [], sources: [] };

    const calls = data.calls || [];
    const added = data.enquiriesAdded || [];
    const enrolled = data.enquiriesEnrolled || [];
    const dropped = data.dropped || [];

    // build date-keyed map
    const map = {};
    const pushDate = (d) => { if (!map[d]) map[d] = { date: d, totalCalls: 0, connected: 0, totalDuration: 0, enquiriesAdded: 0, enquiriesEnrolled: 0, dropped: 0 }; };
    calls.forEach(c => { pushDate(c._id); map[c._id].totalCalls = c.totalCalls; map[c._id].connected = c.connected; map[c._id].totalDuration = c.totalDuration; });
    added.forEach(a => { pushDate(a._id); map[a._id].enquiriesAdded = a.count; });
    enrolled.forEach(e => { pushDate(e._id); map[e._id].enquiriesEnrolled = e.count; });
    dropped.forEach(d => { pushDate(d._id); map[d._id].dropped = d.count; });

    // ensure continuous day-wise entries between startDate and endDate
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && end) {
      const days = [];
      const cur = new Date(start);
      while (cur <= end) {
        const key = cur.toISOString().slice(0,10);
        pushDate(key);
        cur.setDate(cur.getDate() + 1);
      }
    }

    // compute duration in hours for each day
    Object.keys(map).forEach(k => {
      const td = Number(map[k].totalDuration || 0);
      map[k].totalDurationHours = +(td / 3600).toFixed(2);
    });

    const byDate = Object.keys(map).sort().map(k => map[k]);
    // Build enquiry sources but limit number of legend items to avoid layout crash
    const rawSources = (data.enquirySources || []).map(s => ({ name: s._id || 'Unknown', value: Number(s.count || 0) }));
    rawSources.sort((a,b) => b.value - a.value);
    const TOP_SOURCES = 8; // show top N sources; group rest into 'Other'
    let sources = [];
    if (rawSources.length <= TOP_SOURCES) {
      sources = rawSources.map((s,i) => ({ ...s, color: COLORS[i % COLORS.length] }));
    } else {
      const top = rawSources.slice(0, TOP_SOURCES);
      const rest = rawSources.slice(TOP_SOURCES);
      const otherValue = rest.reduce((sum, r) => sum + (r.value || 0), 0);
      sources = top.map((s,i) => ({ ...s, color: COLORS[i % COLORS.length] }));
      if (otherValue > 0) sources.push({ name: 'Other', value: otherValue, color: '#CBD5E1' });
    }
    // If a single date was selected in the date picker, show only that date on charts
    if (selectedDate) {
      const key = (new Date(selectedDate)).toISOString().slice(0,10);
      const filtered = byDate.filter(b => b.date === key);
      return { byDate: filtered, sources };
    }

    return { byDate, sources };
  }, [data, selectedDate]);

  // Users series (agents)
  const usersSeries = useMemo(() => {
    if (!data) return { callsByAgent: [], enquiriesByAgent: [] };

    // helper: optionally filter raw arrays by selectedAgent id (when user selects a specific agent)
    const filterBySelected = (arr) => {
      if (!selectedAgent) return arr || [];
      return (arr || []).filter(item => {
        const id = item.agentId || item._id || item.agent || null;
        return id ? String(id) === String(selectedAgent) : false;
      });
    };

    const getAgentDisplayName = (item) => {
      // Prefer backend-provided agentName (from employees lookup) when available
      const provided = (item.agentName || '').toString().trim();
      if (provided) return provided;

      // otherwise try resolving by id from agentsList (calls module)
      const id = item.agentId || item.agent || item._id || null;
      if (id && agentsList && agentsList.length) {
        const found = agentsList.find(a => String(a.id || a._id) === String(id));
        if (found) return found.name || 'Unknown';
      }

      return 'Unassigned';
    };

    const mergeByName = (arr, keysToSum = []) => {
      const map = {};
      (arr || []).forEach((item) => {
        const display = getAgentDisplayName(item);
        const key = display.replace(/\s+/g, ' ').toLowerCase();
        if (!map[key]) map[key] = { agentName: display };
        keysToSum.forEach((k) => { map[key][k] = (map[key][k] || 0) + (Number(item[k] || 0)); });
      });
      // after summing durations (likely in seconds), also compute hours
      const out = Object.keys(map).map(k => ({ agentName: map[k].agentName, ...map[k] }));
      out.forEach(o => { o.totalDurationHours = +(Number(o.totalDuration || 0) / 3600).toFixed(2); });
      return out;
    };

    const rawCalls = filterBySelected(data.callsByAgent || []);
    const rawEnqs = filterBySelected(data.enquiriesByAgent || []);

    let calls = mergeByName(rawCalls, ['totalCalls', 'connected', 'totalDuration']);
    let enqs = mergeByName(rawEnqs, ['pitched', 'enrolled', 'dropped']);

    // When viewing TOTAL (no specific agent selected), hide aggregated 'Unassigned' rows
    const normalizeNameKey = (n) => (n || '').toString().trim().replace(/\s+/g, ' ').toLowerCase();
    if (!selectedAgent) {
      calls = calls.filter(a => normalizeNameKey(a.agentName) !== 'unassigned');
      enqs = enqs.filter(a => normalizeNameKey(a.agentName) !== 'unassigned');
    }

    return { callsByAgent: calls, enquiriesByAgent: enqs };
  }, [data, selectedAgent]);

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-800">Trends</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setTab('business')} className={`px-4 py-2 rounded-full ${tab==='business'?'bg-[#7B42BC] text-white':'bg-white border'}`}>Business Trends</button>
              <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-full ${tab==='users'?'bg-[#7B42BC] text-white':'bg-white border'}`}>Users Trends</button>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button onClick={() => setShowDatePickers(v => !v)} className="border rounded px-3 py-2 bg-white flex items-center gap-2">
                    <span>{formatDisplayDate(selectedDate) || 'dd-mm-yyyy'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </button>
                  {showDatePickers && (
                    <div className="absolute right-0 mt-2 p-3 bg-white border rounded shadow z-10 flex items-center gap-2">
                      <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="border rounded px-3 py-2 bg-white" />
                      <button onClick={() => {
                        // compute start/end based on selectedDate and range
                        const to = new Date(selectedDate);
                        const from = new Date(to);
                        from.setDate(to.getDate() - (parseInt(range,10) - 1));
                        setStartDate(from.toISOString().slice(0,10));
                        setEndDate(to.toISOString().slice(0,10));
                        setShowDatePickers(false);
                        fetchData();
                      }} className="px-3 py-2 bg-[#7B42BC] text-white rounded">Apply</button>
                      <button onClick={() => {
                        // clear selection -> reset to default range and fetch
                        const to = new Date();
                        const from = new Date();
                        from.setDate(to.getDate() - (parseInt(range,10) - 1));
                        setSelectedDate('');
                        setStartDate(from.toISOString().slice(0,10));
                        setEndDate(to.toISOString().slice(0,10));
                        setShowDatePickers(false);
                        fetchData();
                      }} className="px-3 py-2 border rounded bg-white text-sm">Clear</button>
                    </div>
                  )}
                </div>

                {tab === 'users' ? (
                  <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} className="border rounded px-3 py-2 bg-white">
                    <option value="">Total (All Agents)</option>
                    {agentsList.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <select value={range} onChange={e=>{ setRange(e.target.value); setSelectedDate(''); }} className="border rounded px-3 py-2 bg-white appearance-none pr-8">
                      <option value="1">Today</option>
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                    </select>
                    <svg aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                )}
              </div>

              <button
                onClick={() => { fetchData(); setAutoRefresh(false); }}
                className="px-4 py-2 rounded bg-white border text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

      {loading && <p>Loading...</p>}

      {!loading && data && tab === 'business' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Total Calls (range)</div>
              <div className="text-3xl font-bold text-slate-900">{businessSeries.byDate.reduce((s,x)=>s+x.totalCalls,0)}</div>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Total Connected</div>
              <div className="text-3xl font-bold text-slate-900">{businessSeries.byDate.reduce((s,x)=>s+x.connected,0)}</div>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Total Call Duration (s)</div>
              <div className="text-3xl font-bold text-slate-900">{businessSeries.byDate.reduce((s,x)=>s+(x.totalDurationHours||0),0).toFixed(2)} hrs</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Calls vs Connected</h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={businessSeries.byDate}>
                  <XAxis dataKey="date" tickFormatter={(d) => formatDisplayDate(d)} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCalls" fill="#7B42BC" />
                  <Bar dataKey="connected" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Total Call Duration</h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={businessSeries.byDate}>
                  <XAxis dataKey="date" tickFormatter={(d) => formatDisplayDate(d)} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalDurationHours" fill="#4299E1" />
                  <Tooltip formatter={(value, name) => `${Number(value).toFixed(2)} hrs`} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Enquiries Added vs Enrolled</h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={businessSeries.byDate}>
                  <XAxis dataKey="date" tickFormatter={(d) => formatDisplayDate(d)} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enquiriesAdded" fill="#A78BFA" />
                  <Bar dataKey="enquiriesEnrolled" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Enquiry Sources</h4>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={businessSeries.sources} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} label>
                    {businessSeries.sources.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ marginTop: 8 }} />
                  <Tooltip formatter={(value) => `${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Dropped / Lost Enquiries</h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={businessSeries.byDate}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="dropped" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && data && tab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Total Calls</div>
              <div className="text-2xl font-bold">{usersSeries.callsByAgent.reduce((s,x)=>s+x.totalCalls,0)}</div>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Total Connected</div>
              <div className="text-2xl font-bold">{usersSeries.callsByAgent.reduce((s,x)=>s+x.connected,0)}</div>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Total Call Duration</div>
              <div className="text-2xl font-bold">{usersSeries.callsByAgent.reduce((s,x)=>s+(x.totalDurationHours||0),0).toFixed(2)} hrs</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Agent Calls vs Connected</h4>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={usersSeries.callsByAgent.map(a=>({ name: a.agentName||'Unassigned', totalCalls: a.totalCalls, connected: a.connected }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCalls" fill="#7B42BC" />
                  <Bar dataKey="connected" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Agent Call Duration</h4>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={usersSeries.callsByAgent.map(a=>({ name: a.agentName||'Unassigned', totalDurationHours: a.totalDurationHours }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalDurationHours" fill="#4299E1" />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)} hrs`} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="text-sm font-bold text-slate-700 mt-2 mb-2 uppercase tracking-wider">Enquiries Pitched vs Enrolled (per Agent)</h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={usersSeries.enquiriesByAgent.map(a=>({ name: a.agentName||'Unassigned', pitched: a.pitched, enrolled: a.enrolled }))}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pitched" fill="#A78BFA" />
                <Bar dataKey="enrolled" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
