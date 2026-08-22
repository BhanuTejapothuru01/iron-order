import React from 'react';
import { ShoppingBag, Store, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import type { UserRole } from '../../types';

interface PortalSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPortal: 'customer' | 'shop' | 'admin';
  onSelectPortal: (portal: 'customer' | 'shop' | 'admin') => void;
}

export const PortalSelectorModal: React.FC<PortalSelectorModalProps> = ({
  isOpen,
  onClose,
  currentPortal,
  onSelectPortal,
}) => {
  if (!isOpen) return null;

  const PORTALS: Array<{
    id: 'customer' | 'shop' | 'admin';
    role: UserRole;
    title: string;
    badge: string;
    badgeColor: string;
    icon: React.ReactNode;
    description: string;
    features: string[];
    gradient: string;
  }> = [
    {
      id: 'customer',
      role: 'customer',
      title: 'Customer Marketplace Portal',
      badge: 'For Customers',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <ShoppingBag className="w-6 h-6 text-brand-600" />,
      description: 'Discover nearby steam press shops & dhobi ghats, order pickup & delivery, and track live status.',
      features: ['GPS & Multi-city shop discovery', 'Doorstep pickup & slot selection', 'Live 5-stage order tracker', 'Rate & review completed orders'],
      gradient: 'from-brand-50 to-emerald-50/40 border-brand-200 hover:border-brand-400',
    },
    {
      id: 'shop',
      role: 'owner',
      title: 'Laundry Shop Partner Portal',
      badge: 'For Shop Owners',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <Store className="w-6 h-6 text-blue-600" />,
      description: 'Accept incoming ironing orders, process garment status, manage service rate lists, & track net earnings.',
      features: ['Live incoming order queue', 'Accept / Reject & Status stepper', 'Service catalog CRUD & pricing', 'Earnings & 10% commission accounting'],
      gradient: 'from-blue-50 to-indigo-50/40 border-blue-200 hover:border-blue-400',
    },
    {
      id: 'admin',
      role: 'admin',
      title: 'Platform Admin Console Portal',
      badge: 'For Platform Admins',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      description: 'Control platform operations, approve/reject partner shops, audit global transactions, & settle commissions.',
      features: ['Platform GMV & revenue analytics', 'Partner shop onboard approvals', 'Global orders audit ledger', 'Commission settlement bookkeeping'],
      gradient: 'from-purple-50 to-slate-50 border-purple-200 hover:border-purple-400',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-5 p-1">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Iron Order Gateway
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Select Portal Experience</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Portals Cards */}
        <div className="grid grid-cols-1 gap-3.5">
          {PORTALS.map((portal) => {
            const isActive = currentPortal === portal.id;

            return (
              <div
                key={portal.id}
                onClick={() => {
                  onSelectPortal(portal.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer bg-gradient-to-r ${portal.gradient} relative overflow-hidden group shadow-sm hover:shadow-md ${
                  isActive ? 'ring-2 ring-brand-500 shadow-md' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center flex-shrink-0">
                      {portal.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors">
                          {portal.title}
                        </h3>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${portal.badgeColor}`}>
                          {portal.badge}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-extrabold uppercase bg-brand-600 text-white px-2 py-0.5 rounded-md">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {portal.description}
                      </p>

                      {/* Feature Bullets */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500 font-semibold">
                        {portal.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="text-brand-500 font-bold">•</span>
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200 mt-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
