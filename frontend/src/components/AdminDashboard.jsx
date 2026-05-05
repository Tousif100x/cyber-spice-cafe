import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Loader2, Package, Clock, User, Phone,
  MapPin, ArrowLeft, ShoppingBag, Activity,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://cyber-spice-cafe.onrender.com';

/* ─── Status colour map ──────────────────────────────────────────────────────
   Every status gets ONE solid, vivid colour used as the full box background
   (just like the blue chat bubble in the screenshot).  Text is always white.
   ─────────────────────────────────────────────────────────────────────────── */
const STATUS = {
  pending: {
    solid: '#2563eb',   // vivid blue  — matches the chat bubble exactly
    solidDark: '#1d4ed8',   // slightly darker shade for nested boxes
    solidDeep: '#1e3a8a',   // deepest shade for customer box header
    glow: '#3b82f680',
    label: 'Pending',
  },
  confirmed: {
    solid: '#d97706',
    solidDark: '#b45309',
    solidDeep: '#92400e',
    glow: '#f59e0b80',
    label: 'Confirmed',
  },
  delivered: {
    solid: '#059669',
    solidDark: '#047857',
    solidDeep: '#065f46',
    glow: '#10b98180',
    label: 'Delivered',
  },
  cancelled: {
    solid: '#dc2626',
    solidDark: '#b91c1c',
    solidDeep: '#7f1d1d',
    glow: '#ef444480',
    label: 'Cancelled',
  },
};

const getStatus = (s) => STATUS[s?.toLowerCase()] ?? STATUS.pending;

