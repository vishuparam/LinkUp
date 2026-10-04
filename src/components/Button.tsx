import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
type Props = HTMLMotionProps<"button"> & { variant?: "primary" | "secondary" };
export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type={type}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      className={`button button-${variant} ${className}`}
      {...props}
    />
  );
}
