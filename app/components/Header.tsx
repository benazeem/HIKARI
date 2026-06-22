import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import {Menu as MenuIcon, Moon, Search, ShoppingBag, Sun} from 'lucide-react';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {Button, ButtonLink} from '~/components/ui/button';
import {Switch} from '~/components/ui/switch';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';
type MenuItem = NonNullable<HeaderProps['header']['menu']>['items'][number];

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const logoUrl = shop.brand?.logo?.image?.url;

  return (
    <header className="header">
      <NavLink
        className="header-logo"
        prefetch="intent"
        to="/"
        style={activeLinkStyle}
        end
      >
        {logoUrl ? (
          <img src={logoUrl} alt={shop.name} />
        ) : (
          <span>{shop.name}</span>
        )}
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();
  const menuItems = (menu || FALLBACK_HEADER_MENU).items;

  return (
    <nav
      className={className}
      role="navigation"
      aria-label={viewport === 'mobile' ? 'Mobile menu' : 'Main menu'}
    >
      {viewport === 'mobile' && (
        <NavLink
          className="header-menu-item"
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {menuItems.map((item) => (
        <HeaderMenuItem
          item={item}
          key={item.id}
          primaryDomainUrl={primaryDomainUrl}
          publicStoreDomain={publicStoreDomain}
          viewport={viewport}
          onNavigate={close}
        />
      ))}
    </nav>
  );
}

function HeaderMenuItem({
  item,
  primaryDomainUrl,
  publicStoreDomain,
  viewport,
  onNavigate,
}: {
  item: MenuItem;
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  viewport: Viewport;
  onNavigate: () => void;
}) {
  if (!item.url) return null;

  const childItems = 'items' in item ? item.items : [];
  const hasChildren = Boolean(childItems?.length);

  return (
    <div className={`header-menu-group ${hasChildren ? 'has-children' : ''}`}>
      <MenuLink
        className="header-menu-item"
        item={item}
        onNavigate={onNavigate}
        primaryDomainUrl={primaryDomainUrl}
        publicStoreDomain={publicStoreDomain}
      />
      {hasChildren && (
        <div className={`header-submenu header-submenu-${viewport}`}>
          {childItems.map((child) => (
            <MenuLink
              className="header-submenu-item"
              item={child}
              key={child.id}
              onNavigate={onNavigate}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuLink({
  className,
  item,
  primaryDomainUrl,
  publicStoreDomain,
  onNavigate,
}: {
  className: string;
  item: MenuItem;
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  onNavigate: () => void;
}) {
  if (!item.url) return null;

  const url = getMenuUrl(item.url, primaryDomainUrl, publicStoreDomain);

  if (!url.startsWith('/')) {
    return (
      <a
        className={className}
        href={url}
        onClick={onNavigate}
        rel="noopener noreferrer"
        target="_blank"
      >
        {item.title}
      </a>
    );
  }

  return (
    <NavLink
      className={className}
      end
      onClick={onNavigate}
      prefetch="intent"
      style={activeLinkStyle}
      to={url}
    >
      {item.title}
    </NavLink>
  );
}

function getMenuUrl(
  itemUrl: string,
  primaryDomainUrl: string,
  publicStoreDomain: string,
) {
  if (
    itemUrl.includes('myshopify.com') ||
    itemUrl.includes(publicStoreDomain) ||
    itemUrl.includes(primaryDomainUrl)
  ) {
    return new URL(itemUrl).pathname;
  }

  return itemUrl;
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <ThemeToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <Button
      className="header-menu-mobile-toggle"
      variant="ghost"
      size="icon"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      <MenuIcon aria-hidden="true" size={21} strokeWidth={2.4} />
    </Button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <Button
      className="header-icon-button"
      variant="ghost"
      size="icon"
      onClick={() => open('search')}
      aria-label="Open search"
    >
      <Search aria-hidden="true" size={20} strokeWidth={2.4} />
    </Button>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('hikari-theme');
    const preferredTheme =
      storedTheme === 'dark' ||
      (!storedTheme &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light';

    setTheme(preferredTheme);
    document.documentElement.dataset.theme = preferredTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('hikari-theme', nextTheme);
  };

  return (
    <Switch
      checked={theme === 'dark'}
      checkedIcon={<Moon aria-hidden="true" size={14} strokeWidth={2.5} />}
      uncheckedIcon={<Sun aria-hidden="true" size={14} strokeWidth={2.5} />}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    />
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <ButtonLink
      className="cart-toggle"
      href="/cart"
      variant="ghost"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      aria-label={`Open cart with ${count} items`}
    >
      <ShoppingBag aria-hidden="true" size={20} strokeWidth={2.4} />
      <span aria-label={`items: ${count}`}>{count}</span>
    </ButtonLink>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
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
