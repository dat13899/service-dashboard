/** GlassPanel wrapper with optional padding.
 * @param {{ children, className, padding, ...rest }} props
 */
export default function GlassPanel({ children, className = '', padding = 'p-lg', ...rest }) {
  return (
    <div className={`glass-panel ${padding} ${className}`} {...rest}>
      {children}
    </div>
  );
}
