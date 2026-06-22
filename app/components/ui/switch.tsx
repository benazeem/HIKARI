import type {ButtonHTMLAttributes, ReactNode} from 'react';

export function Switch({
  checked,
  checkedIcon,
  uncheckedIcon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  checked: boolean;
  checkedIcon?: ReactNode;
  uncheckedIcon?: ReactNode;
}) {
  return (
    <button
      aria-checked={checked}
      className="ui-switch"
      role="switch"
      type="button"
      {...props}
    >
      <span className="ui-switch-icon ui-switch-icon-off">{uncheckedIcon}</span>
      <span className="ui-switch-thumb" />
      <span className="ui-switch-icon ui-switch-icon-on">{checkedIcon}</span>
    </button>
  );
}
