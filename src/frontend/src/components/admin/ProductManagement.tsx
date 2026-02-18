import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllProducts, useGetCategories } from '../../hooks/useQueries';
import { Plus } from 'lucide-react';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import CategoryManagement from './CategoryManagement';

export default function ProductManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const { data: products, isLoading } = useGetAllProducts();
  const { data: categories } = useGetCategories();

  const handleEdit = (productId: string) => {
    setEditingProductId(productId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProductId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <CategoryManagement />

      {showForm ? (
        <ProductForm productId={editingProductId} onClose={handleCloseForm} />
      ) : (
        <ProductList products={products || []} onEdit={handleEdit} isLoading={isLoading} />
      )}
    </div>
  );
}
