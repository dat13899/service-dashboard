/** Card component with glass effect.
 * @param {{ children, hover, className, onClick, ...rest }} props
 */
export default function Card({ children, hover = false, className = '', ...rest }) {
  return (
    <div className={`${hover ? 'card-hover' : 'card'} ${className}`} {...rest}>
      {children}
    </div>
  );
}