/* ─── Reusable icon row inside customer box ─────────────────────────────── */
function DetailRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color="#fff" />
      </div>
      <div>
        <p style={{
          margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
          marginBottom: 3,
        }}>
          {label}
        </p>
        <p style={{
          margin: 0, fontSize: 15, fontWeight: 600, color: '#ffffff',
          fontFamily: mono ? 'monospace' : 'inherit', lineHeight: 1.4,
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 10000);
    return () => clearInterval(id);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      setOrders(res.data);
      setError(null);
    } catch {
      setError('System Link Failure: Unable to sync with host.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#09090b',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: '#18181b', border: '1.5px solid #2563eb50',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Loader2 size={28} color="#2563eb"
            style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <p style={{
          margin: 0, fontFamily: 'monospace',
          fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        }}>
          Initializing Interface…
        </p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const pending = orders.filter(o => !['delivered', 'cancelled'].includes(o.status?.toLowerCase())).length;
  const delivered = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', background: '#09090b', fontFamily: 'sans-serif' }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,11,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 20px',
      }}>
        <div style={{
          maxWidth: 560, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <div>
              <h1 style={{
                margin: 0, fontSize: 18, fontWeight: 900,
                color: '#ffffff', letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}>
                Terminal <span style={{ color: '#2563eb' }}>Admin</span>
              </h1>
              <p style={{
                margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2,
              }}>
                Order Management
              </p>
            </div>
          </div>

          {/* Right — live pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
          }}>
            <Activity size={12} color="#34d399"
              style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{
              fontSize: 10, fontWeight: 800,
              color: '#34d399', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Live
            </span>
          </div>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </header>

      {/* ══ BODY ════════════════════════════════════════════════════════════ */}
      <main style={{
        maxWidth: 560, margin: '0 auto',
        padding: '32px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      }}>

        {/* ── Stats bar ── */}
        {orders.length > 0 && (
          <div style={{
            width: '100%', display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 4,
          }}>
            {[
              { label: 'Total Orders', value: orders.length, color: '#2563eb' },
              { label: 'Delivered', value: delivered, color: '#059669' },
              { label: 'Pending', value: pending, color: '#d97706' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#18181b',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '14px 12px', textAlign: 'center',
              }}>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#fff' }}>
                  {stat.value}
                </p>
                <p style={{
                  margin: 0, marginTop: 4, fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: stat.color,
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{
            width: '100%', background: '#450a0a',
            border: '1px solid #dc2626',
            borderRadius: 16, padding: '14px 18px',
            color: '#fca5a5', fontFamily: 'monospace', fontSize: 13, fontWeight: 600,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Empty state ── */}
        {orders.length === 0 && !error && (
          <div style={{
            width: '100%', padding: '80px 0',
            border: '1.5px dashed rgba(255,255,255,0.08)',
            borderRadius: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <Package size={40} color="rgba(255,255,255,0.15)" />
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>
              No Active Orders
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              Standby for incoming orders…
            </p>
          </div>
        )}

        {/* ══ ORDER CARDS ═════════════════════════════════════════════════ */}
        {orders.map((order) => {
          const s = getStatus(order.status);

          return (
            <div
              key={order._id}
              style={{
                width: '100%',
                /* The ENTIRE card is the solid vivid colour — exactly like the
                   blue chat bubble in the screenshot */
                background: s.solid,
                borderRadius: 22,
                overflow: 'hidden',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >

              {/* ── Card header ── */}
              <div style={{
                padding: '18px 20px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{
                    margin: 0, fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.6)', marginBottom: 4,
                  }}>
                    Order ID
                  </p>
                  <p style={{
                    margin: 0, fontFamily: 'monospace',
                    fontSize: 22, fontWeight: 900, color: '#ffffff',
                    letterSpacing: '-0.01em',
                  }}>
                    #{order._id.slice(-6).toUpperCase()}
                  </p>
                </div>

                {/* Status badge — slightly darker solid */}
                <span style={{
                  padding: '6px 14px', borderRadius: 10,
                  background: s.solidDeep,
                  color: '#ffffff',
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {order.status || 'Pending'}
                </span>
              </div>

              {/* ── Items ── */}
              <div style={{ padding: '16px 20px 12px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                }}>
                  <ShoppingBag size={13} color="rgba(255,255,255,0.6)" />
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.6)',
                  }}>
                    Items Ordered
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Quantity chip */}
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: s.solidDeep,
                          border: '1px solid rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 900, color: '#ffffff',
                          flexShrink: 0,
                        }}>
                          {item.quantity}
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
                          {item.name}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 14,
                        fontWeight: 700, color: '#ffffff',
                      }}>
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Total ── */}
              <div style={{
                margin: '0 20px 16px',
                background: s.solidDeep,
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.65)',
                }}>
                  Total Amount
                </span>
                <span style={{
                  fontFamily: 'monospace', fontSize: 24,
                  fontWeight: 900, color: '#ffffff',
                }}>
                  ₹{order.totalAmount}
                </span>
              </div>

              {/* ── Customer Details box — darker shade of same colour ── */}
              <div style={{
                margin: '0 16px 16px',
                background: s.solidDark,
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.18)',
                overflow: 'hidden',
              }}>
                {/* Box header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.75)',
                  }}>
                    Customer Details
                  </span>
                  {order.customerDetails?.fulfillmentType && (
                    <span style={{
                      fontSize: 9, fontWeight: 800,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: '#ffffff',
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      padding: '4px 10px', borderRadius: 8,
                    }}>
                      {order.customerDetails.fulfillmentType}
                    </span>
                  )}
                </div>

                {/* Rows */}
                <div style={{
                  padding: '16px', display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  {order.customerDetails?.contactName && (
                    <DetailRow icon={User} label="Name" value={order.customerDetails.contactName} />
                  )}
                  {order.customerDetails?.contactNumber && (
                    <DetailRow icon={Phone} label="Phone" value={order.customerDetails.contactNumber} mono />
                  )}
                  {order.customerDetails?.address && (
                    <DetailRow icon={MapPin} label="Address" value={order.customerDetails.address} />
                  )}

                  {/* Timestamp */}
                  <div style={{
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <Clock size={12} color="rgba(255,255,255,0.45)" />
                    <span style={{
                      fontFamily: 'monospace', fontSize: 11,
                      color: 'rgba(255,255,255,0.45)',
                    }}>
                      {new Date(order.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </main>
    </div>
  );
}