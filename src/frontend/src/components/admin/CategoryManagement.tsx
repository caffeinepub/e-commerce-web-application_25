import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetCategories, useAddCategory } from '../../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Category } from '../../backend';

export default function CategoryManagement() {
  const { data: categories } = useGetCategories();
  const addCategory = useAddCategory();
  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const category: Category = {
      id: `category-${Date.now()}`,
      name: categoryName.trim(),
    };

    try {
      await addCategory.mutateAsync(category);
      toast.success('Category added successfully');
      setCategoryName('');
      setShowForm(false);
    } catch (error) {
      console.error('Category add error:', error);
      toast.error('Failed to add category');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
            <Button type="submit" disabled={addCategory.isPending}>
              {addCategory.isPending ? 'Adding...' : 'Add'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </form>
        )}
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
