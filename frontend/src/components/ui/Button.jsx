/** Button component with variants.
 * @param {{ children, variant, size, className, disabled, ...rest }} props
 * variant: 'primary' | 'glass' | 'danger' | 'icon'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({ children, variant = 'glass', size, className = '', disabled, ...rest }) {
  const variants = {
    primary: 'btn-primary',
    glass: 'btn-glass',
    danger: 'btn-danger',
    icon: 'btn-icon btn-glass',
  };
  const sizes = { sm: 'btn-sm', md: '', lg: 'btn-lg' };
  return (
    <button
      className={`${variants[variant] || variants.glass} ${sizes[size] || ''} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
