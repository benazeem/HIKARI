import type {ButtonHTMLAttributes, AnchorHTMLAttributes} from 'react';

type ButtonVariant = 'default' | 'ghost' | 'outline';
type ButtonSize = 'default' | 'icon';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function buttonClassName({
  className,
  size = 'default',
  variant = 'default',
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} = {}) {
  return cx('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className);
}

export function Button({
  className,
  size = 'default',
  variant = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={buttonClassName({className, size, variant})}
      {...props}
    />
  );
}

export function ButtonLink({
  children,
  className,
  size = 'default',
  variant = 'default',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return (
    <a className={buttonClassName({className, size, variant})} {...props}>
      {children}
    </a>
  );
}
