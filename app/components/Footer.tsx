import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import {Search} from 'lucide-react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {SearchForm} from '~/components/SearchForm';
import {Button} from '~/components/ui/button';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-brand">
                {header.shop.brand?.logo?.image?.url ? (
                  <img
                    src={header.shop.brand.logo.image.url}
                    alt={header.shop.name}
                  />
                ) : (
                  <strong>{header.shop.name}</strong>
                )}
                {header.shop.description && <p>{header.shop.description}</p>}
              </div>
              {header.shop.primaryDomain?.url && (
                <div className="footer-menu-panel">
                  <FooterSearchWidget />
                  <p className="footer-heading">Explore</p>
                  <FooterMenu
                    menu={footer?.menu || FALLBACK_FOOTER_MENU}
                    primaryDomainUrl={header.shop.primaryDomain.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                </div>
              )}
            </div>
            <div className="footer-bottom">
              <span>{header.shop.name}</span>
              <span>Powered by Shopify Hydrogen</span>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav className="footer-menu" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        if (isSearchUrl(item.url, primaryDomainUrl, publicStoreDomain)) {
          return null;
        }
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function FooterSearchWidget() {
  return (
    <div className="footer-search">
      <p className="footer-heading">Find your merch</p>
      <SearchForm action="/search" className="footer-search-form">
        {({inputRef}) => (
          <>
            <label className="sr-only" htmlFor="footer-search-input">
              Search products
            </label>
            <input
              id="footer-search-input"
              name="q"
              placeholder="Search figures, tees, drops"
              ref={inputRef}
              type="search"
            />
            <Button type="submit" size="icon" aria-label="Search">
              <Search aria-hidden="true" size={18} strokeWidth={2.5} />
            </Button>
          </>
        )}
      </SearchForm>
    </div>
  );
}

function isSearchUrl(
  itemUrl: string,
  primaryDomainUrl: string,
  publicStoreDomain: string,
) {
  const url =
    itemUrl.includes('myshopify.com') ||
    itemUrl.includes(publicStoreDomain) ||
    itemUrl.includes(primaryDomainUrl)
      ? new URL(itemUrl).pathname
      : itemUrl;

  return url === '/search' || url.startsWith('/search?');
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    opacity: isPending ? 0.55 : undefined,
  };
}
