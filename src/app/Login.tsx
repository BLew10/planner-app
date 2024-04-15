"use client";

import React, { useState } from "react";
import login from "@/actions/user/login";
import styles from "./Login.module.scss"; // Ensure this path is correct
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import TextInput from "@/app/(components)/form/TextInput";

const LoginComponent: React.FC = () => {
  const [isHidden, setIsHidden] = useState(true);
  return (
    <AnimateWrapper>
      <form action={login} className={styles.loginForm}>
        <TextInput name="username" label="Username" />
        <TextInput
          name="password"
          label="Password"
          type={isHidden ? "password" : "text"}
        >
          {
            <button type="button" onClick={() => setIsHidden(!isHidden)}>
              {isHidden ? <VscEye className={styles.icon}/> : <VscEyeClosed className={styles.icon}/>}
            </button>
          }
        </TextInput>
        <button type="submit" className={styles.loginButton}>
          Login
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default LoginComponent;
