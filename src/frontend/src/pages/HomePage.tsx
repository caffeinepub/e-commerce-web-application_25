import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetFeaturedProducts, useGetAllProducts } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
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
        <Skeleton className="mt-2 h-8 w-1/3" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function HomePage() {
  const { data: featuredProducts, isLoading: featuredLoading } = useGetFeaturedProducts();
  const { data: allProducts, isLoading: allLoading } = useGetAllProducts();

  const popularProducts = allProducts?.slice(0, 4) || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container py-20 md:py-32">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Discover Amazing Products
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Shop the latest trends and find everything you need in one place. Quality products at unbeatable prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/products">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg shadow-2xl">
              <img
                src="/assets/generated/hero-banner.dim_1200x400.png"
                alt="Hero Banner"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="mt-2 text-muted-foreground">Handpicked items just for you</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/products">View All</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : featuredProducts?.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* Popular Products */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Popular Products</h2>
            <p className="mt-2 text-muted-foreground">Trending items everyone loves</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {allLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
              : popularProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
