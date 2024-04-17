"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import login, { LoginData } from "@/actions/user/login";
import styles from "./Login.module.scss"; // Ensure this path is correct
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import TextInput from "@/app/(components)/form/TextInput";

const LoginComponent: React.FC = () => {
  const router = useRouter()

  const [isHidden, setIsHidden] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data: LoginData = {
      username: event.currentTarget.username.value,
      password: event.currentTarget.password.value,
    };
    setRequesting(true)
    const res = await login(data);
    setRequesting(false)
    if (res && res.error) {
      setError(res.error as string)
    } else if (res && res.success) {
      router.push('/dashboard')
    }
  };

  return (
    <AnimateWrapper>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <TextInput name="username" label="Username" />
        <TextInput
          name="password"
          label="Password"
          type={isHidden ? "password" : "text"}
        >
          {
            <button type="button" onClick={() => setIsHidden(!isHidden)}>
              {isHidden ? (
                <VscEye className={styles.icon} />
              ) : (
                <VscEyeClosed className={styles.icon} />
              )}
            </button>
          }
        </TextInput>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.loginButton}>
          {!requesting ? 'Login' : 'Logging in...' }
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default LoginComponent;
