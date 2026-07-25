/** Input component with glass styling.
 * @param {{ className, ...rest }} props
 */
export default function Input({ className = '', ...rest }) {
  return <input className={`input ${className}`} {...rest} />;
}
