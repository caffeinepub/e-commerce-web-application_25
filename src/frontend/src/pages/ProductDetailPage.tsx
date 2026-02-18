import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetProduct } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const { data: product, isLoading } = useGetProduct(productId);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-4 h-10 w-32" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Button className="mt-4" onClick={() => navigate({ to: '/products' })}>
          Back to Products
        </Button>
      </div>
    );
  }

  const price = (Number(product.priceCents) / 100).toFixed(2);
  const images = product.images.length > 0 
    ? product.images.map(img => img.getDirectURL())
    : ['/assets/generated/product-placeholder-electronics.dim_400x400.png'];

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/products' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              {product.featured && <Badge>Featured</Badge>}
              {product.available ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>

          <div className="text-4xl font-bold text-primary">${price}</div>

          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {product.available && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
