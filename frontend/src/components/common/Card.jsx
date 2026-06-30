export default function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag className={`card ${className}`} {...props}>
      {children}
    </Tag>
  );
}
