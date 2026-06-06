import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, Calendar, Building, DollarSign, Eye } from 'lucide-react';

import { listPurchaseOrders, getPurchaseOrderDetail, changePoStatus } from '../services/poApi.js';
import Card from '../components/common/Card.jsx';
import Table from '../components/common/Table.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { showToast } from '../components/common/Toast.jsx';

export default function PurchaseOrders() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // List states
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Detail Modal states
  const [selectedPo, setSelectedPo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await listPurchaseOrders({ status: statusFilter, page, limit: 12 });
      setPos(res.data.data.pos);
      setTotal(res.data.data.total);
    } catch (err) {
      showToast('Error fetching purchase orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, [statusFilter, page]);

  const handleOpenDetail = async (poId) => {
    setDetailLoading(true);
    setIsModalOpen(true);
    try {
      const res = await getPurchaseOrderDetail(poId);
      setSelectedPo(res.data.data);
    } catch (err) {
      showToast('Error loading PO details', 'error');
      setIsModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (poId, status) => {
    try {
      await changePoStatus(poId, status);
      showToast(`PO status updated to ${status}`);
      // Refresh details
      const res = await getPurchaseOrderDetail(poId);
      setSelectedPo(res.data.data);
      fetchPOs();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const isOfficerOrAdmin = user?.role === 'officer' || user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '4px' }}>Purchase Orders (PO)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Track issued purchase orders, deliveries, and payment status.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: '180px' }}>
            <select 
              className="form-control"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="issued">Issued</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* PO Table */}
      {loading ? (
        <div className="spinner-container">
          <Spinner />
        </div>
      ) : pos.length > 0 ? (
        <Card style={{ padding: 0 }}>
          <Table headers={['PO Number', 'Vendor Partner', 'Issue Date', 'Delivery Date', 'Grand Total', 'Status', 'Actions']}>
            {pos.map(po => (
              <tr key={po._id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{po.poNumber}</td>
                <td>{po.vendor?.companyName}</td>
                <td>{new Date(po.issuedAt || po.createdAt).toLocaleDateString('en-IN')}</td>
                <td>{new Date(po.deliveryDate).toLocaleDateString('en-IN')}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(po.grandTotal)}</td>
                <td>
                  <Badge status={po.status}>{po.status}</Badge>
                </td>
                <td>
                  <Button 
                    onClick={() => handleOpenDetail(po._id)} 
                    variant="secondary"
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={12} /> View Details
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      ) : (
        <div className="empty-state">
          <FileText size={48} className="empty-state-icon" />
          <h3>No Purchase Orders</h3>
          <p>No purchase orders found matching your search. Complete approvals to auto-issue POs.</p>
        </div>
      )}

      {/* Detail Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedPo(null); }}
        title="Purchase Order Details"
        style={{ maxWidth: '600px' }}
      >
        {detailLoading ? (
          <div className="spinner-container">
            <Spinner />
          </div>
        ) : selectedPo ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedPo.poNumber}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Issued Date: {new Date(selectedPo.issuedAt || selectedPo.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <Badge status={selectedPo.status}>{selectedPo.status}</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Vendor Billing Partner
                </p>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{selectedPo.vendor?.companyName}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>GST: {selectedPo.vendor?.gstNumber}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Expected Delivery
                </p>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{new Date(selectedPo.deliveryDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                Procured items
              </p>
              <Table headers={['Description', 'Qty', 'Unit Price', 'Total']}>
                {selectedPo.lineItems?.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{item.item}</td>
                    <td>{item.qty}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Financial summary */}
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedPo.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span>CGST (9%):</span>
                <span>{formatCurrency(selectedPo.cgstAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span>SGST (9%):</span>
                <span>{formatCurrency(selectedPo.sgstAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', color: 'var(--accent-color)', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
                <span>Grand Total:</span>
                <span>{formatCurrency(selectedPo.grandTotal)}</span>
              </div>
            </div>

            {/* Status transitions */}
            {isOfficerOrAdmin && selectedPo.status === 'issued' && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                <Button 
                  onClick={() => handleStatusChange(selectedPo._id, 'delivered')} 
                  variant="primary"
                  style={{ flex: 1, backgroundColor: 'var(--success-color)' }}
                >
                  Mark as Delivered
                </Button>
                <Button 
                  onClick={() => handleStatusChange(selectedPo._id, 'cancelled')} 
                  variant="secondary"
                  style={{ flex: 1, color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                >
                  Cancel Purchase Order
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
