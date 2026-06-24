import React, { useState } from 'react';
import Barcode from 'react-barcode';
import { FaTimes, FaPrint, FaCheckSquare, FaSquare } from 'react-icons/fa';

const BarcodePrinter = ({ products, onClose }) => {
  const printableProducts = products.filter(p => p.barcode);
  const [selectedProductIds, setSelectedProductIds] = useState(
    printableProducts.map(p => p.id)
  );

  const toggleProduct = (id) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedProducts = printableProducts.filter(p => selectedProductIds.includes(p.id));

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center p-4 z-[100] print:bg-white print:p-0 print:absolute print:inset-0 print:block">
      
      {/* Non-Printable UI Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden print:hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaPrint className="mr-3 text-indigo-600" /> Print Product Labels
            </h2>
            <p className="text-sm text-gray-500 mt-1">Select the products you want to generate physical barcode labels for.</p>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 transition">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {printableProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer flex items-center space-x-4 transition bg-white shadow-sm ${
                  selectedProductIds.includes(product.id) ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="text-indigo-600">
                  {selectedProductIds.includes(product.id) ? <FaCheckSquare className="text-2xl" /> : <FaSquare className="text-2xl text-gray-200" />}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{product.barcode}</p>
                </div>
              </div>
            ))}
            {printableProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No products with barcodes found in your inventory.
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 bg-white flex justify-between items-center">
          <span className="text-base font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
            {selectedProducts.length} labels selected
          </span>
          <div className="space-x-3">
            <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition">
              Cancel
            </button>
            <button 
              onClick={handlePrint}
              disabled={selectedProducts.length === 0}
              className={`px-6 py-2.5 rounded-lg text-white flex items-center font-bold transition shadow-lg ${
                selectedProducts.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
              }`}
            >
              <FaPrint className="mr-2" /> Print Labels
            </button>
          </div>
        </div>
      </div>

      {/* Printable Area - Only visible during print */}
      <div className="hidden print:block w-full bg-white text-black pt-8">
        <div className="grid grid-cols-3 gap-x-4 gap-y-10 place-items-center">
          {selectedProducts.map(product => (
            <div key={product.id} className="flex flex-col items-center justify-center break-inside-avoid text-center border border-dashed border-gray-300 p-4 rounded-lg w-64">
              <span className="text-sm font-bold truncate w-full mb-1">{product.name}</span>
              <span className="text-xs font-semibold text-gray-800 mb-2">₹{product.price} - {product.category.toUpperCase()}</span>
              <Barcode 
                value={product.barcode} 
                width={1.8} 
                height={60} 
                fontSize={16} 
                margin={0} 
                displayValue={true} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarcodePrinter;
