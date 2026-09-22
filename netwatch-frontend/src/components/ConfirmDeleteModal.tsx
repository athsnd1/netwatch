
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemName, itemType = 'item' }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/5 backdrop-blur flex items-center justify-center z-2000">
      <div className="bg-cards border border-bordercol  p-6 max-w-md w-full mx-4 shadow-lg">
        <h3 className="text-lg font-semibold text-textcol font-space mb-2">Delete {itemType}</h3>
        <p className="text-seccol font-brains mb-6">
          Are you sure you want to delete {itemName}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-bordercol text-textcol hover:bg-light transition-colors font-space cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-space cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
