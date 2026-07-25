/** Badge component for tags/status.
 * @param {{ children, variant, ...rest }} props
 * variant: 'default' | 'accent' | 'green' | 'red' | 'amber'
 */
export default function Badge({ children, variant = 'default', ...rest }) {
  const variants = {
    default: 'badge',
    accent: 'badge badge-accent',
    green: 'badge badge-green',
    red: 'badge badge-red',
    amber: 'badge badge-amber',
  };
  return (
    <span className={variants[variant] || variants.default} {...rest}>
      {children}
    </span>
  );
}
