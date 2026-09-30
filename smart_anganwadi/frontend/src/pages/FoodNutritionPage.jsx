import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { foodService, centerService } from '../services/api';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import {
  UtensilsCrossed,
  Plus,
  Package,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Edit2
} from 'lucide-react';

const FoodNutritionPage = () => {
  const { user } = useAuth();
  const [menus, setMenus] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);

  // Forms
  const [menuForm, setMenuForm] = useState({
    menu_date: new Date().toISOString().split('T')[0],
    meal_name: 'Hot Cooked Meal - Moong Dal Khichdi',
    ingredients: 'Rice, Moong Dal, Spinach, Pure Ghee, Cumin',
    nutrition_details: '380 kcal, 12g Protein, Iron, Vitamin A',
    quantity: '150g per child',
    anganwadi_center: ''
  });

  const [stockForm, setStockForm] = useState({
    item_name: '',
    available_quantity: '',
    unit: 'kg',
    minimum_quantity: '',
    expiry_date: '',
    anganwadi_center: ''
  });

  const [editingStock, setEditingStock] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuList, stockList, centerList] = await Promise.all([
        foodService.getMenu(),
        foodService.getStock(),
        centerService.list()
      ]);
      setMenus(menuList);
      setStocks(stockList);
      setCenters(centerList);
      if (centerList.length > 0) {
        setMenuForm(prev => ({ ...prev, anganwadi_center: centerList[0].id }));
        setStockForm(prev => ({ ...prev, anganwadi_center: centerList[0].id }));
      }
    } catch (err) {
      console.error('Error fetching food data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    try {
      await foodService.createMenu(menuForm);
      setIsMenuModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error saving meal menu.');
    }
  };

  const handleCreateStock = async (e) => {
    e.preventDefault();
    try {
      await foodService.createStockItem(stockForm);
      setIsStockModalOpen(false);
      setStockForm({
        item_name: '',
        available_quantity: '',
        unit: 'kg',
        minimum_quantity: '',
        expiry_date: '',
        anganwadi_center: centers[0]?.id || ''
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error adding food item.');
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!editingStock) return;
    try {
      await foodService.updateStock(editingStock.id, {
        available_quantity: editingStock.available_quantity,
        minimum_quantity: editingStock.minimum_quantity
      });
      setIsEditStockModalOpen(false);
      setEditingStock(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error updating stock quantity.');
    }
  };

  const lowStockItems = stocks.filter(s => s.is_low || parseFloat(s.available_quantity) <= parseFloat(s.minimum_quantity));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Nutrition & Food Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Daily Hot-Cooked Meal Schedule (SNP) • Food Inventory & Low-Stock Alerts
          </p>
        </div>

        {user?.role !== 'parent' && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setIsMenuModalOpen(true)} className="btn btn-secondary">
              <Plus size={16} /> Plan Daily Meal
            </button>
            <button onClick={() => setIsStockModalOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Add Inventory Item
            </button>
          </div>
        )}
      </div>

      {/* Low-Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertBanner
            type="warning"
            title={`Inventory Alert: ${lowStockItems.length} Commodities Below Minimum Reserve`}
            message={`The following stock items need immediate district replenishment indent: ${lowStockItems.map(i => `${i.item_name} (${i.available_quantity} ${i.unit})`).join(', ')}.`}
          />
        </div>
      )}

      {/* 2-Section Layout: Food Stock Tracker & Daily Menus */}
      <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
        {/* Left Column: Food Stock Inventory (2 cols) */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Package size={18} color="var(--primary)" />
                Kendra Food Commodities & Ration Stock ({stocks.length})
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Commodity Item</th>
                    <th>Center</th>
                    <th>Available Stock</th>
                    <th>Min Reserve</th>
                    <th>Stock Health</th>
                    <th>Expiry Date</th>
                    {user?.role !== 'parent' && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading food stock...
                      </td>
                    </tr>
                  ) : stocks.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No inventory items recorded.
                      </td>
                    </tr>
                  ) : (
                    stocks.map(st => {
                      const isLow = st.is_low || parseFloat(st.available_quantity) <= parseFloat(st.minimum_quantity);
                      return (
                        <tr key={st.id} style={{ backgroundColor: isLow ? '#fffbeb' : 'inherit' }}>
                          <td>
                            <strong>{st.item_name}</strong>
                          </td>
                          <td><span className="text-xs text-muted">{st.center_name}</span></td>
                          <td>
                            <strong style={{ fontSize: '0.95rem', color: isLow ? 'var(--warning-text)' : 'inherit' }}>
                              {st.available_quantity} {st.unit}
                            </strong>
                          </td>
                          <td>{st.minimum_quantity} {st.unit}</td>
                          <td>
                            <span className={`badge ${isLow ? 'badge-warning' : 'badge-success'}`}>
                              {isLow ? 'Low Stock' : 'Adequate'}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs text-muted">{st.expiry_date || '6 Months+'}</span>
                          </td>
                          {user?.role !== 'parent' && (
                            <td>
                              <button
                                onClick={() => {
                                  setEditingStock(st);
                                  setIsEditStockModalOpen(true);
                                }}
                                className="btn btn-secondary btn-sm"
                                title="Update Stock Level"
                              >
                                <Edit2 size={13} /> Update
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Meal Plans */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <UtensilsCrossed size={18} color="var(--primary)" />
                Meal Menus ({menus.length})
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {menus.slice(0, 5).map(m => (
                <div
                  key={m.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{m.menu_date}</span>
                    <span className="text-xs text-muted">{m.quantity}</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', margin: '0.2rem 0', color: 'var(--text-main)' }}>
                    {m.meal_name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', marginTop: '0.3rem' }}>
                    <strong>Ingredients:</strong> {m.ingredients}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <strong>Nutrition:</strong> {m.nutrition_details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: PLAN DAILY MEAL */}
      <Modal isOpen={isMenuModalOpen} onClose={() => setIsMenuModalOpen(false)} title="Plan Daily Center Meal">
        <form onSubmit={handleCreateMenu}>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Menu Date</label>
              <input
                type="date"
                className="form-control"
                value={menuForm.menu_date}
                onChange={(e) => setMenuForm({ ...menuForm, menu_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Anganwadi Center</label>
              <select
                className="form-select"
                value={menuForm.anganwadi_center}
                onChange={(e) => setMenuForm({ ...menuForm, anganwadi_center: e.target.value })}
                required
              >
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.center_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Meal Name / Dish</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Hot Cooked Moong Dal Khichdi + Egg"
              value={menuForm.meal_name}
              onChange={(e) => setMenuForm({ ...menuForm, meal_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ingredients Used</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Rice, Dal, Spinach, Oil, Salt..."
              value={menuForm.ingredients}
              onChange={(e) => setMenuForm({ ...menuForm, ingredients: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Nutrition Values</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 380 kcal, 12g Protein..."
                value={menuForm.nutrition_details}
                onChange={(e) => setMenuForm({ ...menuForm, nutrition_details: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Portion Size</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 150g per child"
                value={menuForm.quantity}
                onChange={(e) => setMenuForm({ ...menuForm, quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsMenuModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Daily Menu</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD INVENTORY COMMODITY */}
      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title="Add Food Commodity Stock">
        <form onSubmit={handleCreateStock}>
          <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Item / Commodity Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Rice (PDS), Wheat, Dal..."
                value={stockForm.item_name}
                onChange={(e) => setStockForm({ ...stockForm, item_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Anganwadi Center</label>
              <select
                className="form-select"
                value={stockForm.anganwadi_center}
                onChange={(e) => setStockForm({ ...stockForm, anganwadi_center: e.target.value })}
                required
              >
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.center_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3" style={{ gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Available Quantity</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="e.g. 50"
                value={stockForm.available_quantity}
                onChange={(e) => setStockForm({ ...stockForm, available_quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select
                className="form-select"
                value={stockForm.unit}
                onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })}
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="Litre">Litre</option>
                <option value="Packets">Packets</option>
                <option value="Units">Units</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Minimum Reserve</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="Alert threshold"
                value={stockForm.minimum_quantity}
                onChange={(e) => setStockForm({ ...stockForm, minimum_quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              className="form-control"
              value={stockForm.expiry_date}
              onChange={(e) => setStockForm({ ...stockForm, expiry_date: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsStockModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Commodity</button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: EDIT STOCK LEVEL */}
      <Modal isOpen={isEditStockModalOpen} onClose={() => setIsEditStockModalOpen(false)} title={`Update Stock: ${editingStock?.item_name || ''}`}>
        {editingStock && (
          <form onSubmit={handleUpdateStock}>
            <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Available Quantity ({editingStock.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={editingStock.available_quantity}
                  onChange={(e) => setEditingStock({ ...editingStock, available_quantity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Alert Reserve</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={editingStock.minimum_quantity}
                  onChange={(e) => setEditingStock({ ...editingStock, minimum_quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setIsEditStockModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Update Quantity</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default FoodNutritionPage;
