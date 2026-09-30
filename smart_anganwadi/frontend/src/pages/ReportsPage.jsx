import React, { useState, useEffect } from 'react';
import { reportService, childService, attendanceService, growthService, foodService, pregnantService } from '../services/api';
import {
  FileBarChart2,
  Download,
  CalendarCheck,
  Baby,
  TrendingUp,
  UtensilsCrossed,
  HeartHandshake,
  Search,
  Filter
} from 'lucide-react';

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState('children');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReportPreview(selectedReport);
  }, [selectedReport]);

  const loadReportPreview = async (type) => {
    try {
      setLoading(true);
      if (type === 'children') {
        const data = await childService.list();
        setTableData(data);
      } else if (type === 'attendance') {
        const data = await attendanceService.list();
        setTableData(data);
      } else if (type === 'growth') {
        const data = await growthService.list();
        setTableData(data);
      } else if (type === 'food_stock') {
        const data = await foodService.getStock();
        setTableData(data);
      } else if (type === 'pregnant_women') {
        const data = await pregnantService.list();
        setTableData(data);
      }
    } catch (err) {
      console.error('Error loading report preview:', err);
    } finally {
      setLoading(false);
    }
  };

  const getExportUrl = () => {
    return reportService.getExportUrl(selectedReport);
  };

  const filteredData = tableData.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(s)) ||
      (item.child_name && item.child_name.toLowerCase().includes(s)) ||
      (item.child_id && item.child_id.toLowerCase().includes(s)) ||
      (item.item_name && item.item_name.toLowerCase().includes(s))
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Reports & Data Export Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Official ICDS Reporting • CSV Downloads • District Compliance Summaries
          </p>
        </div>

        <a
          href={getExportUrl()}
          download={`sams_${selectedReport}_report.csv`}
          className="btn btn-primary btn-lg"
          style={{ boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)' }}
        >
          <Download size={18} /> Export Current View (CSV)
        </a>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-5" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setSelectedReport('children')}
          className={`btn ${selectedReport === 'children' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.75rem', fontSize: '0.85rem' }}
        >
          <Baby size={16} /> Children Directory
        </button>

        <button
          onClick={() => setSelectedReport('attendance')}
          className={`btn ${selectedReport === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.75rem', fontSize: '0.85rem' }}
        >
          <CalendarCheck size={16} /> Attendance Logs
        </button>

        <button
          onClick={() => setSelectedReport('growth')}
          className={`btn ${selectedReport === 'growth' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.75rem', fontSize: '0.85rem' }}
        >
          <TrendingUp size={16} /> Growth & Nutrition
        </button>

        <button
          onClick={() => setSelectedReport('food_stock')}
          className={`btn ${selectedReport === 'food_stock' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.75rem', fontSize: '0.85rem' }}
        >
          <UtensilsCrossed size={16} /> Food Stock & Inventory
        </button>

        <button
          onClick={() => setSelectedReport('pregnant_women')}
          className={`btn ${selectedReport === 'pregnant_women' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.75rem', fontSize: '0.85rem' }}
        >
          <HeartHandshake size={16} /> Maternal Health
        </button>
      </div>

      {/* Preview Table Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileBarChart2 size={18} color="var(--primary)" />
            Report Data Preview ({filteredData.length} records)
          </div>

          <div style={{ position: 'relative', width: 260 }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 10 }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2rem', fontSize: '0.85rem', padding: '0.45rem 2rem' }}
              placeholder="Filter preview rows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading report preview...
            </div>
          ) : (
            <table className="table">
              {/* Dynamic Header & Rows based on report */}
              {selectedReport === 'children' && (
                <>
                  <thead>
                    <tr>
                      <th>Child ID</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Date of Birth</th>
                      <th>Parent Name</th>
                      <th>Parent Phone</th>
                      <th>Anganwadi Center</th>
                      <th>Admission Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.child_id}</strong></td>
                        <td>{c.name}</td>
                        <td>{c.gender}</td>
                        <td>{c.date_of_birth}</td>
                        <td>{c.parent_name}</td>
                        <td>{c.parent_phone}</td>
                        <td>{c.center_name}</td>
                        <td>{c.admission_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {selectedReport === 'attendance' && (
                <>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Child Name</th>
                      <th>Center</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.date}</strong></td>
                        <td>{a.child_name}</td>
                        <td>{a.center_name}</td>
                        <td>
                          <span className={`badge ${a.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td>{a.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {selectedReport === 'growth' && (
                <>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Child Name</th>
                      <th>Height (cm)</th>
                      <th>Weight (kg)</th>
                      <th>BMI</th>
                      <th>Growth Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(g => (
                      <tr key={g.id}>
                        <td><strong>{g.date}</strong></td>
                        <td>{g.child_name}</td>
                        <td>{g.height}</td>
                        <td>{g.weight}</td>
                        <td><strong>{g.bmi}</strong></td>
                        <td>
                          <span className={`badge ${
                            g.growth_status === 'Normal' ? 'badge-success' :
                            g.growth_status === 'Underweight' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {g.growth_status}
                          </span>
                        </td>
                        <td>{g.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {selectedReport === 'food_stock' && (
                <>
                  <thead>
                    <tr>
                      <th>Commodity Item</th>
                      <th>Center</th>
                      <th>Available Quantity</th>
                      <th>Unit</th>
                      <th>Minimum Reserve</th>
                      <th>Low Stock Alert</th>
                      <th>Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(s => {
                      const isLow = s.is_low || parseFloat(s.available_quantity) <= parseFloat(s.minimum_quantity);
                      return (
                        <tr key={s.id}>
                          <td><strong>{s.item_name}</strong></td>
                          <td>{s.center_name}</td>
                          <td><strong>{s.available_quantity}</strong></td>
                          <td>{s.unit}</td>
                          <td>{s.minimum_quantity}</td>
                          <td>
                            <span className={`badge ${isLow ? 'badge-warning' : 'badge-success'}`}>
                              {isLow ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td>{s.expiry_date || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              )}

              {selectedReport === 'pregnant_women' && (
                <>
                  <thead>
                    <tr>
                      <th>Mother Name</th>
                      <th>Age</th>
                      <th>Phone</th>
                      <th>Center</th>
                      <th>LMP Date</th>
                      <th>Expected Delivery (EDD)</th>
                      <th>Risk Classification</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(w => (
                      <tr key={w.id}>
                        <td><strong>{w.name}</strong></td>
                        <td>{w.age}</td>
                        <td>{w.phone}</td>
                        <td>{w.center_name}</td>
                        <td>{w.pregnancy_start_date}</td>
                        <td><strong>{w.expected_delivery_date}</strong></td>
                        <td>
                          <span className={`badge ${
                            w.risk_status === 'Normal' ? 'badge-success' :
                            w.risk_status === 'Moderate Risk' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {w.risk_status}
                          </span>
                        </td>
                        <td>{w.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
