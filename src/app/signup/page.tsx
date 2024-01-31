import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.scss";
import Login from "./SignUp";

export default function SignUpPage() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.header}>
        <h2>Calendar Planner</h2>
        <Image
          src="/images/logo.png"
          alt="Calendar Planner Logo"
          width={100}
          height={100}
        />
      </div>
      <div className={styles.toggleLogin}>
        <p>Already have an accoutn?</p>
        <Link href="/" className={styles.toggleLoginButton}>
          login
        </Link>
      </div>
      <div className={styles.componentWrapper}>
        <Login />
      </div>
    </div>
  );
}
