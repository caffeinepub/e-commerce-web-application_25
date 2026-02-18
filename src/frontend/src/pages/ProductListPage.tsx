import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllProducts, useGetCategories, useSearchProducts } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { Product } from '../backend';

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.images.length > 0 ? product.images[0].getDirectURL() : '/assets/generated/product-placeholder-electronics.dim_400x400.png';
  const price = (Number(product.priceCents) / 100).toFixed(2);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden bg-muted">
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="line-clamp-2 text-lg">{product.name}</CardTitle>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <p className="mt-2 text-2xl font-bold text-primary">${price}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link to="/products/$productId" params={{ productId: product.id }}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-8 w-1/3" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function ProductListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: allProducts, isLoading: productsLoading } = useGetAllProducts();
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const { data: searchResults } = useSearchProducts(searchTerm);

  const filteredProducts = searchTerm
    ? searchResults || []
    : selectedCategory === 'all'
      ? allProducts || []
      : allProducts?.filter((p) => p.categoryId === selectedCategory) || [];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">All Products</h1>
        <p className="mt-2 text-muted-foreground">Browse our complete collection</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
