import React from 'react';

function SAPModal({ sapPO, onConfirm, onCancel }) {
  if (!sapPO) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">SAP Purchase Order Draft</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Vendor</label>
              <div className="text-lg font-semibold text-gray-800">{sapPO.vendor}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Vendor Code</label>
              <div className="text-lg font-semibold text-gray-800">{sapPO.vendor_code}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Material</label>
              <div className="text-lg font-semibold text-gray-800">{sapPO.material}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Material Code</label>
              <div className="text-lg font-semibold text-gray-800">{sapPO.material_code}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Quantity</label>
              <div className="text-lg font-semibold text-gray-800">{sapPO.quantity}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Delivery Date</label>
              <div className="text-lg font-semibold text-gray-800">{sapPO.delivery_date}</div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Delivery Location</label>
            <div className="text-lg font-semibold text-gray-800">{sapPO.delivery_location}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Price Basis</label>
            <div className="text-lg font-semibold text-gray-800">{sapPO.price_basis}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Payment Terms</label>
            <div className="text-lg font-semibold text-gray-800">{sapPO.payment_terms}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Quality Specification</label>
            <div className="text-sm text-gray-700">{sapPO.quality_spec}</div>
          </div>

          {sapPO.requires_approval && (
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
              <div className="font-medium">Approval Required: {sapPO.approval_level}</div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirm Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export default SAPModal;
