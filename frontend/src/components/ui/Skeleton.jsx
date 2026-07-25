/** Skeleton loading placeholder.
 * @param {{ width, height, borderRadius, className }} props
 */
export default function Skeleton({ width = '100%', height = '1rem', borderRadius = '6px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}
