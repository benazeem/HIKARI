import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

type GalleryImage = NonNullable<ProductVariantFragment['image']>;

export function ProductImage({
  image,
  images = [],
}: {
  image: ProductVariantFragment['image'];
  images?: GalleryImage[];
}) {
  const galleryImages = [
    ...new Map(
      [image, ...images]
        .filter((galleryImage): galleryImage is GalleryImage =>
          Boolean(galleryImage),
        )
        .map((galleryImage) => [galleryImage.id, galleryImage]),
    ).values(),
  ];

  if (!galleryImages.length) {
    return <div className="product-image" />;
  }

  const [featuredImage, ...detailImages] = galleryImages;

  return (
    <div className="product-gallery">
      <Image
        alt={featuredImage.altText || 'Product Image'}
        aspectRatio="1/1"
        className="product-gallery-featured"
        data={featuredImage}
        key={featuredImage.id}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
      {detailImages.length > 0 && (
        <div className="product-gallery-grid" aria-label="Product images">
          {detailImages.map((galleryImage, index) => (
            <Image
              alt={galleryImage.altText || `Product image ${index + 2}`}
              aspectRatio="1/1"
              data={galleryImage}
              key={galleryImage.id}
              loading={index < 2 ? 'eager' : 'lazy'}
              sizes="(min-width: 45em) 18vw, 45vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}
