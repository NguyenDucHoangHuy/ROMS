import React from 'react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface ExpediteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ExpediteOrderModal: React.FC<ExpediteOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-rose-100 overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Expedite Emergency Order?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              This triggers high-priority dispatch with courier vendors for <strong>A5 Wagyu</strong> and <strong>Perigord Truffles</strong>.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3.5 text-left border border-slate-200/70 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Service Carrier:</span>
              <span className="font-bold text-slate-800">Direct Express Delivery</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Delivery:</span>
              <span className="font-bold text-rose-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Within 90 minutes
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Priority</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpediteOrderModal;