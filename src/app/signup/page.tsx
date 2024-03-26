import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.scss";
import Login from "./SignUp";

export default function SignUpPage() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Calendar Planner</h2>
        <Image
          src="/images/logo.png"
          alt="Calendar Planner Logo"
          width={100}
          height={100}
        />
      </div>
      <div className={styles.toggleLogin}>
        <p className={styles.toggleLoginText}>Already have an account?</p>
        <Link href="/" className={styles.toggleLoginButton}>
          Login
        </Link>
      </div>
      <div className={styles.componentWrapper}>
        <Login />
      </div>
    </div>
  );
}
