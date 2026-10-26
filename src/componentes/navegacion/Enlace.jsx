import { Link } from "react-router-dom";
export default function Enlace({ href, children, ...props }) {
  return (
    <Link to={href} {...props}>
      {children}
    </Link>
  );
}
