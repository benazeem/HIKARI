import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';

type FeaturedStripProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    id: string;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hikari | Anime Merch Store'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: collections.nodes[0],
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const featuredProducts =
    (
      collection as FeaturedCollectionFragment & {
        products?: {nodes?: FeaturedStripProduct[]};
      }
    ).products?.nodes ?? [];

  return (
    <section className="home-hero">
      <Link
        className="featured-collection"
        to={`/collections/${collection.handle}`}
        prefetch="intent"
      >
        {collection.image && (
          <div className="featured-collection-image">
            <Image
              data={collection.image}
              sizes="100vw"
              alt={collection.image.altText || collection.title}
            />
          </div>
        )}
        <div className="featured-collection-copy">
          <p className="eyebrow">Anime merch drop</p>
          <h1>{collection.title}</h1>
          <p>
            Figures, apparel, collectibles, and everyday gear pulled straight
            from the shop catalog.
          </p>
          <span className="button-link">Shop the collection</span>
        </div>
      </Link>

      {featuredProducts.length ? (
        <div className="hero-product-strip">
          {featuredProducts.slice(0, 3).map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.handle}`}
              prefetch="intent"
            >
              {product.featuredImage && (
                <Image
                  data={product.featuredImage}
                  alt={product.featuredImage.altText || product.title}
                  aspectRatio="1/1"
                  sizes="160px"
                />
              )}
              <span>{product.title}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section
      className="recommended-products"
      aria-labelledby="recommended-products"
    >
      <div className="section-heading">
        <p className="eyebrow">Fresh from Shopify</p>
        <h2 id="recommended-products">Latest merch</h2>
      </div>
      <Suspense fallback={<div className="loading-card">Loading products...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    description
    image {
      id
      url
      altText
      width
      height
    }
    handle
    products(first: 3) {
      nodes {
        id
        title
        handle
        featuredImage {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    vendor
    handle
    description
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
