import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { activityService, childService } from '../services/api';
import Modal from '../components/Modal';
import {
  Sparkles,
  Plus,
  BookOpen,
  Music,
  Palette,
  Gamepad2,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';

const LearningActivitiesPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isParticipationModalOpen, setIsParticipationModalOpen] = useState(false);

  // Forms
  const [actForm, setActForm] = useState({
    title: '',
    description: '',
    activity_type: 'Song',
    age_group: '3-6 Years',
    duration: 30,
    learning_objective: ''
  });

  const [partForm, setPartForm] = useState({
    child: '',
    activity: '',
    date: new Date().toISOString().split('T')[0],
    performance: 'Good',
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [actList, partList, childList] = await Promise.all([
        activityService.listActivities(),
        activityService.listParticipations(),
        childService.list()
      ]);
      setActivities(actList);
      setParticipations(partList);
      setChildren(childList);
      if (childList.length > 0 && actList.length > 0) {
        setPartForm(prev => ({
          ...prev,
          child: childList[0].id,
          activity: actList[0].id
        }));
      }
    } catch (err) {
      console.error('Error fetching learning activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      await activityService.createActivity(actForm);
      setIsActivityModalOpen(false);
      setActForm({
        title: '',
        description: '',
        activity_type: 'Song',
        age_group: '3-6 Years',
        duration: 30,
        learning_objective: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error creating activity.');
    }
  };

  const handleRecordParticipation = async (e) => {
    e.preventDefault();
    try {
      await activityService.recordParticipation(partForm);
      setIsParticipationModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error recording participation.');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Song': return <Music size={18} color="#db2777" />;
      case 'Story': return <BookOpen size={18} color="#4f46e5" />;
      case 'Drawing':
      case 'Motor-Skill': return <Palette size={18} color="#0d9488" />;
      default: return <Gamepad2 size={18} color="#f59e0b" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Early Childhood Care & Education (ECCE)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Interactive Activity Library • Cognitive, Motor & Social Skill Development Tracking
          </p>
        </div>

        {user?.role !== 'parent' && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setIsParticipationModalOpen(true)} className="btn btn-secondary">
              <Users size={16} /> Evaluate Child Participation
            </button>
            <button onClick={() => setIsActivityModalOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Add New Activity
            </button>
          </div>
        )}
      </div>

      {/* Activity Cards Library */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Activity Library ({activities.length})</h2>
        <div className="grid grid-cols-3" style={{ gap: '1.25rem' }}>
          {activities.map(act => (
            <div key={act.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {getTypeIcon(act.activity_type)}
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{act.activity_type}</span>
                  </div>
                  <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={12} /> {act.duration} mins
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', margin: '0.35rem 0', color: 'var(--text-main)' }}>
                  {act.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '0.75rem' }}>
                  {act.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '0.775rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  <strong>Objective:</strong> {act.learning_objective}
                </div>
                <div style={{ marginTop: '0.25rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Age Target: {act.age_group}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Child Participation Evaluations Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Sparkles size={18} color="var(--primary)" />
            Recent Child Participation Records ({participations.length})
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Child Name</th>
                <th>Activity Title</th>
                <th>Type</th>
                <th>Performance Grade</th>
                <th>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading participations...
                  </td>
                </tr>
              ) : participations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No evaluations recorded yet.
                  </td>
                </tr>
              ) : (
                participations.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.date}</strong></td>
                    <td><strong>{p.child_name}</strong></td>
                    <td>{p.activity_title}</td>
                    <td><span className="badge badge-neutral">{p.activity_type}</span></td>
                    <td>
                      <span className={`badge ${
                        p.performance === 'Excellent' ? 'badge-success' :
                        p.performance === 'Good' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {p.performance}
                      </span>
                    </td>
                    <td>{p.remarks || 'Participated actively'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD ACTIVITY */}
      <Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title="Create New Early Learning Activity">
        <form onSubmit={handleCreateActivity}>
          <div className="form-group">
            <label className="form-label">Activity Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Action Rhyme: Machli Jal Ki Rani Hai"
              value={actForm.title}
              onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Activity Category</label>
              <select
                className="form-select"
                value={actForm.activity_type}
                onChange={(e) => setActForm({ ...actForm, activity_type: e.target.value })}
              >
                <option value="Song">Song / Rhyme</option>
                <option value="Story">Storytelling</option>
                <option value="Drawing">Drawing / Art</option>
                <option value="Game">Physical Game</option>
                <option value="Language">Language & Chants</option>
                <option value="Motor-Skill">Fine Motor Skill</option>
                <option value="Group">Group Play</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Age Group</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 3-5 Years"
                value={actForm.age_group}
                onChange={(e) => setActForm({ ...actForm, age_group: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (mins)</label>
              <input
                type="number"
                className="form-control"
                value={actForm.duration}
                onChange={(e) => setActForm({ ...actForm, duration: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Instructions</label>
            <textarea
              className="form-control"
              placeholder="Steps for the Anganwadi worker to conduct the activity..."
              value={actForm.description}
              onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Learning & Developmental Objective</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Vocabulary, rhythm coordination, fine motor skills..."
              value={actForm.learning_objective}
              onChange={(e) => setActForm({ ...actForm, learning_objective: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsActivityModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Activity</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: RECORD PARTICIPATION */}
      <Modal isOpen={isParticipationModalOpen} onClose={() => setIsParticipationModalOpen(false)} title="Evaluate Child Participation">
        <form onSubmit={handleRecordParticipation}>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Enrolled Child</label>
              <select
                className="form-select"
                value={partForm.child}
                onChange={(e) => setPartForm({ ...partForm, child: e.target.value })}
                required
              >
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.child_id})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Activity</label>
              <select
                className="form-select"
                value={partForm.activity}
                onChange={(e) => setPartForm({ ...partForm, activity: e.target.value })}
                required
              >
                {activities.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={partForm.date}
                onChange={(e) => setPartForm({ ...partForm, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Performance Assessment</label>
              <select
                className="form-select"
                value={partForm.performance}
                onChange={(e) => setPartForm({ ...partForm, performance: e.target.value })}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Needs Improvement">Needs Improvement</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Teacher Remarks & Child Response</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Enthusiastic participant, helped other children..."
              value={partForm.remarks}
              onChange={(e) => setPartForm({ ...partForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsParticipationModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Evaluation</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LearningActivitiesPage;
