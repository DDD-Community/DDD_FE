import styles from "./DDDLogo.module.css";
import type { SVGProps } from "react";

export const DDDLogo = () => {
  return (
    <div className={styles.relative}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={styles[`spread${["First", "Second", "Third"][index]}`]}
        >
          <D
            className={`${styles.dddLogo} ${styles[`${["first", "second", "third"][index]}Shadow`]}`}
            strokeColor="#909090"
          />
          <D
            className={`${styles.dddLogo} ${styles[`${["first", "second", "third"][index]}D`]}`}
            strokeColor="#ffffff"
          />
        </div>
      ))}
    </div>
  );
};

type DProps = {
  className?: string;
  strokeColor?: string;
} & SVGProps<SVGSVGElement>;

const D = ({ className, strokeColor = "#ffffff", ...props }: DProps) => {
  return (
    <svg
      width="128"
      height="108"
      viewBox="0 0 64 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M 12 8 L 48 8 L 48 42 L 12 42"
        stroke={strokeColor}
        strokeWidth="17"
        strokeLinecap="square"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
