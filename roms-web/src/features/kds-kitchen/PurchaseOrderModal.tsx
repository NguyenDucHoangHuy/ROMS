import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, Plus, Trash2, Building, Calendar } from 'lucide-react';
import type { CreateStockReceiptPayload, InventoryItem } from '@/services/modules/inventoryService';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems?: InventoryItem[];
  onSubmit?: (payload: CreateStockReceiptPayload) => Promise<string> | string;
  onSubmitSuccess?: (poNumber: string) => void;
}

interface PurchaseOrderLine {
  id: string;
  inventoryItemId: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  inventoryItems = [],
  onSubmit,
  onSubmitSuccess,
}) => {
  const [supplier, setSupplier] = useState('Artisan Meat Importers Ltd.');
  const [deliveryDate, setDeliveryDate] = useState('2026-09-04');
  const [items, setItems] = useState<PurchaseOrderLine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || items.length > 0 || inventoryItems.length === 0) return;

    setItems(
      inventoryItems.slice(0, 2).map((item, index) => ({
          id: `${item.id}-${index}`,
          inventoryItemId: item.id,
          name: item.name,
          qty: Math.max(1, item.minStockLevel - item.currentStock),
          unit: item.unit,
          price: 0,
        })),
    );
  }, [inventoryItems, isOpen, items.length]);

  if (!isOpen) return null;

  const total = items.reduce((acc, curr) => acc + curr.qty * curr.price, 0);

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleAddLine = () => {
    const firstItem = inventoryItems[0];
    if (!firstItem) return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        inventoryItemId: firstItem.id,
        name: firstItem.name,
        qty: 1,
        unit: firstItem.unit,
        price: 0,
      },
    ]);
  };

  const handleSelectItem = (lineId: string, inventoryItemId: string) => {
    const selected = inventoryItems.find((item) => item.id === inventoryItemId);
    if (!selected) return;

    setItems((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? {
              ...line,
              inventoryItemId: selected.id,
              name: selected.name,
              unit: selected.unit,
            }
          : line,
      ),
    );
  };

  const handleUpdateLine = (lineId: string, key: 'qty' | 'price', value: number) => {
    setItems((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, [key]: Math.max(0, value) } : line,
      ),
    );
  };

  const handleDispatch = async () => {
    const payload: CreateStockReceiptPayload = {
      supplierName: supplier,
      details: items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: item.qty,
        unitPrice: item.price,
      })),
    };

    setIsSubmitting(true);
    try {
      const generatedPO = onSubmit
        ? await onSubmit(payload)
        : `#${Math.floor(1000 + Math.random() * 9000)}-INV`;
      onSubmitSuccess?.(generatedPO);
      setItems([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100/80 rounded-xl text-amber-800">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">New Purchase Order</h2>
              <p className="text-xs text-slate-500">Supplier Replenishment Sheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Supplier
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-slate-800"
              >
                <option>Artisan Meat Importers Ltd.</option>
                <option>Coastal Seafood Wholesalers</option>
                <option>Valley Organic Farms</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Expected Delivery
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Order Items
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                disabled={inventoryItems.length === 0}
                className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Ingredient
              </button>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between text-xs bg-white">
                  <select
                    value={item.inventoryItemId}
                    onChange={(event) => handleSelectItem(item.id, event.target.value)}
                    className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-semibold text-slate-800"
                  >
                    {inventoryItems.map((inventoryItem) => (
                      <option key={inventoryItem.id} value={inventoryItem.id}>
                        {inventoryItem.name}
                      </option>
                    ))}
                  </select>
                  <div className="ml-3 flex items-center gap-3 text-slate-600">
                    <input
                      type="number"
                      min={0}
                      value={item.qty}
                      onChange={(event) => handleUpdateLine(item.id, 'qty', Number(event.target.value))}
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right font-bold text-slate-900"
                    />
                    <span className="w-10 font-bold text-slate-500">{item.unit}</span>
                    <input
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={(event) => handleUpdateLine(item.id, 'price', Number(event.target.value))}
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right font-medium text-slate-700"
                    />
                    <span className="w-20 text-right font-bold text-slate-900">
                      ${item.qty * item.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-slate-300 hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Receiving Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Deliver directly to Walk-in 1 before morning prep shift (7:00 AM)..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Estimated Total
            </span>
            <span className="text-xl font-serif font-bold text-slate-900">
              ${total.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatch}
              disabled={items.length === 0 || isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              {isSubmitting ? 'Dispatching...' : 'Dispatch Purchase Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;
