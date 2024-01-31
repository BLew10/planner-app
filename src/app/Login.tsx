import login from "@/actions/user/login";
import styles from "./Login.module.scss"; // Ensure this path is correct
import AnimateWrapper from "@/general/AnimateWrapper";
import TextInput from "@/form/TextInput";

const LoginComponent: React.FC = () => {
  return (
    <AnimateWrapper>
        <form action={login} className={styles.loginForm}>
          <TextInput name="username" label="Username" />
          <TextInput name="password" label="Password" />
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
    </AnimateWrapper>
  );
};

export default LoginComponent;
