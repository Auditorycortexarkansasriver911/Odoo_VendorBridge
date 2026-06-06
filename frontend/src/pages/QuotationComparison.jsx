import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

import { compareQuotations, selectQuotation } from '../services/quotationApi.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { showToast } from '../components/common/Toast.jsx';

export default function QuotationComparison() {
  const { rfqId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [rfq, setRfq] = useState(null);
  
  // Selection workflow states
  const [confirmSelection, setConfirmSelection] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [submittingSelection, setSubmittingSelection] = useState(false);

  const fetchComparison = async () => {
    try {
      const res = await compareQuotations(rfqId);
      const data = res.data.data;
      setQuotations(data);
      if (data.length > 0 && data[0].rfq) {
        setRfq(data[0].rfq);
      }
    } catch (err) {
      showToast('Error loading quotations comparison', 'error');
      navigate('/rfqs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [rfqId]);

  const handleSelectBid = async () => {
    setSubmittingSelection(true);
    try {
      await selectQuotation(selectedQuoteId);
      showToast('Quotation selected successfully! Manager approval pipeline initiated.');
      setConfirmSelection(false);
      navigate(`/rfqs/${rfqId}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to select quotation', 'error');
    } finally {
      setSubmittingSelection(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '60vh' }}>
        <Spinner />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get distinct list of items across all quotations to build side-by-side rows
  const allItemNames = Array.from(
    new Set(quotations.flatMap(q => q.items.map(i => i.item)))
  );

  return (
    <div className="page-wrapper">
      {/* Back button */}
      <button 
        onClick={() => navigate(`/rfqs/${rfqId}`)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}
      >
        <ArrowLeft size={16} /> Back to RFQ details
      </button>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Quotation Comparison Analysis
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Comparing bids side-by-side for <strong>{rfq?.rfqNumber} — {rfq?.title}</strong>. Best value highlighted.
        </p>
      </div>

      {quotations.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} className="empty-state-icon" />
          <h3>No Bids Available</h3>
          <p>There are no submitted quotations to compare for this RFQ yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
          {/* Comparison Matrix Table */}
          <table 
            style={{ 
              width: '100%', 
              borderCollapse: 'separate', 
              borderSpacing: '12px 0px',
              minWidth: '800px',
              tableLayout: 'fixed'
            }}
          >
            <thead>
              <tr>
                {/* Attribute labels header */}
                <th style={{ width: '240px', padding: '16px', borderBottom: '2px solid var(--border-color)', textAlign: 'left', verticalAlign: 'bottom', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Parameters / Features
                </th>

                {/* Quotation columns */}
                {quotations.map((quote) => {
                  const isLowest = quote.isLowest;
                  return (
                    <th 
                      key={quote._id} 
                      style={{ 
                        padding: '24px 20px', 
                        textAlign: 'center',
                        borderRadius: '8px 8px 0 0',
                        border: isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                        borderBottom: 'none',
                        backgroundColor: isLowest ? 'rgba(16, 185, 129, 0.04)' : 'var(--card-bg)',
                        position: 'relative'
                      }}
                    >
                      {isLowest && (
                        <span 
                          style={{ 
                            position: 'absolute', 
                            top: '-12px', 
                            left: '50%', 
                            transform: 'translateX(-50%)', 
                            backgroundColor: 'var(--success-color)', 
                            color: '#FFFFFF', 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            padding: '4px 10px', 
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Sparkles size={11} /> Lowest Price
                        </span>
                      )}
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {quote.vendor?.companyName}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Rating: {quote.vendor?.rating || 0} ★
                      </p>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* Row: Item by Item Comparison */}
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border-color)' }}>
                  ITEMIZED UNIT COSTS
                </td>
                {quotations.map((quote) => (
                  <td key={quote._id} style={{ padding: '12px 20px', borderLeft: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)', borderRight: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: quote.isLowest ? 'rgba(16, 185, 129, 0.04)' : 'transparent' }}>
                  </td>
                ))}
              </tr>

              {allItemNames.map((itemName) => (
                <tr key={itemName}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {itemName}
                  </td>
                  {quotations.map((quote) => {
                    const matchedItem = quote.items.find(i => i.item === itemName);
                    return (
                      <td 
                        key={quote._id} 
                        style={{ 
                          padding: '12px 20px', 
                          textAlign: 'center',
                          borderBottom: '1px solid var(--border-color)',
                          borderLeft: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                          borderRight: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                          backgroundColor: quote.isLowest ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                      >
                        {matchedItem ? (
                          <span>
                            {formatCurrency(matchedItem.unitPrice)}
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
                              ({matchedItem.qty} {matchedItem.unit || 'units'})
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Row: Subtotal */}
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13px' }}>
                  Subtotal
                </td>
                {quotations.map((quote) => (
                  <td 
                    key={quote._id} 
                    style={{ 
                      padding: '16px 20px', 
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      borderLeft: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      borderRight: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      backgroundColor: quote.isLowest ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    {formatCurrency(quote.subtotal)}
                  </td>
                ))}
              </tr>

              {/* Row: GST */}
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13px' }}>
                  GST Charge
                </td>
                {quotations.map((quote) => (
                  <td 
                    key={quote._id} 
                    style={{ 
                      padding: '16px 20px', 
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      borderLeft: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      borderRight: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      backgroundColor: quote.isLowest ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      fontSize: '13px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {formatCurrency(quote.gstAmount)} ({quote.gstPercent}%)
                  </td>
                ))}
              </tr>

              {/* Row: Grand Total */}
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <td style={{ padding: '18px 16px', borderBottom: '2px solid var(--border-color)', fontWeight: 700, fontSize: '14px' }}>
                  Grand Total (inc. Tax)
                </td>
                {quotations.map((quote) => (
                  <td 
                    key={quote._id} 
                    style={{ 
                      padding: '18px 20px', 
                      textAlign: 'center',
                      borderBottom: '2px solid var(--border-color)',
                      borderLeft: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      borderRight: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      backgroundColor: quote.isLowest ? 'rgba(16, 185, 129, 0.06)' : '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: quote.isLowest ? 'var(--success-color)' : 'var(--text-primary)'
                    }}
                  >
                    {formatCurrency(quote.grandTotal)}
                  </td>
                ))}
              </tr>

              {/* Row: Delivery Timeline */}
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13px' }}>
                  Delivery Lead Time
                </td>
                {quotations.map((quote) => (
                  <td 
                    key={quote._id} 
                    style={{ 
                      padding: '16px 20px', 
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      borderLeft: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      borderRight: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      backgroundColor: quote.isLowest ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    {quote.deliveryDays} Days
                  </td>
                ))}
              </tr>

              {/* Row: Payment Terms */}
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13px' }}>
                  Payment Terms
                </td>
                {quotations.map((quote) => (
                  <td 
                    key={quote._id} 
                    style={{ 
                      padding: '16px 20px', 
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      borderLeft: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      borderRight: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      backgroundColor: quote.isLowest ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      fontSize: '13px'
                    }}
                  >
                    {quote.paymentTerms}
                  </td>
                ))}
              </tr>

              {/* Row: Notes */}
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13px', verticalAlign: 'top' }}>
                  Vendor Remarks
                </td>
                {quotations.map((quote) => (
                  <td 
                    key={quote._id} 
                    style={{ 
                      padding: '16px 20px', 
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      borderLeft: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      borderRight: quote.isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                      backgroundColor: quote.isLowest ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      wordBreak: 'break-word'
                    }}
                  >
                    {quote.notes || 'No notes provided.'}
                  </td>
                ))}
              </tr>

              {/* Row: Actions */}
              <tr>
                {/* Empty corner cell */}
                <td style={{ padding: '24px 16px', borderRadius: '0 0 0 8px' }}>
                </td>
                {quotations.map((quote) => {
                  const isLowest = quote.isLowest;
                  return (
                    <td 
                      key={quote._id} 
                      style={{ 
                        padding: '24px 20px', 
                        textAlign: 'center',
                        borderRadius: '0 0 8px 8px',
                        border: isLowest ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                        borderTop: 'none',
                        backgroundColor: isLowest ? 'rgba(16, 185, 129, 0.04)' : 'var(--card-bg)'
                      }}
                    >
                      <Button 
                        onClick={() => { setSelectedQuoteId(quote._id); setConfirmSelection(true); }}
                        variant={isLowest ? 'primary' : 'secondary'}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <CheckCircle2 size={16} /> Select this Bid
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm quotation selection dialog */}
      <ConfirmDialog
        isOpen={confirmSelection}
        title="Select Quotation & Initiate Approval"
        message="Are you sure you want to select this vendor's quotation? The RFQ will close, other bids will be rejected, and a multi-level L1/L2 approval workflow will be created."
        onConfirm={handleSelectBid}
        onCancel={() => setConfirmSelection(false)}
        loading={submittingSelection}
      />
    </div>
  );
}
