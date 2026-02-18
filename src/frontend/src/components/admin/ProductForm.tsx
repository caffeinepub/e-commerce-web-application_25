import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGetProduct, useGetCategories, useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Product, ExternalBlob } from '../../backend';
import { X, Upload } from 'lucide-react';

interface ProductFormProps {
  productId: string | null;
  onClose: () => void;
}

export default function ProductForm({ productId, onClose }: ProductFormProps) {
  const { data: product } = useGetProduct(productId || '');
  const { data: categories } = useGetCategories();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceCents: '',
    categoryId: '',
    available: true,
    featured: false,
  });
  const [images, setImages] = useState<ExternalBlob[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        priceCents: (Number(product.priceCents) / 100).toString(),
        categoryId: product.categoryId,
        available: product.available,
        featured: product.featured,
      });
      setImages(product.images);
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImages: ExternalBlob[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        newImages.push(blob);
      }
      setImages([...images, ...newImages]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    const priceCents = Math.round(parseFloat(formData.priceCents) * 100);
    if (isNaN(priceCents) || priceCents < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const productData: Product = {
      id: productId || `product-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      priceCents: BigInt(priceCents),
      categoryId: formData.categoryId,
      images,
      available: formData.available,
      featured: formData.featured,
    };

    try {
      if (productId) {
        await updateProduct.mutateAsync(productData);
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync(productData);
        toast.success('Product added successfully');
      }
      onClose();
    } catch (error) {
      console.error('Product save error:', error);
      toast.error('Failed to save product');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{productId ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priceCents">Price ($)</Label>
              <Input
                id="priceCents"
                name="priceCents"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceCents}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Product Images</Label>
            <div className="grid gap-4 sm:grid-cols-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                  <img src={img.getDirectURL()} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-xs text-muted-foreground">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="available" className="cursor-pointer">Available for Purchase</Label>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="featured" className="cursor-pointer">Featured Product</Label>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={addProduct.isPending || updateProduct.isPending || uploading}>
              {addProduct.isPending || updateProduct.isPending ? 'Saving...' : 'Save Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
